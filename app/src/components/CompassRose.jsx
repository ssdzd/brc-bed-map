import React from 'react';
import { THEMES } from '../utils/blockUtils';

const CompassRose = ({ theme = '2025', zoom = 1 }) => {
  const themeConfig = THEMES[theme];
  
  // Only show compass when zoomed in enough to be useful
  if (zoom < 1.2) return null;
  
  return (
    <div
      style={{
        position: 'absolute',
        top: '1rem',
        right: '6rem',
        width: '120px',
        height: '120px',
        zIndex: 15,
        pointerEvents: 'none',
        opacity: 0.8
      }}
    >
      {/* Compass Background */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: theme === '2024' 
            ? 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,105,180,0.2) 100%)'
            : 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(59,130,246,0.2) 100%)',
          border: `3px solid ${theme === '2024' ? '#FF69B4' : '#3B82F6'}`,
          boxShadow: theme === '2024' 
            ? '0 8px 30px rgba(255,105,180,0.3)'
            : '0 8px 30px rgba(59,130,246,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Cardinal Directions */}
        <div style={{ position: 'absolute', inset: '10px' }}>
          {/* North */}
          <div
            style={{
              position: 'absolute',
              top: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: theme === '2024' ? '#FF1493' : '#1E40AF',
              fontFamily: themeConfig.typography.displayFont
            }}
          >
            N
          </div>
          
          {/* South */}
          <div
            style={{
              position: 'absolute',
              bottom: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: theme === '2024' ? '#C2185B' : '#374151',
              fontFamily: themeConfig.typography.primaryFont
            }}
          >
            S
          </div>
          
          {/* East */}
          <div
            style={{
              position: 'absolute',
              right: '0',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: theme === '2024' ? '#C2185B' : '#374151',
              fontFamily: themeConfig.typography.primaryFont
            }}
          >
            E
          </div>
          
          {/* West */}
          <div
            style={{
              position: 'absolute',
              left: '0',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: theme === '2024' ? '#C2185B' : '#374151',
              fontFamily: themeConfig.typography.primaryFont
            }}
          >
            W
          </div>
        </div>
        
        {/* Compass Needle pointing to The Man (12 o'clock) */}
        <div
          style={{
            position: 'absolute',
            width: '2px',
            height: '35px',
            background: `linear-gradient(to bottom, ${theme === '2024' ? '#FF1493' : '#1E40AF'} 0%, transparent 100%)`,
            top: '15px',
            left: '50%',
            transform: 'translateX(-50%)',
            transformOrigin: 'bottom center'
          }}
        />
        
        {/* Center dot */}
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: theme === '2024' ? '#FF1493' : '#1E40AF',
            position: 'absolute'
          }}
        />
        
        {/* "The Man" label */}
        <div
          style={{
            position: 'absolute',
            top: '-1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '0.7rem',
            fontWeight: '600',
            color: theme === '2024' ? '#FF1493' : '#1E40AF',
            fontFamily: themeConfig.typography.primaryFont,
            textAlign: 'center',
            backgroundColor: 'rgba(255,255,255,0.9)',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            border: `1px solid ${theme === '2024' ? '#FF69B4' : '#3B82F6'}`,
            whiteSpace: 'nowrap'
          }}
        >
          🕺 The Man
        </div>
      </div>
      
      {/* Playa Orientation Note */}
      <div
        style={{
          position: 'absolute',
          top: '130px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '0.6rem',
          color: themeConfig.textColor,
          opacity: 0.7,
          fontFamily: themeConfig.typography.primaryFont,
          textAlign: 'center',
          backgroundColor: 'rgba(255,255,255,0.8)',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          whiteSpace: 'nowrap'
        }}
      >
        Playa Orientation
      </div>
    </div>
  );
};

export default CompassRose;