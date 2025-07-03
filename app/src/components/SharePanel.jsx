import React, { useState } from 'react';
import { THEMES } from '../utils/blockUtils';

const SharePanel = ({ 
  theme = '2025', 
  isVisible = false, 
  onToggle, 
  onCopyUrl,
  currentState 
}) => {
  const [copyStatus, setCopyStatus] = useState('');
  const themeConfig = THEMES[theme];
  
  const handleCopyUrl = async () => {
    try {
      const result = await onCopyUrl(currentState);
      if (result.success) {
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus(''), 2000);
      } else {
        setCopyStatus('Failed to copy');
        setTimeout(() => setCopyStatus(''), 3000);
      }
    } catch (error) {
      setCopyStatus('Error');
      setTimeout(() => setCopyStatus(''), 3000);
    }
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        const result = await onCopyUrl(currentState);
        await navigator.share({
          title: 'Burning Man B.E.D. Map',
          text: 'Check out this interactive Bureau of Erotic Discourse progress map for Black Rock City!',
          url: result.url
        });
      } catch (error) {
        // If sharing fails, fall back to copying
        handleCopyUrl();
      }
    } else {
      // If sharing not supported, copy to clipboard
      handleCopyUrl();
    }
  };
  
  if (!isVisible) {
    return (
      <div
        className="share-panel-container"
        style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 35,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <button
          onClick={() => onToggle && onToggle()}
          style={{
            padding: '0.75rem',
            backgroundColor: theme === '2024' ? '#FF69B4' : '#3B82F6',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '0.75rem',
            fontFamily: themeConfig.typography.primaryFont,
            fontWeight: '600',
            fontSize: '0.875rem',
            cursor: 'pointer',
            boxShadow: theme === '2024' 
              ? '0 8px 25px rgba(255,105,180,0.3)'
              : '0 8px 25px rgba(59,130,246,0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            pointerEvents: 'auto'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = theme === '2024' 
              ? '0 12px 35px rgba(255,105,180,0.4)'
              : '0 12px 35px rgba(59,130,246,0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0px)';
            e.target.style.boxShadow = theme === '2024' 
              ? '0 8px 25px rgba(255,105,180,0.3)'
              : '0 8px 25px rgba(59,130,246,0.3)';
          }}
        >
          🔗 Share
        </button>
      </div>
    );
  }
  
  return (
    <div
      style={{
        position: 'absolute',
        left: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '280px',
        backgroundColor: themeConfig.isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.98)',
        borderRadius: '1rem',
        boxShadow: themeConfig.isDark 
          ? '0 25px 50px rgba(255, 105, 180, 0.15), 0 10px 20px rgba(0, 0, 0, 0.4)'
          : '0 25px 50px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.05)',
        border: themeConfig.isDark ? '2px solid rgba(255,255,255,0.2)' : '2px solid rgba(0,0,0,0.08)',
        backdropFilter: 'blur(20px)',
        zIndex: 35,
        transition: 'all 0.3s ease',
        animation: 'slideInLeft 0.3s ease-out',
        pointerEvents: 'auto'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.5rem 0.5rem',
        borderBottom: `1px solid ${themeConfig.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: 'bold',
          fontFamily: themeConfig.typography.headingFont,
          color: themeConfig.textColor,
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🔗 Share Map
        </h3>
        <button
          onClick={() => onToggle && onToggle()}
          style={{
            background: 'none',
            border: 'none',
            color: themeConfig.textColor,
            opacity: 0.6,
            cursor: 'pointer',
            fontSize: '1.25rem',
            padding: '0.25rem',
            borderRadius: '0.25rem',
            transition: 'opacity 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.opacity = '1'}
          onMouseOut={(e) => e.target.style.opacity = '0.6'}
        >
          ✕
        </button>
      </div>
      
      {/* Content */}
      <div style={{ padding: '1rem 1.5rem' }}>
        <p style={{
          fontSize: '0.875rem',
          fontFamily: themeConfig.typography.primaryFont,
          color: themeConfig.textColor,
          opacity: 0.8,
          marginBottom: '1rem',
          lineHeight: '1.4'
        }}>
          Share the current map view with others. The URL will include your current position, zoom level, and selected block.
        </p>
        
        {/* Share Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Native Share Button (if supported) */}
          {navigator.share && (
            <button
              onClick={handleShare}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: theme === '2024' ? '#FF69B4' : '#3B82F6',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0.5rem',
                fontFamily: themeConfig.typography.primaryFont,
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme === '2024' ? '#E91E63' : '#2563EB';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = theme === '2024' ? '#FF69B4' : '#3B82F6';
              }}
            >
              📱 Share
            </button>
          )}
          
          {/* Copy Link Button */}
          <button
            onClick={handleCopyUrl}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: copyStatus === 'Copied!' 
                ? '#22C55E' 
                : (themeConfig.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
              color: copyStatus === 'Copied!' ? '#FFFFFF' : themeConfig.textColor,
              border: `2px solid ${copyStatus === 'Copied!' 
                ? '#22C55E' 
                : (theme === '2024' ? '#FF69B4' : '#3B82F6')}`,
              borderRadius: '0.5rem',
              fontFamily: themeConfig.typography.primaryFont,
              fontWeight: '600',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              if (copyStatus !== 'Copied!') {
                e.target.style.backgroundColor = themeConfig.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)';
              }
            }}
            onMouseLeave={(e) => {
              if (copyStatus !== 'Copied!') {
                e.target.style.backgroundColor = themeConfig.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
              }
            }}
          >
            {copyStatus === 'Copied!' ? '✅' : '📋'} 
            {copyStatus || 'Copy Link'}
          </button>
        </div>
        
        {/* Current State Info */}
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          backgroundColor: themeConfig.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          border: `1px solid ${themeConfig.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
        }}>
          <div style={{
            fontSize: '0.75rem',
            fontFamily: themeConfig.typography.primaryFont,
            color: themeConfig.textColor,
            opacity: 0.7,
            marginBottom: '0.5rem',
            fontWeight: '600'
          }}>
            Current View:
          </div>
          <div style={{
            fontSize: '0.7rem',
            fontFamily: themeConfig.typography.primaryFont,
            color: themeConfig.textColor,
            opacity: 0.6,
            lineHeight: '1.3',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}>
            <div>🎨 Theme: {currentState.theme === '2024' ? '2024 Vibrant' : '2025 Professional'}</div>
            <div>🔍 Zoom: {(currentState.zoom || 1).toFixed(1)}x</div>
            {currentState.selectedBlock && (
              <div>📍 Block: {currentState.selectedBlock}</div>
            )}
            {currentState.search && (
              <div>🔎 Search: "{currentState.search}"</div>
            )}
          </div>
        </div>
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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

export default SharePanel;