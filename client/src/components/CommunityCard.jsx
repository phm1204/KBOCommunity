import React from 'react';
import '../App.css';
function CommunityCard({ room, onJoin }) {
  return (
    <div className="community-card">
      <div className="community-header">
        <div className="community-title">{room.title}</div>
        <div className="community-status">{room.status}</div>
      </div>
      <div className="community-meta">
        참여자 {room.users}명 | 댓글 {room.comments}개
      </div>
      <div style={{marginBottom:8}}>{room.desc}</div>
      <div className="community-stats">
        <span>조회 {room.views}</span>
        <span>좋아요 {room.likes}</span>
      </div>
      <button className="btn-community" onClick={onJoin}>참여하기</button>
    </div>
  );
}
export default CommunityCard; 