const express = require("express");
const cors = require("cors");
const http = require("http");
const { spawn } = require("child_process");
const iconv = require("iconv-lite");
const { Server } = require("socket.io");
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET"] }
});

app.use(cors());
app.use(express.json());

let latestData = [];

const fetchGamesFromPython = () => {
  return new Promise((resolve, reject) => {
    const py = spawn("python", ["crawler.py"]);
    let raw = [];

    py.stdout.on("data", chunk => raw.push(chunk));
    py.stderr.on("data", err => console.error("🐍 stderr:", err.toString()));
    py.on("close", () => {
      const buffer = Buffer.concat(raw);
      const decoded = iconv.decode(buffer, "utf-8");
      try {
        const json = JSON.parse(decoded);
        resolve(json);
      } catch (e) {
        console.error("❌ JSON 파싱 실패:", e);
        reject(e);
      }
    });
  });
};

app.get("/games", (req, res) => {
  res.json(latestData);
});

setInterval(async () => {
  try {
    const newData = await fetchGamesFromPython();
    if (JSON.stringify(latestData) !== JSON.stringify(newData)) {
      latestData = newData;
      io.emit("updateGames", latestData);
      console.log("📡 실시간 전송 완료");
    }
  } catch (e) {
    console.error("⛔ 실시간 크롤링 실패:", e);
  }
}, 5000);

server.listen(5000, () => {
  console.log("✅ 서버 실행 중: http://localhost:5000");
});

const db = mysql.createConnection({
  host: 'localhost',
  user: 'kbo_user',
  password: 'your_password',
  database: 'kbo_community'
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL 연결 실패:', err.stack);
    return;
  }
  console.log('✅ MySQL에 연결되었습니다.');
});

// 회원가입 API
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: '필수 입력값 누락' });

  try {
    const hashed = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashed],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: '이미 존재하는 아이디' });
          return res.status(500).json({ message: 'DB 오류' });
        }
        res.json({ message: '회원가입 성공' });
      }
    );
  } catch (e) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 로그인 API
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, results) => {
      if (err) return res.status(500).json({ message: 'DB 오류' });
      if (results.length === 0) return res.status(401).json({ message: '존재하지 않는 아이디' });

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: '비밀번호 불일치' });

      const token = jwt.sign({ id: user.id, username: user.username }, 'jwt_secret_key', { expiresIn: '1h' });
      res.json({ message: '로그인 성공', token, myteam: user.myteam || null });
    }
  );
});

// 마이팀 변경 API
app.patch('/user/myteam', (req, res) => {
  const { username, myteam } = req.body;
  if (!username) return res.status(400).json({ message: 'username 필요' });
  db.query(
    'UPDATE users SET myteam = ? WHERE username = ?',
    [myteam, username],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'DB 오류' });
      res.json({ message: '마이팀 변경 성공', myteam });
    }
  );
});

// 계정 삭제 API
app.delete('/user', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ message: 'username 필요' });
  db.query(
    'DELETE FROM users WHERE username = ?',
    [username],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'DB 오류' });
      if (result.affectedRows === 0) return res.status(404).json({ message: '존재하지 않는 아이디' });
      res.json({ message: '계정 삭제 성공' });
    }
  );
});