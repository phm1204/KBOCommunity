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
  },
  logger: false,  // Socket.IO 로그 비활성화
  transports: ['websocket']  // WebSocket만 사용
});

app.use(cors({
  origin: "*",  // 모든 도메인에서의 접근 허용
  methods: ["GET", "POST", "PATCH", "DELETE"]
}));
app.use(express.json());

let latestData = [];
let latestTeamRankings = []; // 팀 순위 데이터 저장
let lastRankingUpdateDate = null; // 마지막 순위 업데이트 날짜

// 사용자 정보를 저장할 객체 (예: socket.id -> { username: '...' })
const users = {};

io.on('connection', (socket) => {
  // console.log(`⚡: ${socket.id} user just connected!`);

  socket.on('joinRoom', ({ username, room }) => {
    socket.join(room);
    users[socket.id] = { username };
    // console.log(`${username} joined room: ${room}`);
    io.to(room).emit('receiveMessage', { user: 'System', text: `${username}님이 입장하셨습니다.` });
  });

  socket.on('sendMessage', ({ room, text }) => {
    const user = users[socket.id];
    if (user) {
      // console.log(`Message from ${user.username} in ${room}: ${text}`);
      io.to(room).emit('receiveMessage', { user: user.username, text: text });
    }
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      // console.log(`💔: ${user.username} disconnected`);
      delete users[socket.id];
    } else {
      // console.log(`💔: ${socket.id} disconnected`);
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

const fetchTeamRankingsFromPython = () => {
  return new Promise((resolve, reject) => {
    const py = spawn("python", ["team_crawler.py"]);
    let raw = [];

    py.stdout.on("data", chunk => raw.push(chunk));
    py.stderr.on("data", err => console.error("🐍 [팀 순위 크롤러] stderr:", err.toString()));
    py.on("close", () => {
      const buffer = Buffer.concat(raw);
      const decoded = iconv.decode(buffer, "utf-8");
      try {
        const json = JSON.parse(decoded);
        resolve(json);
      } catch (e) {
        console.error("❌ [팀 순위 크롤러] JSON 파싱 실패:", e);
        reject(e);
      }
    });
  });
};

app.get("/games", (req, res) => {
  res.json(latestData);
});

app.get("/team-rankings", (req, res) => {
  res.json(latestTeamRankings);
});

setInterval(async () => {
  try {
    const newData = await fetchGamesFromPython();
    if (JSON.stringify(latestData) !== JSON.stringify(newData)) {
      latestData = newData;
      io.emit("updateGames", latestData);
      console.log("📡 실시간 전송 완료");
    }

    // 모든 경기가 '종료'되었는지 확인
    const allGamesEnded = newData.every(game => game.status?.includes('종료'));
    const today = new Date();
    const todayDateStr = today.toISOString().slice(0, 10); // YYYY-MM-DD

    // 모든 경기가 종료되었고, 오늘 아직 팀 순위가 업데이트되지 않았다면
    if (allGamesEnded && lastRankingUpdateDate !== todayDateStr) {
      console.log("모든 경기가 종료되었습니다. 팀 순위를 업데이트합니다.");
      const newTeamRankings = await fetchTeamRankingsFromPython();
      if (JSON.stringify(latestTeamRankings) !== JSON.stringify(newTeamRankings)) {
        latestTeamRankings = newTeamRankings;
        // 클라이언트에게 팀 순위 업데이트 알림 (필요시)
        io.emit("updateTeamRankings", latestTeamRankings);
        console.log("🏆 팀 순위 실시간 전송 완료");
      }
      lastRankingUpdateDate = todayDateStr; // 오늘 업데이트 완료로 표시
    }

  } catch (e) {
    console.error("⛔ 실시간 크롤링 실패:", e);
  }
}, 5000);

server.listen(5000, async () => {
  console.log("✅ 서버 실행 중: http://localhost:5000");
  // 서버 시작 시 초기 게임 데이터 로드
  try {
    latestData = await fetchGamesFromPython();
    io.emit("updateGames", latestData);
    console.log("✅ 초기 게임 데이터 로드 완료");

    // 서버 시작 시 초기 팀 순위 데이터 로드 (필요시)
    latestTeamRankings = await fetchTeamRankingsFromPython();
    console.log("✅ 초기 팀 순위 데이터 로드 완료");

  } catch (e) {
    console.error("❌ 초기 데이터 로드 실패:", e);
  }
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