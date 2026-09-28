import React from 'react';

export const StatusBadge = ({ label, color = '#10B981', icon: Icon }) => {
  return (
    <span 
      className="status-badge"
      style={{
        backgroundColor: `${color}25`,
        color: color,
        border: `1px solid ${color}60`
      }}
    >
      {Icon && <Icon size={13} />}
      {label}
    </span>
  );
};
