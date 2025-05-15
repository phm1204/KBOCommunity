import React from 'react';
import TEAM_COLORS from '../utils/teamColors';
import '../App.css';

const NAV_TABS = [
  { id: 'home', label: '홈' },
  { id: 'community', label: '커뮤니티' },
];

function Header({ activeTab, setActiveTab, onMyPage, myteam }) {
  const color = TEAM_COLORS[myteam] || '#222';
  return (
    <header className="main-header" style={{ background: color }}>
      <div className="header-inner">
        <div className="header-title">KBO 커뮤니티</div>
        <nav className="header-nav">
          {NAV_TABS.map(tab => (
            <button
              key={tab.id}
              className={`header-nav-btn${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={activeTab === tab.id ? { background: '#fff', color: color } : {}}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <button className="mypage-btn header-btn" onClick={onMyPage} style={{ background: color }}>
            내 정보 관리
          </button>
        </div>
      </div>
    </header>
  );
}
export default Header; 