import React from 'react';

export const GlassButton = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  type = 'button', 
  disabled = false, 
  style = {}, 
  className = '' 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          background: 'linear-gradient(135deg, #EF4444 0%, #991B1B 100%)',
          boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)',
          color: '#FFFFFF'
        };
      case 'success':
        return {
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
          color: '#FFFFFF'
        };
      case 'secondary':
        return {
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: 'none',
          color: '#FFFFFF'
        };
      case 'primary':
      default:
        return {
          background: 'linear-gradient(135deg, #00D2FF 0%, #3A7BD5 100%)',
          boxShadow: '0 4px 18px rgba(0, 210, 255, 0.4)',
          color: '#FFFFFF'
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-primary ${className}`}
      style={{
        height: '48px',
        padding: '0 24px',
        borderRadius: '12px',
        border: 'none',
        fontWeight: 700,
        fontSize: '14px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        width: style.width || '100%',
        transition: 'all 0.2s ease',
        fontFamily: 'inherit',
        ...variantStyles,
        ...style
      }}
    >
      {children}
    </button>
  );
};
