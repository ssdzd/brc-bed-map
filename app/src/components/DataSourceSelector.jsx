import React from 'react';
import { THEMES } from '../utils/blockUtils';

const DataSourceSelector = ({ 
  currentSource = 'airtable', 
  onSourceChange, 
  theme = '2025',
  mockDataStats = null 
}) => {
  const themeConfig = THEMES[theme];
  
  const handleSourceChange = (source) => {
    if (onSourceChange) {
      onSourceChange(source);
    }
  };

  const formatPercentage = (value) => `${Math.round(value * 100)}%`;

  return (
    <div 
      style={{
        position: 'absolute',
        top: '10vh',
        left: '1rem',
        zIndex: 50,
        backgroundColor: themeConfig.isOfficial 
          ? 'rgba(255, 255, 255, 0.95)' 
          : themeConfig.containerBg,
        border: themeConfig.isOfficial 
          ? '2px solid rgba(0, 0, 0, 0.1)'
          : `2px solid ${themeConfig.isDark ? '#374151' : '#e5e7eb'}`,
        borderRadius: '12px',
        padding: '1rem',
        boxShadow: themeConfig.isOfficial
          ? '0 4px 6px rgba(0, 0, 0, 0.1)'
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        backdropFilter: themeConfig.isOfficial ? 'blur(10px)' : 'none',
        minWidth: '280px'
      }}
    >
      <h3 style={{
        margin: '0 0 0.75rem 0',
        fontSize: '1rem',
        fontWeight: 'bold',
        color: themeConfig.isOfficial 
          ? '#1f2937'
          : themeConfig.textColor,
        fontFamily: themeConfig.typography.headingFont
      }}>
        Data Source
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          padding: '0.5rem',
          borderRadius: '6px',
          backgroundColor: currentSource === 'airtable' 
            ? (themeConfig.isDark ? '#374151' : '#f3f4f6')
            : 'transparent',
          transition: 'background-color 0.2s ease'
        }}>
          <input
            type="radio"
            name="dataSource"
            value="airtable"
            checked={currentSource === 'airtable'}
            onChange={() => handleSourceChange('airtable')}
            style={{ 
              marginRight: '0.5rem',
              accentColor: themeConfig.isDark ? '#9333ea' : '#6366f1'
            }}
          />
          <span style={{
            color: themeConfig.isOfficial 
              ? '#374151'
              : themeConfig.textColor,
            fontFamily: themeConfig.typography.primaryFont,
            fontSize: '0.875rem'
          }}>
            Live Airtable Data
          </span>
        </label>
        
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          padding: '0.5rem',
          borderRadius: '6px',
          backgroundColor: currentSource === 'mock' 
            ? (themeConfig.isDark ? '#374151' : '#f3f4f6')
            : 'transparent',
          transition: 'background-color 0.2s ease'
        }}>
          <input
            type="radio"
            name="dataSource"
            value="mock"
            checked={currentSource === 'mock'}
            onChange={() => handleSourceChange('mock')}
            style={{ 
              marginRight: '0.5rem',
              accentColor: themeConfig.isDark ? '#9333ea' : '#6366f1'
            }}
          />
          <span style={{
            color: themeConfig.isOfficial 
              ? '#374151'
              : themeConfig.textColor,
            fontFamily: themeConfig.typography.primaryFont,
            fontSize: '0.875rem'
          }}>
            Mock Test Data
          </span>
        </label>
      </div>

      {currentSource === 'mock' && mockDataStats && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: themeConfig.isDark ? '#1f2937' : '#f9fafb',
          borderRadius: '6px',
          border: `1px solid ${themeConfig.isDark ? '#374151' : '#e5e7eb'}`
        }}>
          <h4 style={{
            margin: '0 0 0.5rem 0',
            fontSize: '0.75rem',
            fontWeight: 'semibold',
            color: themeConfig.isOfficial 
              ? '#6b7280'
              : themeConfig.textColor,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: themeConfig.typography.primaryFont
          }}>
            Mock Data Distribution
          </h4>
          
          <div style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '0.25rem 0.75rem',
              fontFamily: themeConfig.typography.primaryFont
            }}>
              <span style={{ color: themeConfig.isOfficial ? '#6b7280' : themeConfig.textColor }}>
                Esplanade:
              </span>
              <span style={{ 
                color: themeConfig.isOfficial ? '#1f2937' : themeConfig.textColor,
                fontWeight: '500'
              }}>
                90% 🩷 10% 💜
              </span>
              
              <span style={{ color: themeConfig.isOfficial ? '#6b7280' : themeConfig.textColor }}>
                A-B rings:
              </span>
              <span style={{ 
                color: themeConfig.isOfficial ? '#1f2937' : themeConfig.textColor,
                fontWeight: '500'
              }}>
                75% 🩷 20% 💜 5% 🧡
              </span>
              
              <span style={{ color: themeConfig.isOfficial ? '#6b7280' : themeConfig.textColor }}>
                C-D rings:
              </span>
              <span style={{ 
                color: themeConfig.isOfficial ? '#1f2937' : themeConfig.textColor,
                fontWeight: '500'
              }}>
                50% 🩷 20% 💜 10% 🧡 20% ⚪
              </span>
              
              <span style={{ color: themeConfig.isOfficial ? '#6b7280' : themeConfig.textColor }}>
                E-F rings:
              </span>
              <span style={{ 
                color: themeConfig.isOfficial ? '#1f2937' : themeConfig.textColor,
                fontWeight: '500'
              }}>
                40% 🩷 20% 💜 10% 🧡 30% ⚪
              </span>
            </div>
            
            {mockDataStats && (
              <div style={{ 
                marginTop: '0.5rem', 
                paddingTop: '0.5rem',
                borderTop: `1px solid ${themeConfig.isDark ? '#374151' : '#e5e7eb'}`
              }}>
                <span style={{ 
                  color: themeConfig.isOfficial ? '#6b7280' : themeConfig.textColor,
                  fontWeight: '500'
                }}>
                  Total: {mockDataStats.totalCamps} camps
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSourceSelector;