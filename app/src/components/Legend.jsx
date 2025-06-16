import React from 'react';
import { THEMES, getThemeColors } from '../utils/blockUtils';

const Legend = ({ theme = '2025' }) => {
  const themeConfig = THEMES[theme];
  const colors = getThemeColors(theme);
  
  const items = [
    { 
      status: 'none', 
      label: 'No Engagement', 
      icon: '○',
      description: 'Not yet contacted'
    },
    { 
      status: 'video_complete', 
      label: 'Video Complete', 
      icon: '▶',
      description: 'Training video watched'
    },
    { 
      status: 'buddy_assigned', 
      label: 'Buddy Assigned', 
      icon: '👥',
      description: 'B.E.D. buddy connected'
    },
    { 
      status: 'fully_implemented', 
      label: 'Fully Implemented', 
      icon: '✓',
      description: 'Complete program adoption'
    }
  ];

  return (
    <div style={{
      position: 'absolute',
      bottom: '1rem',
      left: '1rem',
      backgroundColor: themeConfig.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.9)',
      padding: '1rem',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
      border: themeConfig.isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease'
    }}>
      <h4 style={{
        fontWeight: 'bold',
        fontSize: '0.875rem',
        fontFamily: themeConfig.typography.headingFont,
        marginBottom: '0.5rem',
        color: themeConfig.textColor
      }}>
        B.E.D. Progress
      </h4>
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
                <span style={{
                  fontSize: '0.875rem',
                  opacity: 0.7
                }}>
                  {item.icon}
                </span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontSize: '0.8rem',
                fontFamily: themeConfig.typography.primaryFont,
                fontWeight: '500',
                color: themeConfig.textColor,
                lineHeight: '1.2'
              }}>
                {item.label}
              </div>
              <div style={{ 
                fontSize: '0.7rem',
                fontFamily: themeConfig.typography.primaryFont,
                color: themeConfig.textColor,
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
    </div>
  );
};

export default Legend;