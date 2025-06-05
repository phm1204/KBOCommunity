import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const RegisterContainer = styled.div`
  padding: 2rem;
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.8rem 1rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #888;
    box-shadow: 0 0 0 2px rgba(136, 136, 136, 0.1);
  }
`;

const Button = styled.button`
  background: #888;
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;

  &:hover {
    background: #777;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const LoginLink = styled.button`
  background: none;
  border: none;
  color: #888;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;
  margin-top: 1rem;
  text-decoration: underline;

  &:hover {
    color: #666;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

function Register({ onRegisterSuccess, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/register', {
        username,
        password
      });
      onRegisterSuccess(res.data);
    } catch (e) {
      setError(e.response?.data?.message || '회원가입에 실패했습니다.');
    }
  };

  return (
    <RegisterContainer>
      <Title>회원가입</Title>
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label>아이디</Label>
          <Input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="아이디를 입력하세요"
            required
          />
        </InputGroup>
        <InputGroup>
          <Label>비밀번호</Label>
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            required
          />
        </InputGroup>
        <InputGroup>
          <Label>비밀번호 확인</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="비밀번호를 다시 입력하세요"
            required
          />
        </InputGroup>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type="submit">회원가입</Button>
        <LoginLink onClick={onLogin}>
          이미 계정이 있으신가요? 로그인
        </LoginLink>
      </Form>
    </RegisterContainer>
  );
}

export default Register; 