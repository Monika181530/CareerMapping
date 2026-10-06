import React from 'react';

const CareerCard = ({ career, selected, onSelect }) => {
  return (
    <div 
      className="card"
      style={{
        cursor: 'pointer',
        border: selected ? '2px solid var(--accent)' : '1px solid var(--border)',
        transform: selected ? 'scale(1.02)' : 'none',
        transition: 'all 0.2s',
      }}
      onClick={() => onSelect && onSelect(career)}
    >
      <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>{career.name || career.title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
        {career.description}
      </p>
      
      {career.recoveryScore && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Recovery Score</span>
          <span style={{ fontWeight: 'bold', color: 'var(--accent-green)' }}>{career.recoveryScore}</span>
        </div>
      )}
      
      {career.skillReusePercent && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Skill Reuse</span>
          <span style={{ fontWeight: 'bold' }}>{career.skillReusePercent}%</span>
        </div>
      )}

      {career.missingSkillsCount !== undefined && (
        <div style={{ fontSize: '12px', color: 'var(--danger)', marginBottom: '16px' }}>
          Missing Skills: {career.missingSkillsCount}
        </div>
      )}
      
      {onSelect && (
        <button className={selected ? "btn btn-primary" : "btn btn-secondary"} style={{ width: '100%' }}>
          {selected ? 'Selected' : 'Select'}
        </button>
      )}
    </div>
  );
};

export default CareerCard;
