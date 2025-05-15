import React, { useState } from 'react';
import '../App.css';
function ChatModal({ open, onClose, title }) {
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
export default ChatModal; 