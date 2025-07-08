import React, { useState } from 'react';
import { THEMES, getThemeColors } from '../utils/blockUtils';
import { StatusIcon } from './PlayaIcons';

const Legend = ({ theme = '2025' }) => {
  const themeConfig = THEMES[theme] || THEMES['2025'];
  const colors = getThemeColors(theme);
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Get the build-time git timestamp
  const lastUpdated = typeof __GIT_LAST_UPDATED__ !== 'undefined' ? __GIT_LAST_UPDATED__ : '07/08/2025';
  
  const items = [
    { 
      status: 'registered', 
      label: 'Started BEDucator program', 
      icon: '▶',
      //description: 'Started BEDucator training'
    },
    { 
      status: 'consent_policy', 
      label: 'Distributed Consent Policy', 
      icon: '📜',
      //description: 'Consent policy implemented'
    },
    { 
      status: 'bed_talk', 
      label: 'Scheduled BED talk', 
      icon: '🗣️',
      //description: 'BED talk scheduled'
    }
  ];

  return (
    <div style={{
      position: 'absolute',
      bottom: '1rem',
      left: '1rem',
      backgroundColor: themeConfig.isOfficial 
        ? 'rgba(0,0,0,0.6)' 
        : themeConfig.isDark 
          ? 'rgba(0,0,0,0.3)' 
          : 'rgba(255,255,255,0.9)',
      padding: '1rem',
      borderRadius: '0.5rem',
      boxShadow: themeConfig.isOfficial 
        ? '0 10px 15px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255,255,255,0.1)' 
        : '0 10px 15px rgba(0, 0, 0, 0.1)',
      border: themeConfig.isOfficial 
        ? '1px solid rgba(255,255,255,0.3)' 
        : themeConfig.isDark 
          ? '1px solid rgba(255,255,255,0.2)' 
          : '1px solid rgba(0,0,0,0.1)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
    onClick={() => setIsExpanded(!isExpanded)}>
      <div className="legend-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isExpanded ? '0.5rem' : '0.25rem',
      }}>
        <h4 style={{
          fontWeight: 'bold',
          fontSize: '0.875rem',
          fontFamily: themeConfig.typography.headingFont,
          margin: 0,
          color: themeConfig.isOfficial ? '#FFFFFF' : themeConfig.textColor
        }}>
          BEDucator Program Progress
        </h4>
        <div className="legend-header-date" style={{
          fontSize: '0.7rem',
          fontFamily: themeConfig.typography.primaryFont,
          color: themeConfig.isOfficial ? '#FFFFFF' : themeConfig.textColor,
          opacity: 0.6
        }}>
          Last Updated: {lastUpdated}
        </div>
      </div>
      
      {!isExpanded && (
        <div style={{
          fontSize: '0.7rem',
          fontFamily: themeConfig.typography.primaryFont,
          color: themeConfig.isOfficial ? '#FFFFFF' : themeConfig.textColor,
          opacity: 0.7,
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          Click to expand
        </div>
      )}
      
      {isExpanded && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {items.map(item => (
          <div 
            key={item.status} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              padding: '0.5rem',
              borderRadius: '0.375rem',
              backgroundColor: themeConfig.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${themeConfig.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = themeConfig.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
              e.currentTarget.style.transform = 'translateX(2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = themeConfig.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)';
              e.currentTarget.style.transform = 'translateX(0px)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div 
                style={{ 
                  width: '1.25rem', 
                  height: '1.25rem', 
                  borderRadius: '0.375rem',
                  backgroundColor: colors[item.status],
                  border: themeConfig.isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 2px 4px ${colors[item.status]}40`
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <StatusIcon 
                  status={item.status} 
                  size="0.875rem" 
                  animated={theme === '2024'}
                />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontSize: '0.8rem',
                fontFamily: themeConfig.typography.primaryFont,
                fontWeight: '500',
                color: themeConfig.isOfficial ? '#FFFFFF' : themeConfig.textColor,
                lineHeight: '1.2'
              }}>
                {item.label}
              </div>
              <div style={{ 
                fontSize: '0.7rem',
                fontFamily: themeConfig.typography.primaryFont,
                color: themeConfig.isOfficial ? '#FFFFFF' : themeConfig.textColor,
                opacity: 0.6,
                lineHeight: '1.1',
                marginTop: '0.125rem'
              }}>
                {item.description}
              </div>
            </div>
          </div>
            ))}
          </div>
          
          {/* Last Updated - Desktop only */}
          <div className="legend-footer-date" style={{
            marginTop: '1rem',
            padding: '0.5rem',
            borderTop: `1px solid ${themeConfig.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <div className="legend-desert-icon" style={{ fontSize: '1rem' }}>🏜️</div>
            <div style={{
              fontSize: '0.7rem',
              fontFamily: themeConfig.typography.primaryFont,
              color: themeConfig.isOfficial ? '#FFFFFF' : themeConfig.textColor,
              opacity: 0.6
            }}>
              Last Updated: {lastUpdated}
            </div>
          </div>
          
          {/* Update BEDmap Button - Mobile only */}
          <div className="mobile-only" style={{
            marginTop: '1rem',
            padding: '0.5rem 0 0 0',
            borderTop: `1px solid ${themeConfig.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent legend toggle
                window.open('https://bedtalks.org/bedmapupdate', '_blank', 'noopener,noreferrer');
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: theme === '2024' ? '#FF69B4' : '#3B82F6',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0.5rem',
                fontFamily: themeConfig.typography.primaryFont,
                fontWeight: '600',
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: theme === '2024' 
                  ? '0 4px 15px rgba(255,105,180,0.3)'
                  : '0 4px 15px rgba(59,130,246,0.3)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = theme === '2024' 
                  ? '0 6px 20px rgba(255,105,180,0.4)'
                  : '0 6px 20px rgba(59,130,246,0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0px)';
                e.target.style.boxShadow = theme === '2024' 
                  ? '0 4px 15px rgba(255,105,180,0.3)'
                  : '0 4px 15px rgba(59,130,246,0.3)';
              }}
            >
              <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
                Don't See Your Camp?<br />
                Update the BEDmap!
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Legend;