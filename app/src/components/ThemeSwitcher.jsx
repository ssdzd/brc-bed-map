import React from 'react';
import { THEMES } from '../utils/blockUtils';

const ThemeSwitcher = ({ currentTheme, onThemeChange }) => {
  const theme = THEMES[currentTheme];
  
  return (
    <div style={{
      position: 'absolute',
      top: '1rem',
      right: '5rem',
      display: 'flex',
      gap: '0.5rem',
      zIndex: 15,
      backgroundColor: theme.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.9)',
      padding: '0.5rem',
      borderRadius: '0.5rem',
      border: theme.isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)',
      backdropFilter: 'blur(10px)'
    }}>
      <span style={{ 
        fontSize: '12px', 
        fontFamily: theme.typography.primaryFont,
        color: theme.textColor,
        alignSelf: 'center',
        fontWeight: '500'
      }}>
        Theme:
      </span>
      
      {Object.keys(THEMES).map(themeKey => (
        <button
          key={themeKey}
          onClick={() => onThemeChange(themeKey)}
          style={{
            padding: '0.375rem 0.75rem',
            fontSize: '12px',
            fontWeight: '500',
            fontFamily: theme.typography.primaryFont,
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            backgroundColor: currentTheme === themeKey 
              ? (theme.isDark ? '#FFFFFF' : '#374151')
              : 'transparent',
            color: currentTheme === themeKey 
              ? (theme.isDark ? '#000000' : '#FFFFFF')
              : theme.textColor,
            transition: 'all 0.2s ease',
            border: currentTheme === themeKey 
              ? 'none'
              : `1px solid ${theme.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`
          }}
          onMouseOver={(e) => {
            if (currentTheme !== themeKey) {
              e.target.style.backgroundColor = theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
            }
          }}
          onMouseOut={(e) => {
            if (currentTheme !== themeKey) {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          {themeKey}
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;