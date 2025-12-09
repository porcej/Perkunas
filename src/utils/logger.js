/**
 * Logging utility for the application
 * Provides environment-aware logging with different log levels
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4,
};

/**
 * Get the current log level based on environment
 * @returns {number} The log level to use
 */
function getLogLevel() {
  const env = process.env.NODE_ENV || "development";
  const logLevelEnv = process.env.VUE_APP_LOG_LEVEL;

  // Allow override via environment variable
  if (logLevelEnv) {
    const level = LOG_LEVELS[logLevelEnv.toUpperCase()];
    if (level !== undefined) return level;
  }

  // Default: show all logs in development, only warnings and errors in production
  return env === "production" ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;
}

const currentLogLevel = getLogLevel();

/**
 * Check if a log level should be displayed
 * @param {number} level - The log level to check
 * @returns {boolean} True if the level should be logged
 */
function shouldLog(level) {
  return level >= currentLogLevel;
}

/**
 * Format log message with timestamp and level
 * @param {string} level - The log level name
 * @param {Array} args - The arguments to log
 * @returns {Array} Formatted arguments
 */
function formatMessage(level, args) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;
  return [prefix, ...args];
}

/**
 * Logger object with different log levels
 */
const logger = {
  /**
   * Log debug messages (only in development)
   * @param {...any} args - Arguments to log
   */
  debug(...args) {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      console.debug(...formatMessage("DEBUG", args));
    }
  },

  /**
   * Log informational messages
   * @param {...any} args - Arguments to log
   */
  info(...args) {
    if (shouldLog(LOG_LEVELS.INFO)) {
      console.info(...formatMessage("INFO", args));
    }
  },

  /**
   * Log warning messages
   * @param {...any} args - Arguments to log
   */
  warn(...args) {
    if (shouldLog(LOG_LEVELS.WARN)) {
      console.warn(...formatMessage("WARN", args));
    }
  },

  /**
   * Log error messages
   * @param {...any} args - Arguments to log
   */
  error(...args) {
    if (shouldLog(LOG_LEVELS.ERROR)) {
      console.error(...formatMessage("ERROR", args));
    }
  },

  /**
   * Log messages (alias for info, for backward compatibility)
   * @param {...any} args - Arguments to log
   */
  log(...args) {
    this.info(...args);
  },
};

export default logger;

