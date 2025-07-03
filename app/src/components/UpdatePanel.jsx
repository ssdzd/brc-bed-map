import React from 'react';
import { THEMES } from '../utils/blockUtils';

const UpdatePanel = ({ theme = '2025', isVisible = false, onToggle }) => {
  const themeConfig = THEMES[theme];
  
  const handleUpdateClick = () => {
    window.open('https://bedtalks.org/bedmapupdate', '_blank', 'noopener,noreferrer');
  };
  
  if (!isVisible) {
    return (
      <div
        className="update-panel-container"
        style={{
          position: 'absolute',
          left: '1rem',
          top: '1rem', // Very top left
          zIndex: 35,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <button
          onClick={handleUpdateClick}
          style={{
            padding: '0.75rem 1rem',
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
          <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
            Don't See Your Camp?<br />
            Update the BEDmap
          </div>
        </button>
      </div>
    );
  }
  
  return (
    <div
      style={{
        position: 'absolute',
        left: '1rem',
        top: '1rem', // Very top left
        width: '280px',
        backgroundColor: themeConfig.isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.98)',
        borderRadius: '1rem',
        boxShadow: themeConfig.isDark 
          ? '0 25px 50px rgba(255, 105, 180, 0.15), 0 10px 20px rgba(0, 0, 0, 0.4)'
          : '0 25px 50px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.05)',
        border: themeConfig.isDark ? '2px solid rgba(255,255,255,0.2)' : '2px solid rgba(0,0,0,0.08)',
        backdropFilter: 'blur(20px)',
        zIndex: 15,
        transition: 'all 0.3s ease',
        animation: 'slideInLeft 0.3s ease-out'
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
          📝 Update the BEDmap
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
      <div style={{ padding: '1.5rem' }}>
        <div style={{
          marginBottom: '1.5rem'
        }}>
          <p style={{
            fontSize: '0.875rem',
            fontFamily: themeConfig.typography.primaryFont,
            color: themeConfig.textColor,
            margin: '0 0 1rem 0',
            lineHeight: '1.5'
          }}>
            Have updates about your camp's B.E.D. progress? Submit your information to keep the map current!
          </p>
          
          <div style={{
            padding: '1rem',
            borderRadius: '0.75rem',
            backgroundColor: themeConfig.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${theme === '2024' ? 'rgba(255,105,180,0.2)' : 'rgba(59,130,246,0.2)'}`,
            marginBottom: '1rem'
          }}>
            <h4 style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              fontFamily: themeConfig.typography.primaryFont,
              color: themeConfig.textColor,
              margin: '0 0 0.5rem 0'
            }}>
              Update Information For:
            </h4>
            <ul style={{
              fontSize: '0.8rem',
              fontFamily: themeConfig.typography.primaryFont,
              color: themeConfig.isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
              margin: 0,
              paddingLeft: '1.2rem',
              lineHeight: '1.6'
            }}>
              <li>Registration status changes</li>
              <li>Consent policy implementation</li>
              <li>BED talk scheduling</li>
              <li>Camp placement updates</li>
            </ul>
          </div>
        </div>
        
        {/* Action Button */}
        <button
          onClick={handleUpdateClick}
          style={{
            width: '100%',
            padding: '0.875rem 1.25rem',
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
            justifyContent: 'center',
            gap: '0.5rem'
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
          🚀 Submit Update
        </button>
        
        <p style={{
          fontSize: '0.75rem',
          fontFamily: themeConfig.typography.primaryFont,
          color: themeConfig.isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
          margin: '0.75rem 0 0 0',
          textAlign: 'center',
          lineHeight: '1.4'
        }}>
          Opens bedtalks.org/bedmapupdate in a new tab
        </p>
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default UpdatePanel;