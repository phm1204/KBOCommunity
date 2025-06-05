import React, { useState } from 'react';
import Login from '../Login';
import Register from '../Register';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 0;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #888;
  cursor: pointer;
  padding: 0;
  line-height: 1;

  &:hover {
    color: #666;
  }
`;

function AuthModal({ show, onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);

  if (!show) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{isLogin ? '로그인' : '회원가입'}</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        {isLogin ? (
          <Login 
            onLoginSuccess={onLoginSuccess} 
            onRegister={() => setIsLogin(false)} 
          />
        ) : (
          <Register 
            onRegisterSuccess={onLoginSuccess} 
            onLogin={() => setIsLogin(true)} 
          />
        )}
      </ModalContent>
    </ModalOverlay>
  );
}

export default AuthModal; 