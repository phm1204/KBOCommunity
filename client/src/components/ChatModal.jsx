import React, { useState, useEffect } from 'react';
import '../App.css';

function ChatModal({ open, onClose, title, username, socket }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const room = title;

  useEffect(() => {
    if (!open || !socket || !username || !room) return;

    socket.emit('joinRoom', { username, room });
    console.log(`${username} joining room ${room}`);

    socket.on('receiveMessage', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [open, socket, username, room]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && socket) {
      const messageData = { room, text: input, user: username };
      socket.emit('sendMessage', messageData);
      setInput('');
    }
  };

  if (!open) return null;
  return (
    <div className="modal-overlay" style={{zIndex:2000}}>
      <div style={{background:'#fff',borderRadius:12,padding:24,minWidth:340,maxWidth:420,boxShadow:'0 8px 32px rgba(0,0,0,0.18)',position:'relative'}}>
        <div style={{fontWeight:'bold',fontSize:'1.15rem',marginBottom:10}}>{title}
          <button onClick={onClose} style={{position:'absolute',right:18,top:18,fontSize:'1.3rem',background:'none',border:'none',color:'#888',cursor:'pointer'}}>×</button>
        </div>
        <div style={{height:220,overflowY:'auto',background:'#fafbfc',borderRadius:8,padding:10,marginBottom:12}}>
          {messages.map((msg,i) => (
            <div key={i} style={{marginBottom:6}}>
              <b style={{color:'#007bff'}}>{msg.user}:</b> {msg.text}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} style={{display:'flex',gap:6}}>
          <input value={input} onChange={e=>setInput(e.target.value)} style={{flex:1,padding:'8px',borderRadius:6,border:'1px solid #eee'}} placeholder="메시지 입력..." />
          <button type="submit" className="btn btn-primary">전송</button>
        </form>
      </div>
    </div>
  );
}

export default ChatModal; 