import React from 'react';
import { THEMES } from '../utils/blockUtils';

const ErrorDisplay = ({ 
  theme = '2025', 
  error, 
  onRetry, 
  title = 'Something went wrong',
  showDetails = false 
}) => {
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
        gap: '1.5rem',
        zIndex: 100,
        backgroundColor: themeConfig.isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: themeConfig.isDark 
          ? '0 25px 50px rgba(255, 105, 180, 0.15), 0 10px 20px rgba(0, 0, 0, 0.4)'
          : '0 25px 50px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.05)',
        border: `2px solid #ef4444`,
        backdropFilter: 'blur(20px)',
        minWidth: '300px',
        maxWidth: '500px'
      }}
    >
      {/* Error Icon */}
      <div
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '2rem',
          fontWeight: 'bold'
        }}
      >
        !
      </div>
      
      {/* Error Title */}
      <div
        style={{
          color: themeConfig.textColor,
          fontSize: '1.25rem',
          fontWeight: '600',
          fontFamily: themeConfig.typography.headingFont,
          textAlign: 'center'
        }}
      >
        {title}
      </div>
      
      {/* Error Message */}
      {error && (
        <div
          style={{
            color: '#ef4444',
            fontSize: '0.875rem',
            fontFamily: themeConfig.typography.primaryFont,
            textAlign: 'center',
            backgroundColor: themeConfig.isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            maxWidth: '100%',
            wordBreak: 'break-word'
          }}
        >
          {typeof error === 'string' ? error : error.message || 'An unexpected error occurred'}
        </div>
      )}
      
      {/* Error Details (optional) */}
      {showDetails && error && (
        <details style={{ width: '100%' }}>
          <summary
            style={{
              color: themeConfig.textColor,
              fontSize: '0.75rem',
              fontFamily: themeConfig.typography.primaryFont,
              cursor: 'pointer',
              opacity: 0.7,
              marginBottom: '0.5rem'
            }}
          >
            Technical Details
          </summary>
          <pre
            style={{
              color: themeConfig.textColor,
              fontSize: '0.625rem',
              fontFamily: 'monospace',
              backgroundColor: themeConfig.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
              padding: '0.5rem',
              borderRadius: '0.25rem',
              maxHeight: '100px',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {error.stack || error.toString()}
          </pre>
        </details>
      )}
      
      {/* Retry Button */}
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            backgroundColor: themeConfig.isDark ? '#FF69B4' : '#3B82F6',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            fontFamily: themeConfig.typography.primaryFont,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            ':hover': {
              backgroundColor: themeConfig.isDark ? '#FF1493' : '#2563EB'
            }
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = themeConfig.isDark ? '#FF1493' : '#2563EB';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = themeConfig.isDark ? '#FF69B4' : '#3B82F6';
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;