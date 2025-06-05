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
  cors: { 
    origin: "*",  // 모든 도메인에서의 접근 허용
    methods: ["GET", "POST"] 
  }
});

app.use(cors({
  origin: "*",  // 모든 도메인에서의 접근 허용
  methods: ["GET", "POST", "PATCH", "DELETE"]
}));
app.use(express.json());

let latestData = [];

// 사용자 정보를 저장할 객체 (예: socket.id -> { username: '...' })
const users = {};

io.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  // 클라이언트가 방에 참여할 때
  socket.on('joinRoom', ({ username, room }) => {
    socket.join(room);
    users[socket.id] = { username }; // 사용자 정보 저장
    console.log(`${username} joined room: ${room}`);
    // 방에 있는 모든 사용자에게 알림 (선택 사항)
    io.to(room).emit('receiveMessage', { user: 'System', text: `${username}님이 입장하셨습니다.` });
  });

  // 클라이언트가 메시지를 보낼 때
  socket.on('sendMessage', ({ room, text }) => {
    const user = users[socket.id];
    if (user) {
      console.log(`Message from ${user.username} in ${room}: ${text}`);
      // 메시지를 보낸 클라이언트를 포함하여 방에 있는 모든 클라이언트에게 메시지 전송
      io.to(room).emit('receiveMessage', { user: user.username, text: text });
    }
  });

  // 클라이언트 연결 해제 시
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      console.log(`💔: ${user.username} disconnected`);
      // 사용자가 어떤 방에 있었는지 찾아서 퇴장 알림 (필요시 구현)
      // 현재는 간단히 콘솔에만 표시
      delete users[socket.id]; // 사용자 정보 삭제
    } else {
       console.log(`💔: ${socket.id} disconnected`);
    }
  });
});

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
      res.json({ 
        message: '로그인 성공', 
        token, 
        username: user.username,
        myteam: user.myteam || null 
      });
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