// App.js
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import GameCard from './components/GameCard';  // GameCard 컴포넌트 임포트

const App = () => {
  const [games, setGames] = useState([]);
  const socket = io("http://localhost:5000");

  useEffect(() => {
    // 초기 데이터 불러오기
    fetch("http://localhost:5000/games")
      .then(res => res.json())
      .then(data => setGames(data));

    // 실시간 업데이트 수신
    socket.on("updateGames", (data) => {
      setGames(data);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div>
      <h1>📅 오늘의 KBO 경기</h1>
      <div className="grid">
        {games.length === 0 ? (
          <p>데이터 불러오는 중...</p>
        ) : (
          games.map((game, i) => <GameCard key={i} game={game} />)
        )}
      </div>
    </div>
  );
};

export default App;
