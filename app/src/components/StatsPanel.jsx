import React, { useState, useMemo } from 'react';
import { THEMES, getThemeColors } from '../utils/blockUtils';
import { PlayaIcons, StatusIcon } from './PlayaIcons';

const StatsPanel = ({ camps, theme = '2025', isVisible = false, onToggle }) => {
  const themeConfig = THEMES[theme];
  const colors = getThemeColors(theme);
  
  const stats = useMemo(() => {
    if (!camps || camps.length === 0) {
      return {
        total: 0,
        byStatus: {
          none: 0,
          video_complete: 0,
          buddy_assigned: 0,
          fully_implemented: 0
        },
        completionRate: 0,
        activeBlocks: 0
      };
    }
    
    const byStatus = camps.reduce((acc, camp) => {
      acc[camp.bed_status] = (acc[camp.bed_status] || 0) + 1;
      return acc;
    }, {
      none: 0,
      video_complete: 0,
      buddy_assigned: 0,
      fully_implemented: 0
    });
    
    const activePrograms = camps.filter(camp => camp.bed_status !== 'none').length;
    const completionRate = camps.length > 0 ? (activePrograms / camps.length) * 100 : 0;
    
    // Count unique blocks with camps
    const uniqueBlocks = new Set(camps.map(camp => {
      const address = camp.placement_address;
      const parts = address.split(' ');
      return `${parts[0]}_${parts[2]}`;
    }));
    
    return {
      total: camps.length,
      byStatus,
      completionRate: Math.round(completionRate),
      activeBlocks: uniqueBlocks.size,
      activePrograms
    };
  }, [camps]);
  
  if (!isVisible) {
    return (
      <div
        style={{
          position: 'absolute',
          top: '6rem',
          right: '1rem',
          zIndex: 15
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
          📊 Stats
        </button>
      </div>
    );
  }
  
  const statusItems = [
    { 
      status: 'none', 
      label: 'No Engagement',
      count: stats.byStatus.none
    },
    { 
      status: 'video_complete', 
      label: 'Video Complete',
      count: stats.byStatus.video_complete
    },
    { 
      status: 'buddy_assigned', 
      label: 'Buddy Assigned',
      count: stats.byStatus.buddy_assigned
    },
    { 
      status: 'fully_implemented', 
      label: 'Fully Implemented',
      count: stats.byStatus.fully_implemented
    }
  ];
  
  return (
    <div
      style={{
        position: 'absolute',
        top: '6rem',
        right: '1rem',
        width: '320px',
        backgroundColor: themeConfig.isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.98)',
        borderRadius: '1rem',
        boxShadow: themeConfig.isDark 
          ? '0 25px 50px rgba(255, 105, 180, 0.15), 0 10px 20px rgba(0, 0, 0, 0.4)'
          : '0 25px 50px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.05)',
        border: themeConfig.isDark ? '2px solid rgba(255,255,255,0.2)' : '2px solid rgba(0,0,0,0.08)',
        backdropFilter: 'blur(20px)',
        zIndex: 15,
        transition: 'all 0.3s ease',
        animation: 'slideInRight 0.3s ease-out'
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
          📊 B.E.D. Statistics
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
      
      {/* Overview Stats */}
      <div style={{ padding: '1rem 1.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {/* Total Camps */}
          <div style={{
            textAlign: 'center',
            padding: '1rem',
            borderRadius: '0.75rem',
            background: theme === '2024' 
              ? 'linear-gradient(135deg, rgba(255,105,180,0.2) 0%, rgba(255,20,147,0.1) 100%)'
              : 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(30,64,175,0.1) 100%)',
            border: `1px solid ${theme === '2024' ? 'rgba(255,105,180,0.3)' : 'rgba(59,130,246,0.3)'}`
          }}>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              fontFamily: themeConfig.typography.displayFont,
              color: theme === '2024' ? '#FF1493' : '#1E40AF'
            }}>
              {stats.total}
            </div>
            <div style={{
              fontSize: '0.75rem',
              fontFamily: themeConfig.typography.primaryFont,
              color: themeConfig.textColor,
              opacity: 0.8,
              marginTop: '0.25rem'
            }}>
              Total Camps
            </div>
          </div>
          
          {/* Completion Rate */}
          <div style={{
            textAlign: 'center',
            padding: '1rem',
            borderRadius: '0.75rem',
            background: theme === '2024' 
              ? 'linear-gradient(135deg, rgba(255,212,0,0.2) 0%, rgba(255,193,7,0.1) 100%)'
              : 'linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(22,163,74,0.1) 100%)',
            border: `1px solid ${theme === '2024' ? 'rgba(255,212,0,0.3)' : 'rgba(34,197,94,0.3)'}`
          }}>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              fontFamily: themeConfig.typography.displayFont,
              color: theme === '2024' ? '#FFD700' : '#16A34A'
            }}>
              {stats.completionRate}%
            </div>
            <div style={{
              fontSize: '0.75rem',
              fontFamily: themeConfig.typography.primaryFont,
              color: themeConfig.textColor,
              opacity: 0.8,
              marginTop: '0.25rem'
            }}>
              Engagement Rate
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            fontFamily: themeConfig.typography.primaryFont,
            color: themeConfig.textColor,
            marginBottom: '0.5rem'
          }}>
            Program Adoption Progress
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: themeConfig.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            borderRadius: '4px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div
              style={{
                width: `${stats.completionRate}%`,
                height: '100%',
                background: theme === '2024' 
                  ? 'linear-gradient(90deg, #FF69B4 0%, #FFD700 100%)'
                  : 'linear-gradient(90deg, #3B82F6 0%, #22C55E 100%)',
                borderRadius: '4px',
                transition: 'width 0.8s ease-out',
                animation: 'progressFill 1s ease-out'
              }}
            />
          </div>
          <div style={{
            fontSize: '0.75rem',
            fontFamily: themeConfig.typography.primaryFont,
            color: themeConfig.textColor,
            opacity: 0.7,
            marginTop: '0.25rem'
          }}>
            {stats.activePrograms} of {stats.total} camps actively participating
          </div>
        </div>
        
        {/* Status Breakdown */}
        <div>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            fontFamily: themeConfig.typography.primaryFont,
            color: themeConfig.textColor,
            marginBottom: '0.75rem'
          }}>
            Status Breakdown
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {statusItems.map((item, index) => {
              const percentage = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
              
              return (
                <div
                  key={item.status}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.5rem',
                    backgroundColor: themeConfig.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${colors[item.status]}40`,
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <StatusIcon 
                      status={item.status} 
                      size="0.875rem" 
                      animated={theme === '2024'}
                    />
                    <span style={{
                      fontSize: '0.8rem',
                      fontFamily: themeConfig.typography.primaryFont,
                      color: themeConfig.textColor,
                      fontWeight: '500'
                    }}>
                      {item.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      fontFamily: themeConfig.typography.displayFont,
                      color: themeConfig.textColor
                    }}>
                      {item.count}
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontFamily: themeConfig.typography.primaryFont,
                      color: themeConfig.textColor,
                      opacity: 0.6
                    }}>
                      ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Active Blocks */}
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          backgroundColor: themeConfig.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          border: `1px solid ${themeConfig.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '0.8rem',
            fontFamily: themeConfig.typography.primaryFont,
            color: themeConfig.textColor,
            opacity: 0.8
          }}>
            <PlayaIcons.Camp size="0.8rem" /> Active Blocks: <strong>{stats.activeBlocks}</strong>
          </div>
        </div>
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
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes progressFill {
          from {
            width: 0;
          }
          to {
            width: ${stats.completionRate}%;
          }
        }
      `}</style>
    </div>
  );
};

export default StatsPanel;