import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { parseBlockId, campInBlock, THEMES, getThemeColors, blockIdToDisplayAddress, simplifyPlazaName, shouldAddSectorSuffix } from '../utils/blockUtils';
import { PlayaIcons, StatusIcon } from './PlayaIcons';

/**
 * InfoPanel Component - Block Details and Camp Information
 * 
 * Displays detailed information about selected map blocks including:
 * - Camp names and BED participation status
 * - Block address and sector information
 * - Special landmark information (Airport, Ranger HQ, etc.)
 * - Scrollable list with custom scrollbar
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.blockId - Unique identifier for the selected block
 * @param {Array} props.camps - Array of camp objects with status information
 * @param {string} [props.theme='2025'] - Theme variant ('2024' or '2025')
 * @param {Function} props.onClose - Callback function to close the panel
 * @param {boolean} [props.loading=false] - Loading state indicator
 * @returns {JSX.Element} Info panel with block and camp details
 */
const InfoPanel = memo(({ blockId, camps, theme = '2025', onClose, loading = false }) => {
  // Handle special landmark selections
  if (blockId === 'airport-polygon') {
    return renderLandmarkPanel('airport', theme, onClose);
  }
  
  const { street, approximateTime } = parseBlockId(blockId);
  const campsInBlock = camps.filter(camp => 
    campInBlock(camp.placement_address, blockId)
  );
  
  // React hooks for the InfoPanel functionality
  const [scrollTop, setScrollTop] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  
  const themeConfig = THEMES[theme];
  const colors = getThemeColors(theme);
  
  // Calculate max height based on screen size
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const totalMaxHeight = isMobile ? 300 : 500;
  
  // Handle scroll container setup
  useEffect(() => {
    if (containerRef.current && contentRef.current) {
      const containerEl = containerRef.current;
      const contentEl = contentRef.current;
      
      setContainerHeight(containerEl.offsetHeight);
      setContentHeight(contentEl.scrollHeight);
    }
  }, [campsInBlock, setContainerHeight, setContentHeight]);
  
  // Custom scroll handler
  const handleScroll = useCallback((deltaY) => {
    if (contentHeight <= containerHeight) return;
    
    const maxScroll = contentHeight - containerHeight;
    const newScrollTop = Math.max(0, Math.min(maxScroll, scrollTop + deltaY));
    setScrollTop(newScrollTop);
  }, [contentHeight, containerHeight, scrollTop, setScrollTop]);
  
  // Wheel event handler
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    handleScroll(e.deltaY * 0.5);
  }, [handleScroll]);
  return renderInfoPanelContent(blockId, campsInBlock, theme, onClose, loading, {
    scrollTop,
    setScrollTop,
    contentHeight,
    setContentHeight,
    containerHeight,
    setContainerHeight,
    containerRef,
    contentRef,
    themeConfig,
    colors,
    totalMaxHeight,
    handleWheel
  });
});

const renderInfoPanelContent = (blockId, campsInBlock, theme, onClose, loading, state) => {
  const {
    scrollTop,
    setScrollTop,
    contentHeight,
    setContentHeight,
    containerHeight,
    setContainerHeight,
    containerRef,
    contentRef,
    themeConfig,
    colors,
    totalMaxHeight,
    handleWheel
  } = state;
  
  // Account for header and padding in InfoPanel
  // Header (~60px) + padding (1.5rem top + bottom = ~48px) + margins = ~120px
  const headerAndPaddingHeight = 120;
  const maxContentHeight = totalMaxHeight - headerAndPaddingHeight;

  return (
    <div
      style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
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
        animation: 'slideInRight 0.3s ease-out',
        padding: '1.5rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: themeConfig.isDark ? '#FFFFFF' : '#000000',
            fontFamily: themeConfig.typography.displayFont
          }}>
            {customTitle || (blockId ? 
              (shouldAddSectorSuffix(blockId) 
                ? `${simplifyPlazaName(blockIdToDisplayAddress(blockId))} Sector`
                : simplifyPlazaName(blockIdToDisplayAddress(blockId))
              ) : 'Select a Block')}
          </h2>
          {blockId && (
            <p style={{
              fontSize: '0.875rem',
              color: themeConfig.isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
              margin: 0,
              fontFamily: themeConfig.typography.bodyFont
            }}>
              {campsInBlock.length} {campsInBlock.length === 1 ? 'Camp' : 'Camps'}
            </p>
          )}
        </div>
        {blockId && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: themeConfig.isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
              cursor: 'pointer',
              padding: '0.5rem',
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = themeConfig.isDark ? '#FFFFFF' : '#000000'}
            onMouseOut={(e) => e.currentTarget.style.color = themeConfig.isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'}
          >
            ×
          </button>
        )}
      </div>
      
      {loading ? (
        <div style={{ 
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              border: `2px solid ${themeConfig.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
              borderTop: `2px solid ${themeConfig.isDark ? '#FF69B4' : '#3B82F6'}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
          <div style={{
            color: themeConfig.textColor,
            fontSize: '0.875rem',
            fontFamily: themeConfig.typography.primaryFont,
            opacity: 0.7
          }}>
            Loading camp data...
          </div>
        </div>
      ) : campsInBlock.length > 0 ? (
        <div style={{ position: 'relative' }}>
          {/* Scrollable Container */}
          <div 
            ref={containerRef}
            onWheel={(e) => {
              e.preventDefault();
              const newScrollTop = Math.max(0, Math.min(scrollTop + e.deltaY, contentHeight - containerHeight));
              setScrollTop(newScrollTop);
            }}
            style={{
              height: `${containerHeight}px`,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <div 
              ref={contentRef}
              style={{
                transform: `translateY(-${scrollTop}px)`,
                transition: 'transform 0.1s ease'
              }}>
              {campsInBlock.map((camp, index) => (
                <div
                  key={camp.id}
                  style={{
                    padding: '1rem',
                    backgroundColor: themeConfig.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    borderRadius: '0.75rem',
                    marginBottom: index < campsInBlock.length - 1 ? '1rem' : 0
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '0.5rem',
                      backgroundColor: themeConfig.isDark 
                        ? `${getBEDColor(camp.bed_status, theme)}20`  // 20% opacity background
                        : `${getBEDColor(camp.bed_status, theme)}10`, // 10% opacity background
                      border: `2px solid ${getBEDColor(camp.bed_status, theme)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      color: getBEDColor(camp.bed_status, theme)
                    }}>
                      {getStatusIcon(camp.bed_status)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        margin: '0 0 0.25rem 0',
                        color: themeConfig.isDark ? '#FFFFFF' : '#000000',
                        fontFamily: themeConfig.typography.displayFont
                      }}>
                        {camp.camp_name}
                      </h2>
                      <p style={{
                        fontSize: '0.875rem',
                        color: themeConfig.isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                        margin: '0',
                        fontFamily: themeConfig.typography.bodyFont
                      }}>
                        {camp.original_address || camp.placement_address}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Custom Scrollbar */}
          {contentHeight > containerHeight && (
            <div style={{
              position: 'absolute',
              right: '5px',
              top: '5px',
              bottom: '5px',
              width: '12px',
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '6px'
            }}>
              <div 
                style={{
                  position: 'absolute',
                  top: `${(scrollTop / (contentHeight - containerHeight)) * (containerHeight - 40)}px`,
                  width: '12px',
                  height: '40px',
                  backgroundColor: '#FE8803',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  // Add drag functionality if needed
                }}
              />
            </div>
          )}
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
    registered: '🧡',
    consent_policy: '💜',
    bed_talk: '💖'
  };
  return icons[status] || icons.none;
};

}; // Close renderInfoPanelContent function

const formatStatus = (status) => {
  const statusLabels = {
    none: 'Not Registered',
    registered: 'Registered and started BEDucator program',
    consent_policy: 'Distributed Unique Consent Policy',
    bed_talk: 'Scheduled BED talk'
  };
  return statusLabels[status] || statusLabels.none;
};

const renderLandmarkPanel = (landmarkType, theme, onClose) => {
  const themeConfig = THEMES[theme];
  
  const landmarkInfo = {
    airport: {
      title: "BRC Airport",
      description: "Black Rock City Airport serves the Burning Man community with private aircraft access.",
      details: [
        "Private aircraft only",
        "Located outside the event perimeter", 
        "Registration required for aircraft",
        "Ground transportation available to event"
      ],
      icon: "✈️"
    }
  };
  
  const info = landmarkInfo[landmarkType];
  
  return (
    <div
      style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
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
        animation: 'slideInRight 0.3s ease-out',
        padding: '1.5rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: themeConfig.isDark ? '#FFFFFF' : '#000000',
            fontFamily: themeConfig.typography.displayFont,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>{info.icon}</span>
            {info.title}
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: themeConfig.isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
            margin: 0,
            fontFamily: themeConfig.typography.bodyFont
          }}>
            Special Landmark
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: themeConfig.isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
            cursor: 'pointer',
            padding: '0.5rem',
            fontSize: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = themeConfig.isDark ? '#FFFFFF' : '#000000'}
          onMouseOut={(e) => e.currentTarget.style.color = themeConfig.isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'}
        >
          ×
        </button>
      </div>
      
      <div style={{
        padding: '1rem',
        backgroundColor: themeConfig.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
        borderRadius: '0.75rem',
        marginBottom: '1rem'
      }}>
        <p style={{
          fontSize: '0.875rem',
          fontFamily: themeConfig.typography.primaryFont,
          color: themeConfig.textColor,
          margin: '0 0 1rem 0',
          lineHeight: '1.4'
        }}>
          {info.description}
        </p>
        
        <ul style={{
          fontSize: '0.8rem',
          fontFamily: themeConfig.typography.primaryFont,
          color: themeConfig.isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
          margin: 0,
          paddingLeft: '1.2rem',
          lineHeight: '1.6'
        }}>
          {info.details.map((detail, index) => (
            <li key={index} style={{ marginBottom: '0.25rem' }}>
              {detail}
            </li>
          ))}
        </ul>
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
});

InfoPanel.displayName = 'InfoPanel';

InfoPanel.propTypes = {
  /** Unique identifier for the selected block */
  blockId: PropTypes.string.isRequired,
  /** Array of camp objects with status information */
  camps: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    camp_name: PropTypes.string.isRequired,
    placement_address: PropTypes.string.isRequired,
    bed_status: PropTypes.oneOf(['none', 'registered', 'consent_policy', 'bed_talk']).isRequired
  })).isRequired,
  /** Theme variant for styling */
  theme: PropTypes.oneOf(['2024', '2025']),
  /** Callback function to close the panel */
  onClose: PropTypes.func.isRequired,
  /** Loading state indicator */
  loading: PropTypes.bool
};

InfoPanel.defaultProps = {
  theme: '2025',
  loading: false
};

export default InfoPanel;