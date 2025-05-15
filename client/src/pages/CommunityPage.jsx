import React from 'react';
import CommunityCard from '../components/CommunityCard';
import '../App.css';

function CommunityPage({ communityRooms, gameFilter, setGameFilter, onJoinChat }) {
  return (
    <div style={{width:'100%',maxWidth:800,margin:'0 auto'}}>
      <div className="filter-tabs" style={{marginBottom:24}}>
        {['전체','진행 중','예정','종료'].map(f => (
          <button
            key={f}
            className={`filter-tab-btn${gameFilter === f ? ' active' : ''}`}
            onClick={() => setGameFilter(f)}
          >{f}</button>
        ))}
      </div>
      {communityRooms.map((room, i) => (
        <CommunityCard key={i} room={room} onJoin={() => onJoinChat(room)} />
      ))}
    </div>
  );
}

export default CommunityPage; 