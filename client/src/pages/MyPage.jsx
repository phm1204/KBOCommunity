import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';
const TEAM_LIST = [
  '', '두산', 'LG', 'SSG', 'NC', '키움', 'KIA', '롯데', '삼성', '한화', 'KT'
];
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
    if (setShowAuthModal) setShowAuthModal(true);
    onBack();
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
export default MyPage; 