/**
 * Retry Utility
 *
 * Provides retry functionality with exponential backoff for resilient API calls.
 * Used by adapters to handle transient failures gracefully.
 */

import { isAppError } from './errors';
import { HttpStatus, isServerError, isClientError } from './http-status';
import { logger } from './logger';

/**
 * Configuration options for retry behavior
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: from API_RETRY_COUNT env or 3) */
  maxRetries: number;
  /** Initial delay in milliseconds before first retry (default: 1000) */
  initialDelay: number;
  /** Maximum delay in milliseconds between retries (default: 10000) */
  maxDelay: number;
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier: number;
}

/**
 * Default retry options
 * Uses API_RETRY_COUNT from environment if available
 */
const getDefaultRetryCount = (): number => {
  const envValue = process.env.API_RETRY_COUNT;
  if (envValue) {
    const parsed = parseInt(envValue, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  return 3;
};

export const defaultRetryOptions: RetryOptions = {
  maxRetries: getDefaultRetryCount(),
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

/**
 * Error interface for external HTTP-like errors (e.g., fetch errors)
 * that are not AppError instances
 */
interface ExternalHttpError extends Error {
  status?: number;
  statusCode?: number;
  code?: string;
}

/** Network error codes that indicate transient failures */
const NETWORK_ERROR_CODES = new Set([
  'ECONNRESET',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'ENOTFOUND',
  'ENETUNREACH',
  'EAI_AGAIN',
  'EPIPE',
  'ECONNABORTED',
]);

/** Error message patterns indicating network failures */
const NETWORK_ERROR_PATTERNS = [
  'network error',
  'failed to fetch',
  'network request failed',
  'timeout',
  'aborted',
];

/**
 * Check if a status code indicates a retryable error
 */
function isRetryableStatusCode(status: number | undefined): boolean | null {
  if (status === undefined) return null;
  if (isServerError(status)) return true;
  if (status === HttpStatus.TOO_MANY_REQUESTS) return true;
  if (isClientError(status)) return false;
  return null;
}

/**
 * Check if error message indicates a network error
 */
function hasNetworkErrorMessage(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return NETWORK_ERROR_PATTERNS.some((pattern) => lowerMessage.includes(pattern));
}

/**
 * Determines if an error is retryable based on its type and status code.
 *
 * Retryable conditions:
 * - 5xx server errors (500-599)
 * - 429 Too Many Requests (rate limited)
 * - Network errors (ECONNRESET, ETIMEDOUT, ENOTFOUND, etc.)
 *
 * Non-retryable:
 * - 4xx client errors (except 429)
 *
 * @param error - The error to evaluate
 * @returns true if the error is retryable, false otherwise
 */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  // Check if it's an AppError from our error infrastructure
  if (isAppError(error)) {
    return isRetryableStatusCode(error.statusCode) === true;
  }

  // Handle external HTTP-like errors (e.g., from fetch)
  const httpError = error as ExternalHttpError;
  const status = httpError.status ?? httpError.statusCode;

  const statusResult = isRetryableStatusCode(status);
  if (statusResult !== null) {
    return statusResult;
  }

  if (httpError.code && NETWORK_ERROR_CODES.has(httpError.code)) {
    return true;
  }

  return hasNetworkErrorMessage(error.message);
}

/**
 * Creates a promise that resolves after the specified delay.
 *
 * @param ms - Delay in milliseconds
 * @returns Promise that resolves after the delay
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculates the delay for the next retry attempt using exponential backoff.
 *
 * @param attempt - Current attempt number (0-indexed)
 * @param options - Retry options
 * @returns Delay in milliseconds, capped at maxDelay
 */
export function calculateBackoff(attempt: number, options: RetryOptions): number {
  const exponentialDelay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt);
  return Math.min(exponentialDelay, options.maxDelay);
}

/**
 * Wraps an async function with retry logic using exponential backoff.
 *
 * Only retries on retryable errors (5xx, 429, network errors).
 * Non-retryable errors (4xx except 429) are thrown immediately.
 *
 * @param fn - Async function to execute with retries
 * @param options - Partial retry options (merged with defaults)
 * @returns Promise resolving to the function's result
 * @throws The last error if all retries are exhausted
 *
 * @example
 * const result = await withRetry(
 *   () => fetchData(url),
 *   { maxRetries: 5 }
 * );
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts: RetryOptions = { ...defaultRetryOptions, ...options };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      lastError = error;

      // Check if we should retry
      if (!isRetryableError(error)) {
        logger.debug(
          { err: error, attempt },
          'Non-retryable error encountered, throwing immediately'
        );
        throw error;
      }

      // Check if we have retries left
      if (attempt >= opts.maxRetries) {
        logger.warn(
          { err: error, attempt, maxRetries: opts.maxRetries },
          'Max retries exhausted, throwing error'
        );
        throw error;
      }

      // Calculate backoff delay
      const backoffDelay = calculateBackoff(attempt, opts);

      logger.info(
        {
          attempt: attempt + 1,
          maxRetries: opts.maxRetries,
          delayMs: backoffDelay,
          errorMessage: error.message,
        },
        `Retry attempt ${attempt + 1}/${opts.maxRetries} after ${backoffDelay}ms`
      );

      await delay(backoffDelay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError ?? new Error('Retry failed with unknown error');
}
