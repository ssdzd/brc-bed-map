import React from 'react';
import { THEMES } from '../utils/blockUtils';

const LoadingSpinner = ({ theme = '2025', message = 'Loading...' }) => {
  const themeConfig = THEMES[theme];
  
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        zIndex: 100,
        backgroundColor: themeConfig.isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: themeConfig.isDark 
          ? '0 25px 50px rgba(255, 105, 180, 0.15), 0 10px 20px rgba(0, 0, 0, 0.4)'
          : '0 25px 50px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.05)',
        border: themeConfig.isDark ? '2px solid rgba(255,255,255,0.2)' : '2px solid rgba(0,0,0,0.08)',
        backdropFilter: 'blur(20px)',
        minWidth: '200px'
      }}
    >
      {/* Spinning circle */}
      <div
        style={{
          width: '40px',
          height: '40px',
          border: `3px solid ${themeConfig.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
          borderTop: `3px solid ${themeConfig.isDark ? '#FF69B4' : '#3B82F6'}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      
      {/* Loading message */}
      <div
        style={{
          color: themeConfig.textColor,
          fontSize: '1rem',
          fontWeight: '500',
          fontFamily: themeConfig.typography.primaryFont,
          textAlign: 'center'
        }}
      >
        {message}
      </div>
      
      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;