import React from 'react';

export const GlassCard = ({ children, style = {}, className = '', onClick }) => {
  return (
    <div
      className={`glass-card ${className}`}
      onClick={onClick}
      style={{
        padding: '28px',
        borderRadius: '20px',
        background: 'rgba(30, 41, 59, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
        ...style
      }}
    >
      {children}
    </div>
  );
};
