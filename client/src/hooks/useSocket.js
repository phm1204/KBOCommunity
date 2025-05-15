import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function useSocket(event, onData) {
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');
    if (event && onData) {
      socketRef.current.on(event, onData);
    }
    return () => {
      if (event && onData) socketRef.current.off(event, onData);
      socketRef.current.disconnect();
    };
  }, [event, onData]);

  return socketRef.current;
} 