// App.js
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import GameCard from './components/GameCard';  // GameCard 컴포넌트 임포트
import Register from './Register.jsx';
import Login from './Login.jsx';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TEAM_COLORS from './utils/teamColors';
import AuthModal from './components/AuthModal';
import RankingsPage from './pages/RankingsPage';

const TEAM_LIST = [
  '', '두산', 'LG', 'SSG', 'NC', '키움', 'KIA', '롯데', '삼성', '한화', 'KT'
];

const TABS = [
  { id: 'home', label: '홈' },
  { id: 'batter', label: '타자 기록' },
  { id: 'pitcher', label: '투수 기록' },
  { id: 'team', label: '팀 순위' },
  { id: 'community', label: '게임 커뮤니티' },
];

const SERVER_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'http://' + window.location.hostname + ':5000';

function MyPage({ username, myteam, setMyteam, onBack, setUsername, setShowAuthModal }) {
  const [selected, setSelected] = useState(myteam || '');
  const [msg, setMsg] = useState('');

  const handleSave = async () => {
    try {
      await axios.patch('http://localhost:5000/user/myteam', { username, myteam: selected });
      setMyteam(selected);
      setMsg('마이팀이 저장되었습니다!');
    } catch (e) {
      setMsg('저장 실패');
    }
  };

  const handleLogout = () => {
    setUsername('');
    setMyteam('');
    localStorage.removeItem('username');
    localStorage.removeItem('myteam');
    setShowAuthModal(true);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('정말로 계정을 삭제하시겠습니까?')) return;
    try {
      await axios.delete('http://localhost:5000/user', { data: { username } });
      setUsername('');
      setMyteam('');
      localStorage.removeItem('username');
      localStorage.removeItem('myteam');
      setShowAuthModal(true);
      alert('계정이 삭제되었습니다.');
    } catch (e) {
      alert('계정 삭제 실패');
    }
  };

  return (
    <div className="mypage-container">
      <h2>내 정보 관리</h2>
      <p style={{marginBottom: 24}}>안녕하세요, <b>{username || '사용자'}</b>님!</p>
      <div style={{marginBottom: 18}}>
        <label>마이팀 선택: </label>
        <select value={selected} onChange={e => setSelected(e.target.value)}>
          {TEAM_LIST.map(team => (
            <option key={team} value={team}>{team === '' ? '없음(회색)' : team}</option>
          ))}
        </select>
        <button style={{marginLeft: 10}} onClick={handleSave}>저장</button>
      </div>
      <div style={{marginBottom: 16, color: '#007bff'}}>{msg}</div>
      <button onClick={onBack} style={{marginTop: 16, marginRight: 8}}>메인으로 돌아가기</button>
      <button onClick={handleLogout} style={{marginTop: 16, marginRight: 8, background:'#eee', color:'#333'}}>로그아웃</button>
      <button onClick={handleDeleteAccount} style={{marginTop: 16, background:'#f55', color:'#fff'}}>계정 삭제</button>
    </div>
  );
}

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

function ChatModal({ open, onClose, title, username, socket }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { user: 'user1', text: '안녕하세요!' },
    { user: 'user2', text: '반갑습니다.' }
  ]);
  if (!open) return null;
  return (
    <div className="modal-overlay" style={{zIndex:2000}}>
      <div style={{background:'#fff',borderRadius:12,padding:24,minWidth:340,maxWidth:420,boxShadow:'0 8px 32px rgba(0,0,0,0.18)',position:'relative'}}>
        <div style={{fontWeight:'bold',fontSize:'1.15rem',marginBottom:10}}>{title}
          <button onClick={onClose} style={{position:'absolute',right:18,top:18,fontSize:'1.3rem',background:'none',border:'none',color:'#888',cursor:'pointer'}}>×</button>
        </div>
        <div style={{height:220,overflowY:'auto',background:'#fafbfc',borderRadius:8,padding:10,marginBottom:12}}>
          {messages.map((msg,i) => <div key={i} style={{marginBottom:6}}><b style={{color:'#e74c3c'}}>{msg.user}:</b> {msg.text}</div>)}
        </div>
        <form onSubmit={e=>{e.preventDefault();if(input){setMessages([...messages,{user:'me',text:input}]);setInput('');}}} style={{display:'flex',gap:6}}>
          <input value={input} onChange={e=>setInput(e.target.value)} style={{flex:1,padding:'8px',borderRadius:6,border:'1px solid #eee'}} placeholder="메시지 입력..." />
          <button type="submit" className="btn btn-primary">전송</button>
        </form>
      </div>
    </div>
  );
}

function MainApp({ username, setUsername, myteam, setMyteam }) {
  const [games, setGames] = useState([]);
  const [teamRankings, setTeamRankings] = useState([]);
  const socket = io(SERVER_URL);
  const [showAuthModal, setShowAuthModal] = useState(!username);
  const [authTab, setAuthTab] = useState('login');
  const [showMyPage, setShowMyPage] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [gameFilter, setGameFilter] = useState('전체');
  const [showChat, setShowChat] = useState(false);
  const [chatTitle, setChatTitle] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [openGameCardId, setOpenGameCardId] = useState(null);

  const color = TEAM_COLORS[myteam] || '#888';

  useEffect(() => {
    fetch(`${SERVER_URL}/games`)
      .then(res => res.json())
      .then(data => setGames(data));
    fetch(`${SERVER_URL}/team-rankings`)
      .then(res => res.json())
      .then(data => setTeamRankings(data))
      .catch(error => console.error('Error fetching team rankings:', error));
    
    socket.on("updateGames", (data) => {
      setGames(data);
    });
    socket.on("updateTeamRankings", (data) => {
      setTeamRankings(data);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLoginSuccess = (user) => {
    console.log('Login success handler:', user);
    setShowAuthModal(false);
    if (user && user.username) {
      setUsername(user.username);
      localStorage.setItem('username', user.username);
    }
    if (user && user.myteam !== undefined) {
      setMyteam(user.myteam);
      localStorage.setItem('myteam', user.myteam);
    }
  };

  const handleJoinChat = (game, roomId) => {
    setChatTitle(`${game.away_team} vs ${game.home_team} (${game.time})`);
    setShowChat(true);
    socket.emit('joinRoom', { username, room: roomId });
  };

  const filteredGames = games.filter(game => {
    if (gameFilter === '전체') return true;
    if (gameFilter === '진행 중') return game.status?.includes('진행');
    if (gameFilter === '예정') return game.status?.includes('예정');
    if (gameFilter === '종료') return game.status?.includes('종료');
    return true;
  });

  const communityRooms = [
    {
      title: 'NC vs 키움 6회 초 대화방',
      status: '현재 활성화',
      users: 125,
      comments: 342,
      desc: '6회 초 2사 1,3루 상황에서 NC 타자 박건우의 타석입니다.',
      views: 1245,
      likes: 87
    }
  ];

  const renderTabContent = () => {
    if (activeTab === 'home') {
      return (
        <div className="main-2col">
          <div className="main-2col-left">
            <div>
              {games.length === 0 ? (
                <p>경기 데이터가 없습니다.</p>
              ) : (
                games.map((game, i) => {
                  const gameId = `${game.time}-${game.away_team}-${game.home_team}`;
                  return (
                    <div key={i} style={{ marginBottom: '16px' }}>
                      <GameCard 
                        game={game} 
                        onJoinChat={handleJoinChat}
                        showLineup={true}
                        id={gameId}
                        isOpen={openGameCardId === gameId}
                        setOpenGameCardId={setOpenGameCardId}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="main-2col-right">
            <div className="section" style={{marginBottom:0}}>
              <div className="section-title" style={{marginBottom:12}}>
                <h2 style={{fontSize:'1.18rem',margin:0}}>팀 순위</h2>
              </div>
              <table className="stats-table" style={{fontSize:'0.98rem'}}>
                <thead>
                  <tr>
                    <th>순위</th><th>팀명</th><th>승</th><th>패</th><th>무</th><th>승률</th>
                  </tr>
                </thead>
                <tbody>
                  {teamRankings.map(row => (
                    <tr key={row.rank}>
                      <td>{row.rank}</td>
                      <td>{row.team}</td>
                      <td>{row.win}</td>
                      <td>{row.lose}</td>
                      <td>{row.draw}</td>
                      <td>{row.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
    if (activeTab === 'community') {
      return (
        <div style={{width:'100%',maxWidth:800,margin:'0 auto'}}>
          <CommunityCard room={communityRooms[0]} onJoin={()=>handleJoinChat(communityRooms[0], 'community')} />
        </div>
      );
    }
    return (
      <section className="section">
        <div className="section-title">
          <h2>{TABS.find(t => t.id === activeTab)?.label}</h2>
        </div>
        <div style={{color:'#888',padding:'2rem 0',textAlign:'center'}}>준비 중입니다.</div>
      </section>
    );
  };

  if (!username) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', background: '#f4f4f9' }}>
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
          initialTab={authTab}
          onTabChange={setAuthTab}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="header-content">
          <a href="/" className="site-title">KBO Community</a>
          <div style={{ position: 'relative' }}>
            <button 
              className="profile-button"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              {username[0].toUpperCase()}
            </button>
            {showProfileDropdown && (
              <div className="profile-dropdown" style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                padding: '8px',
                minWidth: '180px',
                marginTop: '12px',
                zIndex: 1000
              }}>
                <button 
                  onClick={() => {
                    setShowMyPage(true);
                    setShowProfileDropdown(false);
                  }}
                  style={{
                    padding: '10px 16px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    fontSize: '1rem',
                    color: '#333',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    width: '100%',
                    transition: 'background 0.2s'
                  }}
                >
                  내 정보 관리
                </button>
                <button 
                  onClick={() => {
                    handleLogout();
                    setShowProfileDropdown(false);
                  }}
                  style={{
                    padding: '10px 16px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    fontSize: '1rem',
                    color: '#e74c3c',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    width: '100%',
                    transition: 'background 0.2s'
                  }}
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
          initialTab={authTab}
          onTabChange={setAuthTab}
        />
      )}
      {showMyPage ? (
        <MyPage
          username={username}
          myteam={myteam}
          setMyteam={setMyteam}
          onBack={() => setShowMyPage(false)}
          setUsername={setUsername}
          setShowAuthModal={setShowAuthModal}
        />
      ) : (
        <main className="main-content-container">
          {renderTabContent()}
        </main>
      )}
      {showChat && (
        <ChatModal
          open={showChat}
          onClose={() => setShowChat(false)}
          title={chatTitle}
          username={username}
          socket={socket}
        />
      )}
    </div>
  );
}

function App() {
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [myteam, setMyteam] = useState(localStorage.getItem('myteam') || '');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp username={username} setUsername={setUsername} myteam={myteam} setMyteam={setMyteam} />} />
      </Routes>
    </Router>
  );
}

export default App;
