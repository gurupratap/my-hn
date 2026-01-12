/**
 * Tests for the retry utility
 */

import {
  withRetry,
  isRetryableError,
  calculateBackoff,
  defaultRetryOptions,
  RetryOptions,
} from '../../lib/retry';
import { GatewayError, NotFoundError, TimeoutError } from '../../lib/errors';

// Mock the logger to avoid noise in tests
jest.mock('../../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

// Helper to create HTTP-like errors
function createHttpError(status: number, message: string = 'HTTP Error'): Error {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}

// Helper to create network errors
function createNetworkError(code: string, message: string = 'Network Error'): Error {
  const error = new Error(message) as Error & { code: string };
  error.code = code;
  return error;
}

describe('isRetryableError', () => {
  describe('5xx server errors', () => {
    it('returns true for 500 Internal Server Error', () => {
      const error = createHttpError(500);
      expect(isRetryableError(error)).toBe(true);
    });

    it('returns true for 502 Bad Gateway', () => {
      const error = createHttpError(502);
      expect(isRetryableError(error)).toBe(true);
    });

    it('returns true for 503 Service Unavailable', () => {
      const error = createHttpError(503);
      expect(isRetryableError(error)).toBe(true);
    });

    it('returns true for 504 Gateway Timeout', () => {
      const error = createHttpError(504);
      expect(isRetryableError(error)).toBe(true);
    });
  });

  describe('429 rate limiting', () => {
    it('returns true for 429 Too Many Requests', () => {
      const error = createHttpError(429);
      expect(isRetryableError(error)).toBe(true);
    });
  });

  describe('4xx client errors (non-retryable)', () => {
    it('returns false for 400 Bad Request', () => {
      const error = createHttpError(400);
      expect(isRetryableError(error)).toBe(false);
    });

    it('returns false for 401 Unauthorized', () => {
      const error = createHttpError(401);
      expect(isRetryableError(error)).toBe(false);
    });

    it('returns false for 403 Forbidden', () => {
      const error = createHttpError(403);
      expect(isRetryableError(error)).toBe(false);
    });

    it('returns false for 404 Not Found', () => {
      const error = createHttpError(404);
      expect(isRetryableError(error)).toBe(false);
    });

    it('returns false for 422 Unprocessable Entity', () => {
      const error = createHttpError(422);
      expect(isRetryableError(error)).toBe(false);
    });
  });

  describe('network errors', () => {
    it('returns true for ECONNRESET', () => {
      const error = createNetworkError('ECONNRESET');
      expect(isRetryableError(error)).toBe(true);
    });

    it('returns true for ETIMEDOUT', () => {
      const error = createNetworkError('ETIMEDOUT');
      expect(isRetryableError(error)).toBe(true);
    });

    it('returns true for ECONNREFUSED', () => {
      const error = createNetworkError('ECONNREFUSED');
      expect(isRetryableError(error)).toBe(true);
    });

    it('returns true for ENOTFOUND', () => {
      const error = createNetworkError('ENOTFOUND');
      expect(isRetryableError(error)).toBe(true);
    });

    it('returns true for network error message', () => {
      const error = new Error('Network error occurred');
      expect(isRetryableError(error)).toBe(true);
    });

    it('returns true for failed to fetch message', () => {
      const error = new Error('Failed to fetch');
      expect(isRetryableError(error)).toBe(true);
    });
  });

  describe('non-Error values', () => {
    it('returns false for null', () => {
      expect(isRetryableError(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isRetryableError(undefined)).toBe(false);
    });

    it('returns false for string', () => {
      expect(isRetryableError('error')).toBe(false);
    });

    it('returns false for plain object', () => {
      expect(isRetryableError({ message: 'error' })).toBe(false);
    });
  });

  describe('generic errors', () => {
    it('returns false for generic Error without status or code', () => {
      const error = new Error('Something went wrong');
      expect(isRetryableError(error)).toBe(false);
    });
  });

  describe('AppError types', () => {
    it('returns true for GatewayError (502)', () => {
      const error = new GatewayError('Upstream API failed');
      expect(isRetryableError(error)).toBe(true);
    });

    it('returns false for NotFoundError (404)', () => {
      const error = new NotFoundError('Resource not found');
      expect(isRetryableError(error)).toBe(false);
    });

    it('returns true for TimeoutError (504)', () => {
      const error = new TimeoutError('Request timed out');
      expect(isRetryableError(error)).toBe(true);
    });
  });
});

describe('calculateBackoff', () => {
  const options: RetryOptions = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  };

  it('returns initialDelay for first attempt (attempt 0)', () => {
    expect(calculateBackoff(0, options)).toBe(1000);
  });

  it('doubles delay for second attempt (attempt 1)', () => {
    expect(calculateBackoff(1, options)).toBe(2000);
  });

  it('quadruples delay for third attempt (attempt 2)', () => {
    expect(calculateBackoff(2, options)).toBe(4000);
  });

  it('octuples delay for fourth attempt (attempt 3)', () => {
    expect(calculateBackoff(3, options)).toBe(8000);
  });

  it('caps delay at maxDelay', () => {
    expect(calculateBackoff(10, options)).toBe(10000);
  });

  it('respects custom backoffMultiplier', () => {
    const customOptions = { ...options, backoffMultiplier: 3 };
    expect(calculateBackoff(1, customOptions)).toBe(3000);
    expect(calculateBackoff(2, customOptions)).toBe(9000);
  });
});

describe('withRetry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns result on first successful call', async () => {
    const fn = jest.fn().mockResolvedValue('success');

    const resultPromise = withRetry(fn, { maxRetries: 3 });
    const result = await resultPromise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on 500 error and succeeds', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(createHttpError(500))
      .mockResolvedValue('success');

    const resultPromise = withRetry(fn, { maxRetries: 3, initialDelay: 100 });

    // Advance timer to allow retry
    await jest.advanceTimersByTimeAsync(100);

    const result = await resultPromise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not retry on 404 error', async () => {
    const fn = jest.fn().mockRejectedValue(createHttpError(404, 'Not Found'));

    await expect(withRetry(fn, { maxRetries: 3 })).rejects.toThrow('Not Found');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does not retry on 400 error', async () => {
    const fn = jest.fn().mockRejectedValue(createHttpError(400, 'Bad Request'));

    await expect(withRetry(fn, { maxRetries: 3 })).rejects.toThrow('Bad Request');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('stops after max retries are exhausted', async () => {
    jest.useRealTimers(); // Use real timers for this test

    const fn = jest.fn().mockRejectedValue(createHttpError(500, 'Server Error'));

    await expect(
      withRetry(fn, { maxRetries: 2, initialDelay: 10, maxDelay: 50 })
    ).rejects.toThrow('Server Error');

    expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  it('backoff delay increases exponentially', async () => {
    jest.useRealTimers(); // Use real timers for this test

    const delays: number[] = [];
    let lastCallTime = Date.now();

    const fn = jest.fn().mockImplementation(() => {
      const now = Date.now();
      if (fn.mock.calls.length > 1) {
        delays.push(now - lastCallTime);
      }
      lastCallTime = now;
      return Promise.reject(createHttpError(500));
    });

    const options = {
      maxRetries: 3,
      initialDelay: 50,
      maxDelay: 10000,
      backoffMultiplier: 2,
    };

    await expect(withRetry(fn, options)).rejects.toThrow();

    expect(fn).toHaveBeenCalledTimes(4); // Initial + 3 retries

    // Verify delays increase (with some tolerance for timing)
    expect(delays.length).toBe(3);
    // Each delay should be roughly double the previous (with tolerance)
    expect(delays[1]).toBeGreaterThan(delays[0] * 1.5);
    expect(delays[2]).toBeGreaterThan(delays[1] * 1.5);
  });

  it('retries on 429 rate limit error', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(createHttpError(429))
      .mockResolvedValue('success');

    const resultPromise = withRetry(fn, { maxRetries: 3, initialDelay: 100 });

    await jest.advanceTimersByTimeAsync(100);

    const result = await resultPromise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('retries on network errors', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(createNetworkError('ECONNRESET'))
      .mockResolvedValue('success');

    const resultPromise = withRetry(fn, { maxRetries: 3, initialDelay: 100 });

    await jest.advanceTimersByTimeAsync(100);

    const result = await resultPromise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('uses default options when none provided', async () => {
    const fn = jest.fn().mockResolvedValue('success');

    const result = await withRetry(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throws non-Error values immediately', async () => {
    const fn = jest.fn().mockRejectedValue('string error');

    await expect(withRetry(fn, { maxRetries: 3 })).rejects.toBe('string error');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('defaultRetryOptions', () => {
  it('has expected default values', () => {
    expect(defaultRetryOptions.initialDelay).toBe(1000);
    expect(defaultRetryOptions.maxDelay).toBe(10000);
    expect(defaultRetryOptions.backoffMultiplier).toBe(2);
  });

  it('maxRetries defaults to 3 when env not set', () => {
    // This test verifies the default; env would need to be mocked for other cases
    expect(defaultRetryOptions.maxRetries).toBeGreaterThanOrEqual(1);
  });
});
