// GameCard.js
import React, { useState } from 'react';
import TEAM_COLORS from '../utils/teamColors';

const TEAM_INITIALS = {
  '두산': '두산', 'LG': 'LG', 'SSG': 'SSG', 'NC': 'NC', '키움': '키움', 'KIA': 'KT', '롯데': '롯데', '삼성': '삼성', '한화': '한화', 'KT': 'KT'
};

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

const getStatusBadge = (status) => {
  if (status === '진행 중') return <span className="badge badge-live">진행 중</span>;
  if (status === '예정') return <span className="badge badge-scheduled">예정</span>;
  if (status === '종료') return <span className="badge badge-ended">종료</span>;
  if (status === '취소') return <span className="badge badge-canceled">취소</span>;
  return null;
};

const getButton = (game, onJoinChat) => {
  const roomId = `${game.away_team}_${game.home_team}_${game.time.replace(':', '')}`;
  
  if (game.status?.includes('진행')) {
    return <button className="btn btn-primary" onClick={() => onJoinChat && onJoinChat(game, roomId)}>LIVE 커뮤니티</button>;
  }
  if (game.status?.includes('예정') || game.status?.includes('대기')) {
    return <button className="btn btn-scheduled" onClick={() => onJoinChat && onJoinChat(game, roomId)}>커뮤니티</button>;
  }
  if (game.status?.includes('종료')) {
    return <button className="btn btn-ended" onClick={() => onJoinChat && onJoinChat(game, roomId)}>커뮤니티</button>;
  }
  return <button className="btn btn-scheduled" onClick={() => onJoinChat && onJoinChat(game, roomId)}>커뮤니티</button>;
};

// 경기 카드 컴포넌트
const GameCard = ({ game, onJoinChat, showLineup = true, id, isOpen, setOpenGameCardId }) => {

  const handleClick = () => {
    if (showLineup) {
      setOpenGameCardId(isOpen ? null : id);
    }
  };

  // 선발투수 이름 첫 글자 제거 함수
  const hideFirstChar = (name) => (name && name.length > 1 ? name.slice(1) : name || '-');

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
      marginBottom: 18,
      overflow: 'hidden',
      padding: 0
    }}>
      <div className="game-card" onClick={handleClick} style={{
        cursor: showLineup ? 'pointer' : 'default',
        borderRadius: 0,
        boxShadow: 'none',
        margin: 0,
        background: '#fff',
        padding: '20px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: 18
      }}>
        <div className="team-info away-team" style={{ color: TEAM_COLORS[game.away_team], fontSize: '1.05rem', minWidth: '60px', textAlign: 'right' }}>
          {game.away_team}
        </div>
        <div className="team-logo" style={{ 
          backgroundColor: TEAM_COLORS[game.away_team] || '#f3f3f3',
          color: '#fff',
          fontWeight: '700',
          width: '42px',
          height: '42px',
          fontSize: '1.15rem',
          marginRight: '10px' // 팀 이름과 로고 사이 간격 조정
        }}>
          {game.away_team[0]}
        </div>
        <div style={{flex:1, textAlign:'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: '0 10px'}}>
          <div className="game-time" style={{ fontSize: '1rem', marginBottom: '4px' }}>{game.time} | {game.stadium}</div>
          <div className="game-score" style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
            {game.away_score !== 'N/A' ? `${game.away_score} : ${game.home_score}` : '-'}
          </div>
        </div>
        <div className="team-logo" style={{ 
          backgroundColor: TEAM_COLORS[game.home_team] || '#f3f3f3',
          color: '#fff',
          fontWeight: '700',
          width: '42px',
          height: '42px',
          fontSize: '1.15rem',
          marginLeft: '10px' // 팀 이름과 로고 사이 간격 조정
        }}>
          {game.home_team[0]}
        </div>
        <div className="team-info home-team" style={{ color: TEAM_COLORS[game.home_team], fontSize: '1.05rem', minWidth: '60px', textAlign: 'left' }}>
          {game.home_team}
        </div>
        <div style={{marginLeft:16}} onClick={e => e.stopPropagation()}>
          {getButton(game, onJoinChat)}
        </div>
      </div>
      {isOpen && showLineup && (
        <div style={{
          background:'#fff',
          borderRadius: 0,
          margin: 0,
          padding:'14px 28px 10px 28px',
          borderTop: 'none',
          display:'flex',
          justifyContent:'space-between',
          alignItems:'flex-start',
          width:'100%',
          fontSize:'0.95rem',
          fontWeight:500
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingLeft: '86px', flex: 1 }}>
            <span style={{fontWeight:600, marginBottom: 4}}>{game.away_team}</span>
            <span style={{fontSize:'0.95rem',color:'#e74c3c'}}>{hideFirstChar(game.away_pitcher)}</span>
          </div>

          <span style={{fontWeight:700, color:'#888', fontSize:'1.05rem', alignSelf:'center'}}>vs</span>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingRight: '86px', flex: 1 }}>
            <span style={{fontWeight:600, marginBottom: 4}}>{game.home_team}</span>
            <span style={{fontSize:'0.95rem',color:'#3498db'}}>{hideFirstChar(game.home_pitcher)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCard;
