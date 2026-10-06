import React from 'react';

const ProgressBar = ({ label, percentage, color = 'var(--accent)' }) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '14px', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{percentage}%</span>
      </div>
      <div style={{
        height: '8px',
        background: 'var(--surface-2)',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${percentage}%`,
          background: color,
          borderRadius: '4px',
          transition: 'width 1s ease-in-out'
        }} />
      </div>
    </div>
  );
};

export default ProgressBar;
