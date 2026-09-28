import React from 'react';

export const GlassInput = ({ 
  label, 
  icon: Icon, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  style = {},
  error
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', ...style }}>
      {label && (
        <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600 }}>
          {label}
        </label>
      )}
      
      <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#00D2FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '20px',
            pointerEvents: 'none',
            zIndex: 3
          }}>
            <Icon size={18} />
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`glass-input ${Icon ? 'glass-input-has-icon' : ''}`}
        />
      </div>

      {error && (
        <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: 600, marginTop: '2px' }}>
          ⚠️ {error}
        </span>
      )}
    </div>
  );
};
