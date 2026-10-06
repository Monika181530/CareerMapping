import React from 'react';

const KPICard = ({ icon: Icon, title, value, subtitle, variant = 'primary' }) => {
  const colors = {
    primary: 'var(--accent)',
    success: 'var(--accent-green)',
    warning: 'var(--warning)',
    danger: 'var(--danger)',
  };

  const color = colors[variant] || colors.primary;

  return (
    <div className="card animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{
        padding: '16px',
        borderRadius: '12px',
        background: `${color}15`,
        color: color
      }}>
        <Icon size={24} />
      </div>
      <div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', margin: '4px 0' }}>{value}</div>
        {subtitle && <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{subtitle}</div>}
      </div>
    </div>
  );
};

export default KPICard;
