import React, { memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { THEMES } from '../utils/blockUtils';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

/**
 * Performance Dashboard Component
 * Shows real-time performance metrics for the BED Map
 * Only visible in development mode or when explicitly enabled
 */
const PerformanceDashboard = memo(({ 
  theme = '2025', 
  isVisible = false, 
  onToggle,
  position = 'bottom-right' 
}) => {
  const themeConfig = THEMES[theme];
  const { metrics, getPerformanceScore, exportMetrics } = usePerformanceMonitor();
  const [_refreshCount, setRefreshCount] = useState(0);

  // Auto-refresh metrics every 2 seconds
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setRefreshCount(c => c + 1);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isVisible]);

  const score = getPerformanceScore();
  const scoreColor = score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444';

  const formatTime = (ms) => {
    if (!ms) return 'N/A';
    return `${Math.round(ms)}ms`;
  };

  const formatMemory = (memInfo) => {
    if (!memInfo) return 'N/A';
    return `${memInfo.used}MB / ${memInfo.total}MB`;
  };

  const positionStyles = {
    'bottom-right': { bottom: '1rem', right: '1rem' },
    'bottom-left': { bottom: '1rem', left: '1rem' },
    'top-right': { top: '1rem', right: '1rem' },
    'top-left': { top: '1rem', left: '1rem' }
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: 'fixed',
          ...positionStyles[position],
          zIndex: 1000,
          padding: '0.5rem',
          backgroundColor: '#1F2937',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '0.75rem',
          cursor: 'pointer',
          fontFamily: 'monospace',
          opacity: 0.7,
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.7'}
        title="Show Performance Dashboard"
      >
        ⚡ {score}
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        ...positionStyles[position],
        width: '320px',
        maxHeight: '400px',
        overflowY: 'auto',
        backgroundColor: themeConfig.isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)',
        borderRadius: '1rem',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        border: themeConfig.isDark ? '2px solid rgba(255,255,255,0.1)' : '2px solid rgba(0,0,0,0.1)',
        backdropFilter: 'blur(20px)',
        zIndex: 1000,
        fontFamily: 'monospace',
        fontSize: '0.75rem',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1rem 0.5rem',
        borderBottom: `1px solid ${themeConfig.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>⚡ Performance</span>
          <div
            style={{
              backgroundColor: scoreColor,
              color: '#FFFFFF',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontWeight: 'bold',
              fontSize: '0.7rem'
            }}
          >
            {score}
          </div>
        </div>
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            color: themeConfig.textColor,
            opacity: 0.6,
            cursor: 'pointer',
            fontSize: '1rem',
            padding: '0.25rem'
          }}
          onMouseOver={(e) => e.target.style.opacity = '1'}
          onMouseOut={(e) => e.target.style.opacity = '0.6'}
        >
          ✕
        </button>
      </div>

      {/* Metrics */}
      <div style={{ padding: '1rem' }}>
        
        {/* Core Web Vitals */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ 
            fontWeight: 'bold', 
            marginBottom: '0.5rem',
            color: themeConfig.textColor
          }}>
            Core Web Vitals
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <div style={{ opacity: 0.7 }}>FCP</div>
              <div style={{ color: scoreColor }}>{formatTime(metrics.firstContentfulPaint)}</div>
            </div>
            <div>
              <div style={{ opacity: 0.7 }}>LCP</div>
              <div style={{ color: scoreColor }}>{formatTime(metrics.largestContentfulPaint)}</div>
            </div>
            <div>
              <div style={{ opacity: 0.7 }}>Page Load</div>
              <div style={{ color: scoreColor }}>{formatTime(metrics.pageLoad)}</div>
            </div>
            <div>
              <div style={{ opacity: 0.7 }}>Memory</div>
              <div style={{ color: scoreColor }}>{formatMemory(metrics.memoryUsage)}</div>
            </div>
          </div>
        </div>

        {/* BED Map Specific */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ 
            fontWeight: 'bold', 
            marginBottom: '0.5rem',
            color: themeConfig.textColor
          }}>
            Map Performance
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <div style={{ opacity: 0.7 }}>Map Load</div>
              <div style={{ color: scoreColor }}>{formatTime(metrics.mapLoadTime)}</div>
            </div>
            <div>
              <div style={{ opacity: 0.7 }}>SVG Load</div>
              <div style={{ color: scoreColor }}>{formatTime(metrics.svgLoadTime)}</div>
            </div>
            <div>
              <div style={{ opacity: 0.7 }}>Data Fetch</div>
              <div style={{ color: scoreColor }}>{formatTime(metrics.dataFetchTime)}</div>
            </div>
          </div>
        </div>

        {/* Component Renders */}
        {Object.keys(metrics.componentRenders).length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '0.5rem',
              color: themeConfig.textColor
            }}>
              Component Renders
            </div>
            <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
              {Object.entries(metrics.componentRenders)
                .sort(([,a], [,b]) => b.lastRender - a.lastRender)
                .slice(0, 5)
                .map(([name, data]) => (
                <div key={name} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.25rem 0',
                  borderBottom: `1px solid ${themeConfig.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
                }}>
                  <span style={{ opacity: 0.8 }}>{name}</span>
                  <span style={{ 
                    color: data.lastRender > 16 ? '#EF4444' : scoreColor 
                  }}>
                    {formatTime(data.lastRender)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Interactions */}
        {metrics.userInteractions.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '0.5rem',
              color: themeConfig.textColor
            }}>
              Recent Actions ({metrics.userInteractions.length})
            </div>
            <div style={{ maxHeight: '80px', overflowY: 'auto' }}>
              {metrics.userInteractions.slice(-3).reverse().map((interaction, i) => (
                <div key={i} style={{
                  padding: '0.25rem 0',
                  opacity: 0.7,
                  fontSize: '0.7rem'
                }}>
                  {interaction.action} • {interaction.target}
                  {interaction.duration && ` (${formatTime(interaction.duration)})`}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button
            onClick={() => {
              const data = exportMetrics();
              console.log('📊 Performance Metrics:', data);
              navigator.clipboard?.writeText(JSON.stringify(data, null, 2));
            }}
            style={{
              flex: 1,
              padding: '0.5rem',
              backgroundColor: '#3B82F6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '0.25rem',
              fontSize: '0.7rem',
              cursor: 'pointer'
            }}
          >
            Export
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              flex: 1,
              padding: '0.5rem',
              backgroundColor: '#6B7280',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '0.25rem',
              fontSize: '0.7rem',
              cursor: 'pointer'
            }}
          >
            Reload
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes slideIn {
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
});

PerformanceDashboard.displayName = 'PerformanceDashboard';

PerformanceDashboard.propTypes = {
  /** Theme variant for styling */
  theme: PropTypes.oneOf(['2024', '2025']),
  /** Visibility state of the dashboard */
  isVisible: PropTypes.bool,
  /** Callback function to toggle visibility */
  onToggle: PropTypes.func,
  /** Position of the dashboard on screen */
  position: PropTypes.oneOf(['bottom-right', 'bottom-left', 'top-right', 'top-left'])
};

PerformanceDashboard.defaultProps = {
  theme: '2025',
  isVisible: false,
  onToggle: null,
  position: 'bottom-right'
};

export default PerformanceDashboard;