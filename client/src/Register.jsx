import React from 'react';
import './App.css';

function Register({ onRegisterSuccess, onLogin }) {
  const handleSubmit = e => {
    e.preventDefault();
    // 임시: 회원가입 성공 콜백 호출
    if (onRegisterSuccess) onRegisterSuccess({ username: 'test', myteam: '' });
  };
  return (
    <div className="modal-box">
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>이메일</label>
          <input type="email" placeholder="이메일" required />
        </div>
        <div className="form-group">
          <label>비밀번호</label>
          <input type="password" placeholder="비밀번호" required />
        </div>
        <div className="form-group">
          <label>비밀번호 확인</label>
          <input type="password" placeholder="비밀번호 확인" required />
        </div>
        <button type="submit" className="btn btn-primary" style={{width:'100%',marginTop:'1rem'}}>회원가입</button>
      </form>
      <div style={{marginTop:'1rem',textAlign:'center'}}>
        <button className="btn btn-outline" onClick={onLogin}>로그인</button>
      </div>
    </div>
  );
}

export default Register; 