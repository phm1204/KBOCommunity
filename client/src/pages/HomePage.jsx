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
            <p>경기 데이터가 없습니다.</p>
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