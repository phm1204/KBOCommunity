import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

const TEAM_LIST = [
  '', '두산', 'LG', 'SSG', 'NC', '키움', 'KIA', '롯데', '삼성', '한화', 'KT'
];

function MyPage({ username, myteam, setMyteam, onBack, setUsername, setShowAuthModal }) {
  const [selected, setSelected] = useState(myteam || '');
  const [msg, setMsg] = useState('');
  const [activeTab, setActiveTab] = useState('account'); // 기본 탭: 계정 관리

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
    console.log("로그아웃 시작");
    setUsername('');
    setMyteam('');
    localStorage.removeItem('username');
    localStorage.removeItem('myteam');
    if (setShowAuthModal) {
      console.log("setShowAuthModal(true) 호출");
      setShowAuthModal(true);
    }
    console.log("onBack() 호출");
    onBack();
    console.log("로그아웃 처리 완료");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('정말로 계정을 삭제하시겠습니까?')) return;
    try {
      await axios.delete('http://localhost:5000/user', { data: { username } });
      setUsername('');
      setMyteam('');
      localStorage.removeItem('username');
      localStorage.removeItem('myteam');
      if (setShowAuthModal) setShowAuthModal(true);
      onBack();
      alert('계정이 삭제되었습니다.');
    } catch (e) {
      alert('계정 삭제 실패');
    }
  };

  return (
    <div className="mypage-layout">
      <div className="mypage-sidebar">
        <h3 style={{padding: '0 24px 16px', color: '#2c3e50', fontSize: '1.1rem'}}>내 정보</h3>
        <ul className="mypage-sidebar-nav">
          <li>
            <a 
              href="#"
              className={activeTab === 'account' ? 'active' : ''}
              onClick={() => setActiveTab('account')}
            >
              계정 관리
            </a>
          </li>
          <li>
            <a 
              href="#"
              className={activeTab === 'my-activities' ? 'active' : ''}
              onClick={() => setActiveTab('my-activities')}
            >
              나의 활동
            </a>
          </li>
        </ul>
        <h3 style={{padding: '16px 24px', color: '#2c3e50', fontSize: '1.1rem', borderTop: '1px solid #eee', marginTop: '16px'}}>교육</h3>
        <ul className="mypage-sidebar-nav">
          <li>
            <a 
              href="#"
              className={activeTab === 'courses' ? 'active' : ''}
              onClick={() => setActiveTab('courses')}
            >
              수강 중인 코스
            </a>
          </li>
          <li>
            <a 
              href="#"
              className={activeTab === 'purchases' ? 'active' : ''}
              onClick={() => setActiveTab('purchases')}
            >
              구매/신청 내역
            </a>
          </li>
        </ul>
        <h3 style={{padding: '16px 24px', color: '#2c3e50', fontSize: '1.1rem', borderTop: '1px solid #eee', marginTop: '16px'}}>코딩 테스트</h3>
        <ul className="mypage-sidebar-nav">
          <li>
            <a 
              href="#"
              className={activeTab === 'problem-solving' ? 'active' : ''}
              onClick={() => setActiveTab('problem-solving')}
            >
              문제 풀이 활동 기록
            </a>
          </li>
        </ul>
      </div>

      <div className="mypage-content">
        {activeTab === 'account' && (
          <div>
            <h2 className="mypage-section-title">계정 관리</h2>
            <div className="mypage-card">
              <div className="mypage-avatar" style={{backgroundColor: '#e0f7fa'}}>
                <img src="https://www.flaticon.com/svg/static/icons/svg/3004/3004513.svg" alt="아바타" style={{width: '70%', height: '70%', objectFit: 'contain'}} />
              </div>
              <div className="mypage-email">
                {username || 'happy_user@email.com'}
                <span className="check-icon" style={{marginLeft: '8px'}}>✔ 인증 완료</span>
              </div>
              <button className="mypage-btn-modify">수정</button>
            </div>

            <h3 className="mypage-section-title" style={{fontSize: '1.25rem', marginBottom: '18px', borderBottom: 'none', paddingBottom: 0}}>기본 정보</h3>
            <div className="mypage-card" style={{textAlign: 'left', marginBottom: '0'}}>
              <div style={{marginBottom: 18}}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555'}}>마이팀 선택: </label>
                <select value={selected} onChange={e => setSelected(e.target.value)} style={{padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.95rem', width: '200px'}}>
                  {TEAM_LIST.map(team => (
                    <option key={team} value={team}>{team === '' ? '없음(회색)' : team}</option>
                  ))}
                </select>
                <button onClick={handleSave} style={{marginLeft: 10}} className="mypage-btn-modify">저장</button>
              </div>
              {msg && <div style={{marginBottom: 16, color: '#007bff', fontSize: '0.9rem'}}>{msg}</div>}
              <div style={{marginTop: 24, paddingTop: 24, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between'}}>
                <button onClick={handleLogout} className="mypage-btn-modify" style={{background:'#eee', color:'#333'}}>로그아웃</button>
                <button onClick={handleDeleteAccount} className="mypage-btn-modify" style={{background:'#f55', color:'#fff'}}>계정 삭제</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'my-activities' && (
          <div>
            <h2 className="mypage-section-title">나의 활동</h2>
            <p style={{textAlign: 'center', color: '#888', padding: '40px 0'}}>준비 중입니다.</p>
          </div>
        )}

        {activeTab === 'courses' && (
          <div>
            <h2 className="mypage-section-title">수강 중인 코스</h2>
            <p style={{textAlign: 'center', color: '#888', padding: '40px 0'}}>준비 중입니다.</p>
          </div>
        )}

        {activeTab === 'purchases' && (
          <div>
            <h2 className="mypage-section-title">구매/신청 내역</h2>
            <p style={{textAlign: 'center', color: '#888', padding: '40px 0'}}>준비 중입니다.</p>
          </div>
        )}

        {activeTab === 'problem-solving' && (
          <div>
            <h2 className="mypage-section-title">문제 풀이 활동 기록</h2>
            <p style={{textAlign: 'center', color: '#888', padding: '40px 0'}}>준비 중입니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyPage; 