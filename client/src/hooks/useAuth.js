import { useState, useEffect } from 'react';
export default function useAuth() {
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [myteam, setMyteam] = useState(() => localStorage.getItem('myteam') || '');
  useEffect(() => {
    if (username) localStorage.setItem('username', username);
    else localStorage.removeItem('username');
  }, [username]);
  useEffect(() => {
    if (myteam) localStorage.setItem('myteam', myteam);
    else localStorage.removeItem('myteam');
  }, [myteam]);
  const logout = () => {
    setUsername('');
    setMyteam('');
    localStorage.removeItem('username');
    localStorage.removeItem('myteam');
  };
  return { username, setUsername, myteam, setMyteam, logout };
} 