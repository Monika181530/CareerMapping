import React from 'react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div style={{
      padding: '20px',
      background: 'var(--danger)',
      color: 'white',
      borderRadius: '8px',
      textAlign: 'center',
      margin: '20px 0'
    }}>
      <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Error</p>
      <p style={{ margin: '0 0 15px 0' }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} style={{
          background: 'white', color: 'var(--danger)', border: 'none',
          padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
        }}>
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
