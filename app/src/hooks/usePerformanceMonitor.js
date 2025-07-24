import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Performance monitoring hook for BED Map
 * Collects and tracks various performance metrics
 * Works on GitHub Pages and all deployment environments
 */
export const usePerformanceMonitor = (options = {}) => {
  const {
    enableLogging = process.env.NODE_ENV === 'development',
    sampleRate = 1.0, // 100% sampling by default
    trackNavigation = true,
    trackComponents = true,
    trackUserInteractions = true
  } = options;

  const [metrics, setMetrics] = useState({
    pageLoad: null,
    firstContentfulPaint: null,
    largestContentfulPaint: null,
    cumulativeLayoutShift: null,
    firstInputDelay: null,
    componentRenders: {},
    userInteractions: [],
    memoryUsage: null,
    mapLoadTime: null,
    svgLoadTime: null,
    dataFetchTime: null
  });

  const performanceObserver = useRef(null);
  const componentRenderTimes = useRef({});

  // Initialize performance monitoring
  useEffect(() => {
    if (Math.random() > sampleRate) return;

    // Collect Core Web Vitals
    const collectWebVitals = () => {
      // First Contentful Paint
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              setMetrics(prev => ({
                ...prev,
                firstContentfulPaint: Math.round(entry.startTime)
              }));
              if (enableLogging) {
                console.log(`🎨 FCP: ${Math.round(entry.startTime)}ms`);
              }
            }
            if (entry.name === 'largest-contentful-paint') {
              setMetrics(prev => ({
                ...prev,
                largestContentfulPaint: Math.round(entry.startTime)
              }));
              if (enableLogging) {
                console.log(`🖼️ LCP: ${Math.round(entry.startTime)}ms`);
              }
            }
          }
        });
        
        try {
          observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
          performanceObserver.current = observer;
        } catch (error) {
          console.warn('Performance observer not supported:', error);
        }
      }

      // Page Load Time
      if (trackNavigation && 'performance' in window && 'getEntriesByType' in performance) {
        const navigationEntries = performance.getEntriesByType('navigation');
        if (navigationEntries.length > 0) {
          const nav = navigationEntries[0];
          const pageLoadTime = Math.round(nav.loadEventEnd - nav.navigationStart);
          setMetrics(prev => ({
            ...prev,
            pageLoad: pageLoadTime
          }));
          if (enableLogging) {
            console.log(`⚡ Page Load: ${pageLoadTime}ms`);
          }
        }
      }

      // Memory Usage (if available)
      if ('memory' in performance) {
        const memInfo = {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        };
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memInfo
        }));
        if (enableLogging) {
          console.log(`🧠 Memory: ${memInfo.used}MB / ${memInfo.total}MB`);
        }
      }
    };

    // Delay collection to ensure page is loaded
    const timer = setTimeout(collectWebVitals, 100);

    return () => {
      clearTimeout(timer);
      if (performanceObserver.current) {
        performanceObserver.current.disconnect();
      }
    };
  }, [sampleRate, enableLogging, trackNavigation]);

  // Track component render times
  const trackComponentRender = useCallback((componentName, renderTime = performance.now()) => {
    if (!trackComponents) return;

    const renderDuration = renderTime - (componentRenderTimes.current[componentName] || renderTime);
    
    setMetrics(prev => ({
      ...prev,
      componentRenders: {
        ...prev.componentRenders,
        [componentName]: {
          lastRender: Math.round(renderDuration),
          totalRenders: (prev.componentRenders[componentName]?.totalRenders || 0) + 1,
          averageTime: prev.componentRenders[componentName] 
            ? Math.round((prev.componentRenders[componentName].averageTime + renderDuration) / 2)
            : Math.round(renderDuration)
        }
      }
    }));

    componentRenderTimes.current[componentName] = renderTime;

    if (enableLogging && renderDuration > 16) { // More than one frame
      console.warn(`🐌 Slow render: ${componentName} took ${Math.round(renderDuration)}ms`);
    }
  }, [trackComponents, enableLogging]);

  // Track user interactions
  const trackUserInteraction = useCallback((action, target, duration = null) => {
    if (!trackUserInteractions) return;

    const interaction = {
      action,
      target,
      duration: duration ? Math.round(duration) : null,
      timestamp: Date.now()
    };

    setMetrics(prev => ({
      ...prev,
      userInteractions: [...prev.userInteractions.slice(-50), interaction] // Keep last 50
    }));

    if (enableLogging) {
      console.log(`👆 User action: ${action} on ${target}${duration ? ` (${Math.round(duration)}ms)` : ''}`);
    }
  }, [trackUserInteractions, enableLogging]);

  // Track specific BED Map operations
  const trackMapLoad = useCallback((loadTime) => {
    setMetrics(prev => ({
      ...prev,
      mapLoadTime: Math.round(loadTime)
    }));
    if (enableLogging) {
      console.log(`🗺️ Map loaded: ${Math.round(loadTime)}ms`);
    }
  }, [enableLogging]);

  const trackSvgLoad = useCallback((loadTime) => {
    setMetrics(prev => ({
      ...prev,
      svgLoadTime: Math.round(loadTime)
    }));
    if (enableLogging) {
      console.log(`📐 SVG loaded: ${Math.round(loadTime)}ms`);
    }
  }, [enableLogging]);

  const trackDataFetch = useCallback((fetchTime, source = 'unknown') => {
    setMetrics(prev => ({
      ...prev,
      dataFetchTime: Math.round(fetchTime)
    }));
    if (enableLogging) {
      console.log(`📊 Data fetched (${source}): ${Math.round(fetchTime)}ms`);
    }
  }, [enableLogging]);

  // Performance score calculation
  const getPerformanceScore = useCallback(() => {
    const { firstContentfulPaint, largestContentfulPaint, pageLoad, mapLoadTime } = metrics;
    
    let score = 100;
    
    // Deduct points for slow metrics
    if (firstContentfulPaint > 2000) score -= 20;
    else if (firstContentfulPaint > 1000) score -= 10;
    
    if (largestContentfulPaint > 4000) score -= 25;
    else if (largestContentfulPaint > 2500) score -= 15;
    
    if (pageLoad > 5000) score -= 20;
    else if (pageLoad > 3000) score -= 10;
    
    if (mapLoadTime > 2000) score -= 15;
    else if (mapLoadTime > 1000) score -= 8;
    
    return Math.max(0, score);
  }, [metrics]);

  // Export metrics for analytics
  const exportMetrics = useCallback(() => {
    const exportData = {
      ...metrics,
      performanceScore: getPerformanceScore(),
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      url: window.location.href
    };
    
    return exportData;
  }, [metrics, getPerformanceScore]);

  // Send metrics to external service (optional)
  const sendMetrics = useCallback(async (endpoint) => {
    try {
      const data = exportMetrics();
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (enableLogging) {
        console.log('📈 Metrics sent to:', endpoint);
      }
    } catch (error) {
      console.warn('Failed to send metrics:', error);
    }
  }, [exportMetrics, enableLogging]);

  return {
    metrics,
    trackComponentRender,
    trackUserInteraction,
    trackMapLoad,
    trackSvgLoad,
    trackDataFetch,
    getPerformanceScore,
    exportMetrics,
    sendMetrics
  };
};

// Higher-order component factory for automatic component performance tracking
// Note: This should be used in .jsx files that can handle JSX syntax
export const createPerformanceTracker = (componentName) => {
  return {
    trackRender: (renderTime) => {
      if (window.trackComponentRender) {
        window.trackComponentRender(componentName, renderTime);
      }
    }
  };
};

export default usePerformanceMonitor;