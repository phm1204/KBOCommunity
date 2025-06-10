import React from 'react';
import GameCard from '../components/GameCard';
import TeamRankingTable from '../components/TeamRankingTable';
import '../App.css';

function HomePage({ games, filteredGames, gameFilter, setGameFilter, onJoinChat, teamRankings }) {
  return (
    <div className="main-2col">
      <div className="main-2col-left">
        <div className="filter-tabs">
          {['전체','진행 중','예정','종료'].map(f => (
            <button
              key={f}
              className={`filter-tab-btn${gameFilter === f ? ' active' : ''}`}
              onClick={() => setGameFilter(f)}
            >{f}</button>
          ))}
        </div>
        <div>
          {filteredGames.length === 0 ? (
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              padding: '48px 24px',
              textAlign: 'center',
              margin: '24px 0'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px',
                color: '#e74c3c'
              }}>⚾</div>
              <h3 style={{
                fontSize: '1.25rem',
                color: '#2c3e50',
                marginBottom: '8px'
              }}>오늘의 경기가 없습니다</h3>
              <p style={{
                color: '#7f8c8d',
                fontSize: '0.95rem'
              }}>다른 날짜의 경기를 확인해보세요</p>
            </div>
          ) : (
            filteredGames.map((game, i) => <GameCard key={i} game={game} onJoinChat={onJoinChat} />)
          )}
        </div>
      </div>
      <div className="main-2col-right">
        <TeamRankingTable rankings={teamRankings} />
      </div>
    </div>
  );
}

export default HomePage; 