import React from 'react';
import { THEMES } from '../utils/blockUtils';
import logoImage from '../assets/logo@4x.png';

const BEDmapHeader = ({ theme = '2025' }) => {
  const themeConfig = THEMES[theme];
  
  // Show the BED map header in both 2024 and 2025 themes
  if (theme !== '2024' && theme !== '2025') {
    return null;
  }
  
  return (
    <div
      style={{
        position: 'absolute',
        top: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        zIndex: 10,
        pointerEvents: 'none'
      }}
    >
      {/* Main Logo with Pink Overlay */}
      <div style={{ position: 'relative' }}>
        {/* BED Logo */}
        <img 
          src={logoImage}
          alt="BED Logo"
          style={{
            width: '400px',
            height: 'auto',
            objectFit: 'contain',
            filter: theme === '2025' 
              ? 'drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.2))' 
              : 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8))',
            marginLeft: '-15px'
          }}
        />
        
        {/* Script overlay - positioned over the THINK text */}
        <div
          style={{
            position: 'absolute',
            top: '25%',
            left: '50%',
            fontFamily: themeConfig.typography.scriptFont,
            fontSize: '5rem',
            fontWeight: '400',
            color: theme === '2025' ? '#374151' : '#000000',
            textShadow: theme === '2025' 
              ? '1px 1px 2px rgba(0, 0, 0, 0.1)' 
              : '2px 2px 4px rgba(255, 255, 255, 0.8)',
            transform: 'rotate(-8deg)',
            zIndex: 2,
            letterSpacing: '0.1em',
            WebkitTextFillColor: theme === '2025' ? '#374151' : '#000000'
          }}
        >
          map
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
      {/*<div
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
      </div>*/}
      
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

export default BEDmapHeader;