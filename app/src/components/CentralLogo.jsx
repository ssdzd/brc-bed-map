import React from 'react';
import { THEMES } from '../utils/blockUtils';

const CentralLogo = ({ theme = '2025' }) => {
  const themeConfig = THEMES[theme];
  
  return (
    <div
      style={{
        position: 'absolute',
        top: '272px', // The Man's Y coordinate from SVG
        left: '622px', // The Man's X coordinate from SVG  
        transform: 'translate(-50%, -50%)',
        width: '200px',
        height: '200px',
        background: themeConfig.centerCircle.background,
        border: themeConfig.centerCircle.border,
        borderRadius: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
        boxShadow: theme === '2024' 
          ? '0 0 30px rgba(255, 105, 180, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.2)'
          : '0 10px 25px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        transition: 'all 0.5s ease',
        animation: theme === '2024' ? 'glow 3s ease-in-out infinite alternate' : 'none'
      }}
    >
      {/* Main B.E.D. Logo */}
      <div
        style={{
          fontSize: '2.5rem',
          fontWeight: '900',
          fontFamily: themeConfig.typography.displayFont,
          color: themeConfig.centerCircle.textColor,
          letterSpacing: '0.2em',
          textAlign: 'center',
          lineHeight: '1',
          marginBottom: '0.5rem',
          textShadow: theme === '2024' 
            ? '2px 2px 4px rgba(173, 20, 87, 0.3)'
            : '1px 1px 2px rgba(0, 0, 0, 0.1)'
        }}
      >
        B.E.D.
      </div>
      
      {/* Subtitle */}
      <div
        style={{
          fontSize: '0.75rem',
          fontWeight: '600',
          fontFamily: themeConfig.typography.primaryFont,
          color: themeConfig.centerCircle.textColor,
          opacity: 0.8,
          textAlign: 'center',
          letterSpacing: '0.1em',
          textTransform: 'uppercase'
        }}
      >
        Bureau of Erotic
        <br />
        Discourse
      </div>
      
      {/* Decorative elements for 2024 theme */}
      {theme === '2024' && (
        <>
          {/* Top sparkle */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '20px',
              width: '6px',
              height: '6px',
              background: '#FFD700',
              borderRadius: '50%',
              boxShadow: '0 0 10px #FFD700',
              animation: 'pulse 2s infinite'
            }}
          />
          
          {/* Bottom sparkle */}
          <div
            style={{
              position: 'absolute',
              bottom: '15px',
              left: '25px',
              width: '4px',
              height: '4px',
              background: '#FF6B35',
              borderRadius: '50%',
              boxShadow: '0 0 8px #FF6B35',
              animation: 'pulse 2.5s infinite'
            }}
          />
        </>
      )}
      
      {/* Ring decoration for professional theme */}
      {theme === '2025' && (
        <div
          style={{
            position: 'absolute',
            inset: '-10px',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            opacity: 0.5
          }}
        />
      )}
      
      {/* Add CSS keyframes for animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes glow {
          0% { 
            box-shadow: 0 0 30px rgba(255, 105, 180, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.2);
          }
          100% { 
            box-shadow: 0 0 50px rgba(255, 105, 180, 0.8), inset 0 0 30px rgba(255, 255, 255, 0.3);
          }
        }
      `}</style>
    </div>
  );
};

export default CentralLogo;