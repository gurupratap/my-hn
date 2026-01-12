/**
 * Error Handling Infrastructure
 *
 * Custom error classes for structured error handling throughout the application.
 * All errors extend AppError and include:
 * - Error code for programmatic handling
 * - HTTP status code for API responses
 * - isOperational flag to distinguish from programming errors
 * - Stack trace capture
 */

import { HttpStatus } from './http-status';

/**
 * Error codes for programmatic error handling
 */
export const ErrorCode = {
  GATEWAY_ERROR: 'GATEWAY_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  TIMEOUT: 'TIMEOUT',
} as const;

/**
 * Default error messages
 */
export const ErrorMessage = {
  GATEWAY_ERROR: 'Upstream service error',
  NOT_FOUND: 'Resource not found',
  TIMEOUT: 'Request timed out',
  GENERIC: 'Something went wrong. Please try again later.',
} as const;

/**
 * Base application error class.
 * All custom errors should extend this class.
 */
export class AppError extends Error {
  /**
   * Unique error code for programmatic handling
   */
  public readonly code: string;

  /**
   * HTTP status code for API responses
   */
  public readonly statusCode: number;

  /**
   * Whether this is an operational error (expected) vs programming error (bug)
   * Operational errors are safe to show to users
   */
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    isOperational: boolean = true
  ) {
    super(message);

    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintain proper stack trace for where the error was thrown
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    // Set the error name to the class name
    this.name = this.constructor.name;
  }

  /**
   * Convert error to a plain object for logging or serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      stack: this.stack,
    };
  }
}

/**
 * Error thrown when an upstream API fails.
 * Used for external service failures (e.g., Hacker News API errors).
 * Status: 502 Bad Gateway
 */
export class GatewayError extends AppError {
  constructor(message: string = ErrorMessage.GATEWAY_ERROR) {
    super(message, ErrorCode.GATEWAY_ERROR, HttpStatus.BAD_GATEWAY, true);
  }
}

/**
 * Error thrown when a requested resource is not found.
 * Status: 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(message: string = ErrorMessage.NOT_FOUND) {
    super(message, ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, true);
  }
}

/**
 * Error thrown when an API request times out.
 * Status: 504 Gateway Timeout
 */
export class TimeoutError extends AppError {
  constructor(message: string = ErrorMessage.TIMEOUT) {
    super(message, ErrorCode.TIMEOUT, HttpStatus.GATEWAY_TIMEOUT, true);
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Get a user-friendly error message from any error
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (isAppError(error) && error.isOperational) {
    return error.message;
  }

  // For non-operational errors, return a generic message
  return ErrorMessage.GENERIC;
}
