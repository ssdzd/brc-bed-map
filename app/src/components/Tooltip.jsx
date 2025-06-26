import React, { useState, useEffect } from 'react';
import { THEMES } from '../utils/blockUtils';

const Tooltip = ({ theme = '2025', content, position, visible }) => {
  const themeConfig = THEMES[theme];
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (!position || !visible) return;

    // Adjust position to keep tooltip in viewport
    const tooltipWidth = 200;
    const tooltipHeight = 80;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = position.x;
    let adjustedY = position.y;

    // Keep tooltip within right edge
    if (adjustedX + tooltipWidth > viewportWidth) {
      adjustedX = viewportWidth - tooltipWidth - 10;
    }

    // Keep tooltip within bottom edge
    if (adjustedY + tooltipHeight > viewportHeight) {
      adjustedY = position.y - tooltipHeight - 10;
    }

    // Keep tooltip within left edge
    if (adjustedX < 10) {
      adjustedX = 10;
    }

    // Keep tooltip within top edge
    if (adjustedY < 10) {
      adjustedY = 10;
    }

    setAdjustedPosition({ x: adjustedX, y: adjustedY });
  }, [position, visible]);

  if (!visible || !content) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
        backgroundColor: themeConfig.isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
        color: themeConfig.textColor,
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        fontSize: '0.8rem',
        fontFamily: themeConfig.typography.primaryFont,
        boxShadow: themeConfig.isDark 
          ? '0 10px 25px rgba(255, 105, 180, 0.2), 0 4px 10px rgba(0, 0, 0, 0.6)'
          : '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)',
        border: themeConfig.isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
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
      
      {/* Tooltip arrow */}
      <div
        style={{
          position: 'absolute',
          bottom: '-6px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `6px solid ${themeConfig.isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)'}`
        }}
      />
      
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