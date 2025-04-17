// GameCard.js
import React from 'react';

// 경기 상태 판별 함수
const getGameStatus = (game) => {
  const { home_score, away_score, time, status } = game;

  if (status === "경기취소" || status === "취소") return "취소";
  if (status === "경기종료" || status === "종료") return "종료";

  const [hour, minute] = time.split(":").map(Number);
  const now = new Date();
  const gameTime = new Date();
  gameTime.setHours(hour, minute, 0);

  if (now < gameTime) return "예정";
  if (now >= gameTime && now - gameTime < 3 * 60 * 60 * 1000) return "진행 중";
  return "종료됨";
};

// 경기 카드 컴포넌트
const GameCard = ({ game }) => {
  const status = getGameStatus(game);

  let statusClass = '';
  if (status === "예정") statusClass = "badge-scheduled";
  if (status === "진행 중") statusClass = "badge-live";
  if (status === "종료됨") statusClass = "badge-ended";
  if (status === "취소") statusClass = "badge-canceled";

  return (
    <div className="card">
      <div className="card-header">
        <span className={`badge ${statusClass}`}>{status}</span>
      </div>
      <h3 style={{ fontWeight: "600", fontSize: "18px", color: "#222" }}>
        <span style={{ color: "#222" }}>{game.away_team}</span>{" "}
        <strong style={{ fontSize: "18px" }}>
          {game.away_score !== "N/A" ? game.away_score : ""}
        </strong>{" "}
        vs{" "}
        <strong style={{ fontSize: "18px" }}>
          {game.home_score !== "N/A" ? game.home_score : ""}
        </strong>{" "}
        <span style={{ color: "#222" }}>{game.home_team}</span>
      </h3>
      <p>🕘 <strong>{game.time}</strong></p>
      <p>📍 {game.stadium}</p>
    </div>
  );
};

export default GameCard;
