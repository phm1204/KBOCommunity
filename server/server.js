const express = require("express");
const cors = require("cors");
const http = require("http");
const { spawn } = require("child_process");
const iconv = require("iconv-lite");
const { Server } = require("socket.io");

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
