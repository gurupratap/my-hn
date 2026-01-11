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
 * Error thrown when an API adapter encounters an error.
 * Used for upstream API failures (e.g., Hacker News API errors).
 * Status: 502 Bad Gateway
 */
export class ApiAdapterError extends AppError {
  constructor(message: string = 'External API error') {
    super(message, 'API_ADAPTER_ERROR', 502, true);
  }
}

/**
 * Error thrown when a requested resource is not found.
 * Status: 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND', 404, true);
  }
}

/**
 * Error thrown when an API request times out.
 * Status: 504 Gateway Timeout
 */
export class TimeoutError extends AppError {
  constructor(message: string = 'Request timed out') {
    super(message, 'TIMEOUT', 504, true);
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
  return 'Something went wrong. Please try again later.';
}
