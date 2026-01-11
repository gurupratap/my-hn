/**
 * Logging Module
 *
 * Centralized logging using Pino with structured JSON output.
 * Uses pino-pretty for development readability.
 */

import pino from 'pino';

// Determine environment and log level
// We read directly from process.env to avoid circular dependency with config
const isDevelopment = process.env.NODE_ENV === 'development';
const logLevel = process.env.LOG_LEVEL ?? 'info';

/**
 * Logger configuration options
 */
const loggerOptions: pino.LoggerOptions = {
  level: logLevel,
  // Use ISO 8601 timestamp format
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  // Format the log level as a string for readability
  formatters: {
    level: (label) => ({ level: label }),
  },
};

/**
 * Create the logger instance
 *
 * In development: uses pino-pretty for human-readable output
 * In production: outputs structured JSON for log aggregation
 */
const transport = isDevelopment
  ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    }
  : undefined;

const logger = pino(loggerOptions, transport ? pino.transport(transport) : undefined);

/**
 * Typed logger interface with standard log methods
 */
export interface Logger {
  error: (obj: object | string, msg?: string) => void;
  warn: (obj: object | string, msg?: string) => void;
  info: (obj: object | string, msg?: string) => void;
  debug: (obj: object | string, msg?: string) => void;
}

/**
 * Export the logger instance
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *
 *   logger.info({ userId: 123 }, 'User logged in');
 *   logger.error({ err }, 'Failed to fetch data');
 */
export { logger };

export default logger;
