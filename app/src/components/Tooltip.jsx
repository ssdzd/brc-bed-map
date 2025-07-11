import React from 'react';
import { THEMES } from '../utils/blockUtils';

const Tooltip = ({ theme = '2025', content, position, visible }) => {
  const themeConfig = THEMES[theme];

  if (!visible || !content) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundColor: themeConfig.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.85)',
        color: themeConfig.textColor,
        padding: '0.75rem 1rem',
        borderRadius: '1rem',
        fontSize: '0.8rem',
        fontFamily: themeConfig.typography.primaryFont,
        boxShadow: themeConfig.isDark 
          ? '0 25px 50px rgba(255, 105, 180, 0.1), 0 10px 20px rgba(0, 0, 0, 0.3)'
          : '0 25px 50px rgba(0, 0, 0, 0.08), 0 10px 20px rgba(0, 0, 0, 0.04)',
        border: themeConfig.isDark ? '2px solid rgba(255,255,255,0.15)' : '2px solid rgba(0,0,0,0.06)',
        backdropFilter: 'blur(20px)',
        zIndex: 1000,
        pointerEvents: 'none',
        maxWidth: '200px',
        animation: 'tooltipFadeIn 0.2s ease-out',
        lineHeight: '1.3'
      }}
    >
      {content.title && (
        <div style={{ 
          fontWeight: '600', 
          marginBottom: '0.25rem',
          color: themeConfig.textColor
        }}>
          {content.title}
        </div>
      )}
      {content.description && (
        <div style={{ 
          opacity: 0.8,
          fontSize: '0.75rem'
        }}>
          {content.description}
        </div>
      )}
      {content.camps && content.camps.length > 0 && (
        <div style={{ 
          marginTop: '0.5rem',
          fontSize: '0.7rem',
          opacity: 0.7
        }}>
          {content.camps.length} camp{content.camps.length > 1 ? 's' : ''} • Click for details
        </div>
      )}
      {content.coordinates && (
        <div style={{ 
          marginTop: '0.5rem',
          fontSize: '0.7rem',
          opacity: 0.6,
          fontFamily: 'monospace',
          backgroundColor: themeConfig.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          border: `1px solid ${themeConfig.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`
        }}>
          SVG: {content.coordinates}
        </div>
      )}
      
      
      {/* CSS Animation */}
      <style>{`
        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Tooltip;