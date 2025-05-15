import React from 'react';
import Login from '../Login';
import Register from '../Register';
import '../App.css';

function AuthModal({ show, tab, setTab, onClose, onLoginSuccess }) {
  if (!show) return null;
  return (
    <div className="modal-overlay">
      <div className="auth-modal">
        <div className="auth-tabs">
          <button className={tab === 'login' ? 'active' : ''} onClick={() => setTab('login')}>로그인</button>
          <button className={tab === 'register' ? 'active' : ''} onClick={() => setTab('register')}>회원가입</button>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="auth-content">
          {tab === 'login' ? (
            <Login onLoginSuccess={onLoginSuccess} onRegister={() => setTab('register')} />
          ) : (
            <Register onRegisterSuccess={onLoginSuccess} onLogin={() => setTab('login')} />
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal; 