import React from 'react';
import { parseBlockId, campInBlock, THEMES, getThemeColors } from '../utils/blockUtils';
import { PlayaIcons, StatusIcon } from './PlayaIcons';

const InfoPanel = ({ blockId, camps, theme = '2025', onClose }) => {
  const { street, approximateTime } = parseBlockId(blockId);
  const campsInBlock = camps.filter(camp => 
    campInBlock(camp.placement_address, blockId)
  );
  
  const themeConfig = THEMES[theme];
  const colors = getThemeColors(theme);

  return (
    <div style={{
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      backgroundColor: themeConfig.isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.98)',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      boxShadow: themeConfig.isDark 
        ? '0 25px 50px rgba(255, 105, 180, 0.15), 0 10px 20px rgba(0, 0, 0, 0.4)'
        : '0 25px 50px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.05)',
      maxWidth: '28rem',
      zIndex: 20,
      border: themeConfig.isDark ? '2px solid rgba(255,255,255,0.2)' : '2px solid rgba(0,0,0,0.08)',
      backdropFilter: 'blur(20px)',
      transition: 'all 0.3s ease',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: 'bold',
            fontFamily: themeConfig.typography.headingFont,
            color: themeConfig.textColor,
            margin: 0
          }}>
            Block {blockId}
          </h3>
          <p style={{ 
            fontSize: '0.875rem',
            fontFamily: themeConfig.typography.primaryFont,
            color: themeConfig.textColor,
            opacity: 0.7,
            margin: '0.25rem 0 0 0'
          }}>
            Street {street} near {approximateTime}
          </p>
        </div>
        <button 
          onClick={onClose}
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
      
      {campsInBlock.length > 0 ? (
        <div>
          <p style={{ 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            fontFamily: themeConfig.typography.primaryFont,
            marginBottom: '0.5rem',
            color: themeConfig.textColor
          }}>
            {campsInBlock.length} camp{campsInBlock.length > 1 ? 's' : ''} in this block:
          </p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {campsInBlock.map((camp, index) => (
              <li 
                key={camp.id} 
                style={{ 
                  background: themeConfig.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  borderRadius: '0.5rem',
                  border: `2px solid ${getBEDColor(camp.bed_status, theme)}`,
                  padding: '0.875rem',
                  transition: 'all 0.2s ease',
                  animation: `campSlideIn 0.3s ease-out ${index * 0.1}s both`,
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 25px ${getBEDColor(camp.bed_status, theme)}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <StatusIcon 
                    status={camp.bed_status} 
                    size="1rem" 
                    animated={theme === '2024'}
                  />
                  <div style={{ 
                    fontWeight: '600', 
                    fontSize: '0.95rem',
                    fontFamily: themeConfig.typography.primaryFont,
                    color: themeConfig.textColor
                  }}>
                    {camp.camp_name}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '0.8rem',
                  fontFamily: themeConfig.typography.primaryFont,
                  color: themeConfig.textColor,
                  opacity: 0.75,
                  marginLeft: '1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <PlayaIcons.Camp size="0.8rem" />
                  {camp.placement_address}
                </div>
                <div style={{ 
                  fontSize: '0.8rem',
                  fontFamily: themeConfig.typography.primaryFont,
                  color: getBEDColor(camp.bed_status, theme),
                  fontWeight: '500',
                  marginLeft: '1.75rem',
                  marginTop: '0.25rem'
                }}>
                  {getStatusIcon(camp.bed_status)} {formatStatus(camp.bed_status)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '2rem 1rem',
          background: themeConfig.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          borderRadius: '0.5rem',
          border: `2px dashed ${themeConfig.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>
            <PlayaIcons.Camp size="2rem" />
          </div>
          <p style={{ 
            fontSize: '0.875rem',
            fontFamily: themeConfig.typography.primaryFont,
            color: themeConfig.textColor,
            opacity: 0.7,
            margin: 0
          }}>
            No camps registered in this block
          </p>
        </div>
      )}
      
      {/* CSS Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes campSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
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

const getBEDColor = (status, theme = '2025') => {
  const colors = getThemeColors(theme);
  return colors[status] || colors.none;
};

const getStatusIcon = (status) => {
  const icons = {
    none: '○',
    video_complete: '▶',
    buddy_assigned: '👥',
    fully_implemented: '✓'
  };
  return icons[status] || icons.none;
};

const formatStatus = (status) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default InfoPanel;