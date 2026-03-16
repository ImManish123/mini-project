import React from 'react';

const StatusBadge = ({ status }) => {
  const getConfig = () => {
    switch (status) {
      case 'PENDING': return { bg: 'rgba(243,156,18,0.12)', color: '#e67e22', icon: '⏳' };
      case 'CONFIRMED': return { bg: 'rgba(9,132,227,0.12)', color: '#0984e3', icon: '✓' };
      case 'IN_PROGRESS': return { bg: 'rgba(108,99,255,0.12)', color: '#6C63FF', icon: '⚡' };
      case 'COMPLETED': return { bg: 'rgba(0,184,148,0.12)', color: '#00b894', icon: '✅' };
      case 'CANCELLED': return { bg: 'rgba(214,48,49,0.12)', color: '#d63031', icon: '✕' };
      case 'DECLINED': return { bg: 'rgba(45,52,54,0.12)', color: '#2d3436', icon: '🚫' };
      case 'ACTIVE': return { bg: 'rgba(0,184,148,0.12)', color: '#00b894', icon: '🟢' };
      case 'PAID': return { bg: 'rgba(0,184,148,0.12)', color: '#00b894', icon: '💳' };
      case 'REFUNDED': return { bg: 'rgba(108,117,125,0.12)', color: '#6c757d', icon: '↩' };
      case 'CASH_ON_SERVICE': return { bg: 'rgba(9,132,227,0.12)', color: '#0984e3', icon: '💵' };
      case 'FAILED': return { bg: 'rgba(214,48,49,0.12)', color: '#d63031', icon: '!' };
      case 'OPEN': return { bg: 'rgba(243,156,18,0.12)', color: '#e67e22', icon: '📋' };
      case 'RESOLVED': return { bg: 'rgba(0,184,148,0.12)', color: '#00b894', icon: '✅' };
      case 'CLOSED': return { bg: 'rgba(108,117,125,0.12)', color: '#6c757d', icon: '🔒' };
      default: return { bg: 'rgba(108,117,125,0.12)', color: '#6c757d', icon: '' };
    }
  };

  const config = getConfig();

  return (
    <span style={{
      background: config.bg,
      color: config.color,
      fontWeight: 700,
      fontSize: '11px',
      padding: '4px 10px',
      borderRadius: '6px',
      letterSpacing: '0.3px',
      textTransform: 'uppercase',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      whiteSpace: 'nowrap'
    }}>
      <span style={{fontSize: '10px'}}>{config.icon}</span>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

export default StatusBadge;
