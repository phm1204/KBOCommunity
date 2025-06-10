import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function RankingsPage({ rankings }) {
  const navigate = useNavigate();

  return (
    <div className="rankings-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
        <h1>팀 순위</h1>
      </div>
      
      <div className="section">
        <table className="stats-table full-rankings">
          <thead>
            <tr>
              <th>순위</th>
              <th>팀명</th>
              <th>승</th>
              <th>패</th>
              <th>무</th>
              <th>승률</th>
              <th>게임차</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map(row => (
              <tr key={row.rank}>
                <td>{row.rank}</td>
                <td>{row.team}</td>
                <td>{row.win}</td>
                <td>{row.lose}</td>
                <td>{row.draw}</td>
                <td>{row.rate}</td>
                <td>{row.gamesBehind || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RankingsPage; 