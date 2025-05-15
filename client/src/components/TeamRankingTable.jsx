import React from 'react';
import '../App.css';
function TeamRankingTable({ rankings }) {
  return (
    <div className="section" style={{marginBottom:0}}>
      <div className="section-title" style={{marginBottom:12}}>
        <h2 style={{fontSize:'1.18rem',margin:0}}>팀 순위</h2>
      </div>
      <table className="stats-table" style={{fontSize:'0.98rem'}}>
        <thead>
          <tr>
            <th>순위</th><th>팀명</th><th>승</th><th>패</th><th>무</th><th>승률</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default TeamRankingTable; 