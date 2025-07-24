import React from 'react';
import { THEMES } from '../utils/blockUtils';

const BackgroundOverlay = ({ theme = '2025' }) => {
  const _themeConfig = THEMES[theme];
  
  if (theme === '2025') {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 70%)
          `,
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
    );
  }
  
  if (theme === '2024') {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        {/* Main radial overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 40%),
              radial-gradient(circle at 70% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 30%),
              radial-gradient(circle at 50% 50%, rgba(255, 107, 53, 0.08) 0%, transparent 60%)
            `
          }}
        />
        
        {/* Floating orbs */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            right: '20%',
            width: '60px',
            height: '60px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        
        <div
          style={{
            position: 'absolute',
            bottom: '25%',
            left: '15%',
            width: '40px',
            height: '40px',
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        />
        
        <div
          style={{
            position: 'absolute',
            top: '40%',
            left: '10%',
            width: '25px',
            height: '25px',
            background: 'radial-gradient(circle, rgba(255, 107, 53, 0.4) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 5s ease-in-out infinite'
          }}
        />
        
        {/* Add CSS keyframes */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
            33% { transform: translateY(-20px) rotate(120deg); opacity: 1; }
            66% { transform: translateY(10px) rotate(240deg); opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }
  
  return null;
};

export default BackgroundOverlay;