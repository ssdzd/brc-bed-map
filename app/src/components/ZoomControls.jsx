import React, { memo } from 'react';
import { THEMES } from '../utils/blockUtils';

const ZoomControls = memo(({ onZoomIn, onZoomOut, onResetZoom, currentZoom, theme = '2024' }) => {
  const currentTheme = THEMES[theme];
  
  const containerStyle = {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    zIndex: 50,
    backgroundColor: currentTheme.isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
    padding: '0.75rem',
    borderRadius: '0.75rem',
    boxShadow: currentTheme.isDark 
      ? '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 12px rgba(255, 255, 255, 0.1)'
      : '0 8px 24px rgba(0, 0, 0, 0.15)',
    backdropFilter: 'blur(12px)',
    border: currentTheme.isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)'
  };

  const buttonStyle = {
    width: '44px',
    height: '44px',
    border: currentTheme.isDark 
      ? '1px solid rgba(255, 255, 255, 0.3)' 
      : '1px solid rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
    backgroundColor: currentTheme.isDark 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(255, 255, 255, 0.8)',
    color: currentTheme.textColor,
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    fontFamily: currentTheme.typography.primaryFont,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    textShadow: currentTheme.isDark ? '1px 1px 2px rgba(0, 0, 0, 0.5)' : 'none'
  };

  const hoverStyle = {
    backgroundColor: currentTheme.isDark 
      ? 'rgba(255, 255, 255, 0.2)' 
      : 'rgba(255, 255, 255, 1)',
    transform: 'scale(1.05)'
  };

  return (
    <div 
      style={containerStyle}
      role="group"
      aria-label="Map zoom controls"
    >
      <button
        onClick={onZoomIn}
        style={buttonStyle}
        onMouseEnter={(e) => Object.assign(e.target.style, hoverStyle)}
        onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
        title="Zoom In (Ctrl + +)"
        aria-label="Zoom in"
      >
        +
      </button>
      
      <button
        onClick={onZoomOut}
        style={buttonStyle}
        onMouseEnter={(e) => Object.assign(e.target.style, hoverStyle)}
        onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
        title="Zoom Out (Ctrl + -)"
        aria-label="Zoom out"
      >
        −
      </button>
      
      <button
        onClick={onResetZoom}
        style={{
          ...buttonStyle,
          fontSize: '14px'
        }}
        onMouseEnter={(e) => Object.assign(e.target.style, {...buttonStyle, fontSize: '14px', ...hoverStyle})}
        onMouseLeave={(e) => Object.assign(e.target.style, {...buttonStyle, fontSize: '14px'})}
        title="Reset Zoom (Ctrl + 0)"
        aria-label="Reset zoom to default"
      >
        ⌂
      </button>
      
      <div style={{
        fontSize: '12px',
        textAlign: 'center',
        color: currentTheme.isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
        padding: '0.25rem',
        fontFamily: currentTheme.typography.primaryFont,
        fontWeight: '500',
        textShadow: currentTheme.isDark ? '1px 1px 2px rgba(0, 0, 0, 0.5)' : 'none'
      }}>
        {Math.round(currentZoom * 100)}%
      </div>
    </div>
  );
});

ZoomControls.displayName = 'ZoomControls';

export default ZoomControls;