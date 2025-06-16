import React from 'react';
import { THEMES } from '../utils/blockUtils';

const ThinkHeader = ({ theme = '2025' }) => {
  const themeConfig = THEMES[theme];
  
  // Only show the THINK header in 2024 theme to match original design
  if (theme !== '2024') {
    return null;
  }
  
  return (
    <div
      style={{
        position: 'absolute',
        top: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 15,
        textAlign: 'center',
        pointerEvents: 'none'
      }}
    >
      {/* Main THINK text */}
      <div
        style={{
          position: 'relative',
          display: 'inline-block'
        }}
      >
        {/* Background THINK text - bold sans-serif */}
        <div
          style={{
            fontFamily: themeConfig.typography.displayFont,
            fontSize: '4rem',
            fontWeight: '900',
            color: '#FFFFFF',
            letterSpacing: '0.2em',
            textShadow: '3px 3px 6px rgba(0, 0, 0, 0.5)',
            lineHeight: '1',
            position: 'relative',
            zIndex: 1
          }}
        >
          THINK
        </div>
        
        {/* Script overlay - positioned over the THINK text */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '15%',
            fontFamily: themeConfig.typography.scriptFont,
            fontSize: '2.5rem',
            fontWeight: '400',
            color: '#FFD700',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
            transform: 'rotate(-8deg)',
            zIndex: 2,
            letterSpacing: '0.1em'
          }}
        >
          pink
        </div>
        
        {/* Additional decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: '-10px',
            right: '-20px',
            width: '8px',
            height: '8px',
            background: '#FFD700',
            borderRadius: '50%',
            boxShadow: '0 0 12px #FFD700',
            animation: 'sparkle 2s infinite'
          }}
        />
        
        <div
          style={{
            position: 'absolute',
            bottom: '-15px',
            left: '-10px',
            width: '6px',
            height: '6px',
            background: '#FF6B35',
            borderRadius: '50%',
            boxShadow: '0 0 10px #FF6B35',
            animation: 'sparkle 2.5s infinite reverse'
          }}
        />
      </div>
      
      {/* Subtle tagline */}
      <div
        style={{
          marginTop: '0.5rem',
          fontFamily: themeConfig.typography.primaryFont,
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#FFFFFF',
          opacity: 0.8,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
        }}
      >
        Bureau of Erotic Discourse
      </div>
      
      {/* CSS animations */}
      <style>{`
        @keyframes sparkle {
          0%, 100% { 
            opacity: 0.4; 
            transform: scale(1) rotate(0deg); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1.3) rotate(180deg); 
          }
        }
      `}</style>
    </div>
  );
};

export default ThinkHeader;