/**
 * Centralized logging utility for BED Map
 * 
 * Provides structured logging with different levels and context.
 * Automatically handles development vs production environments.
 * 
 * @module logger
 */

/**
 * Log levels with numeric values for filtering
 */
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

/**
 * Current log level based on environment
 * Production: INFO and above
 * Development: All levels
 */
const CURRENT_LOG_LEVEL = process.env.NODE_ENV === 'production' 
  ? LOG_LEVELS.INFO 
  : LOG_LEVELS.TRACE;

/**
 * Log level colors for console output
 */
const LOG_COLORS = {
  ERROR: '#EF4444',
  WARN: '#F59E0B', 
  INFO: '#3B82F6',
  DEBUG: '#8B5CF6',
  TRACE: '#6B7280'
};

/**
 * Log level emojis for better visual identification
 */
const LOG_EMOJIS = {
  ERROR: '❌',
  WARN: '⚠️',
  INFO: 'ℹ️',
  DEBUG: '🔍',
  TRACE: '👁️'
};

/**
 * Format timestamp for log entries
 * @returns {string} Formatted timestamp
 */
const getTimestamp = () => {
  return new Date().toISOString().substr(11, 8);
};

/**
 * Create a logger with context
 * @param {string} context - Context name (e.g., 'MapView', 'DataFetch')
 * @returns {Object} Logger instance with level methods
 */
export const createLogger = (context) => {
  const log = (level, message, data = null) => {
    if (LOG_LEVELS[level] > CURRENT_LOG_LEVEL) return;
    
    const timestamp = getTimestamp();
    const emoji = LOG_EMOJIS[level];
    const color = LOG_COLORS[level];
    
    const prefix = `${emoji} [${timestamp}] ${context}:`;
    
    if (data) {
      console.groupCollapsed(`%c${prefix} ${message}`, `color: ${color}; font-weight: bold;`);
      console.log('Data:', data);
      console.groupEnd();
    } else {
      console.log(`%c${prefix} ${message}`, `color: ${color}; font-weight: bold;`);
    }
  };

  return {
    error: (message, data) => log('ERROR', message, data),
    warn: (message, data) => log('WARN', message, data),
    info: (message, data) => log('INFO', message, data),
    debug: (message, data) => log('DEBUG', message, data),
    trace: (message, data) => log('TRACE', message, data),
    
    // Performance logging
    perf: (operation, duration, data) => {
      const level = duration > 100 ? 'WARN' : 'DEBUG';
      log(level, `⚡ ${operation} took ${Math.round(duration)}ms`, data);
    },
    
    // Data logging
    data: (operation, count, data) => {
      log('INFO', `📊 ${operation}: ${count} items`, data);
    },
    
    // User action logging
    action: (action, target, data) => {
      log('DEBUG', `👆 User ${action} on ${target}`, data);
    }
  };
};

// Pre-configured loggers for common contexts
export const logger = {
  map: createLogger('Map'),
  data: createLogger('Data'),
  ui: createLogger('UI'),
  perf: createLogger('Performance'),
  error: createLogger('Error')
};

/**
 * Global error handler for unhandled errors
 */
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error.error('Unhandled promise rejection', {
      reason: event.reason,
      promise: event.promise
    });
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    logger.error.error('Global error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
  });
};