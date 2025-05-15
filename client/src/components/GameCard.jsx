// GameCard.js
import React, { useState } from 'react';

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
  if (game.status?.includes('진행')) {
    return <button className="btn btn-primary" onClick={() => onJoinChat && onJoinChat(game)}>LIVE 커뮤니티</button>;
  }
  if (game.status?.includes('예정') || game.status?.includes('대기')) {
    return <button className="btn btn-scheduled" disabled>커뮤니티 오픈 예정</button>;
  }
  if (game.status?.includes('종료')) {
    return <button className="btn btn-ended" disabled>커뮤니티 활성화 중</button>;
  }
  return <button className="btn btn-scheduled" disabled>커뮤니티 오픈 예정</button>;
};

// 경기 카드 컴포넌트
const GameCard = ({ game, onJoinChat }) => {
  const [open, setOpen] = useState(false);
  const status = getGameStatus(game);

  // 선발투수 이름 첫 글자 제거 함수
  const hideFirstChar = (name) => (name && name.length > 1 ? name.slice(1) : name || '-');

  let statusClass = '';
  if (status === "예정") statusClass = "badge-scheduled";
  if (status === "진행 중") statusClass = "badge-live";
  if (status === "종료됨") statusClass = "badge-ended";
  if (status === "취소") statusClass = "badge-canceled";

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
      marginBottom: 18,
      overflow: 'hidden',
      padding: 0
    }}>
      <div className="game-card" onClick={() => setOpen(o => !o)} style={{
        cursor: 'pointer',
        borderRadius: 0,
        boxShadow: 'none',
        margin: 0,
        background: '#fff',
        padding: '22px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: 18
      }}>
        <div className="team-info">
          <div className="team-logo">{TEAM_INITIALS[game.away_team] || game.away_team}</div>
          <div>{game.away_team_full || game.away_team}</div>
        </div>
        <div style={{flex:1, textAlign:'center'}}>
          <div className="game-time">{game.time} | {game.stadium}</div>
          <div className="game-status-text" style={{color:'#e74c3c', fontWeight:500}}>{game.status_detail || game.status}</div>
        </div>
        <div className="team-info">
          <div>{game.home_team_full || game.home_team}</div>
          <div className="team-logo">{TEAM_INITIALS[game.home_team] || game.home_team}</div>
        </div>
        <div style={{marginLeft:16}} onClick={e => e.stopPropagation()}>
          {getButton(game, onJoinChat)}
        </div>
      </div>
      {open && (
        <div style={{
          background:'#fff',
          borderRadius: 0,
          margin: 0,
          padding:'18px 0 12px 0',
          borderTop: 'none',
          display:'flex',
          justifyContent:'center',
          alignItems:'center',
          boxShadow:'none',
        }}>
          <div style={{
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            gap:32,
            width:'100%',
            maxWidth:480,
            margin:'0 auto',
            fontSize:'1.08rem',
            fontWeight:500
          }}>
            <span style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontWeight:600}}>{game.away_team}</span>
              <span style={{fontSize:'1.08rem',color:'#e74c3c'}}>{hideFirstChar(game.away_pitcher)}</span>
            </span>
            <span style={{fontWeight:700, color:'#888', fontSize:'1.05rem'}}>vs</span>
            <span style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontWeight:600}}>{game.home_team}</span>
              <span style={{fontSize:'1.08rem',color:'#3498db'}}>{hideFirstChar(game.home_pitcher)}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCard;
