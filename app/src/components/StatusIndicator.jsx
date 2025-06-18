import React from 'react';
import { THEMES, getThemeColors } from '../utils/blockUtils';

const StatusIndicator = ({ status, theme = '2025', size = 'medium', showIcon = true, showLabel = false }) => {
  const themeConfig = THEMES[theme];
  const colors = getThemeColors(theme);
  
  const statusConfig = {
    none: { icon: '○', label: 'Not Registered', color: colors.none },
    registered: { icon: '▶', label: 'Registered and started BEDucator program', color: colors.registered },
    consent_policy: { icon: '📜', label: 'Distributed Unique Consent Policy', color: colors.consent_policy },
    bed_talk: { icon: '🗣️', label: 'Scheduled BED talk', color: colors.bed_talk }
  };
  
  const sizeConfig = {
    small: { indicator: '0.75rem', icon: '0.7rem', text: '0.7rem' },
    medium: { indicator: '1rem', icon: '0.8rem', text: '0.8rem' },
    large: { indicator: '1.25rem', icon: '1rem', text: '0.9rem' }
  };
  
  const config = statusConfig[status] || statusConfig.none;
  const sizing = sizeConfig[size];
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      <div
        style={{
          width: sizing.indicator,
          height: sizing.indicator,
          borderRadius: '50%',
          backgroundColor: config.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: themeConfig.isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)',
          boxShadow: `0 2px 8px ${config.color}40`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {showIcon && (
          <span style={{
            fontSize: sizing.icon,
            color: getContrastColor(config.color),
            fontWeight: 'bold'
          }}>
            {config.icon}
          </span>
        )}
        
        {/* Animated ring for fully implemented */}
        {status === 'fully_implemented' && (
          <div
            style={{
              position: 'absolute',
              inset: '-2px',
              border: '2px solid transparent',
              borderTop: `2px solid ${config.color}`,
              borderRadius: '50%',
              animation: 'spin 2s linear infinite'
            }}
          />
        )}
        
        {/* Pulse for buddy assigned */}
        {status === 'buddy_assigned' && (
          <div
            style={{
              position: 'absolute',
              inset: '-4px',
              border: `2px solid ${config.color}`,
              borderRadius: '50%',
              opacity: 0.3,
              animation: 'pulse 2s ease-in-out infinite'
            }}
          />
        )}
      </div>
      
      {showLabel && (
        <span style={{
          fontSize: sizing.text,
          fontFamily: themeConfig.typography.primaryFont,
          color: themeConfig.textColor,
          fontWeight: '500'
        }}>
          {config.label}
        </span>
      )}
      
      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.1; }
        }
      `}</style>
    </div>
  );
};

// Helper function to determine text color based on background
const getContrastColor = (backgroundColor) => {
  // Simple contrast calculation
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

export default StatusIndicator;