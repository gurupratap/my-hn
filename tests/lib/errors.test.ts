/**
 * Tests for Error Handling Infrastructure
 *
 * Validates that all custom error classes have correct properties
 * and behave as expected.
 */

import {
  AppError,
  ApiAdapterError,
  NotFoundError,
  TimeoutError,
  isAppError,
  getUserFriendlyMessage,
} from '../../lib/errors';

describe('AppError', () => {
  it('has correct properties', () => {
    const error = new AppError('Test error', 'TEST_ERROR', 500, true);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(true);
    expect(error.name).toBe('AppError');
  });

  it('captures stack trace', () => {
    const error = new AppError('Test error', 'TEST_ERROR', 500);

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('AppError');
  });

  it('defaults isOperational to true', () => {
    const error = new AppError('Test error', 'TEST_ERROR', 500);

    expect(error.isOperational).toBe(true);
  });

  it('can set isOperational to false', () => {
    const error = new AppError('Test error', 'TEST_ERROR', 500, false);

    expect(error.isOperational).toBe(false);
  });

  it('toJSON returns correct structure', () => {
    const error = new AppError('Test error', 'TEST_ERROR', 500);
    const json = error.toJSON();

    expect(json).toMatchObject({
      name: 'AppError',
      message: 'Test error',
      code: 'TEST_ERROR',
      statusCode: 500,
      isOperational: true,
    });
    expect(json.stack).toBeDefined();
  });
});

describe('ApiAdapterError', () => {
  it('has correct status code (502)', () => {
    const error = new ApiAdapterError();

    expect(error.statusCode).toBe(502);
  });

  it('has correct error code', () => {
    const error = new ApiAdapterError();

    expect(error.code).toBe('API_ADAPTER_ERROR');
  });

  it('has default message', () => {
    const error = new ApiAdapterError();

    expect(error.message).toBe('External API error');
  });

  it('accepts custom message', () => {
    const error = new ApiAdapterError('HN API failed');

    expect(error.message).toBe('HN API failed');
  });

  it('is instanceof AppError', () => {
    const error = new ApiAdapterError();

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(ApiAdapterError);
  });

  it('captures stack trace', () => {
    const error = new ApiAdapterError();

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('ApiAdapterError');
  });
});

describe('NotFoundError', () => {
  it('has correct status code (404)', () => {
    const error = new NotFoundError();

    expect(error.statusCode).toBe(404);
  });

  it('has correct error code', () => {
    const error = new NotFoundError();

    expect(error.code).toBe('NOT_FOUND');
  });

  it('has default message', () => {
    const error = new NotFoundError();

    expect(error.message).toBe('Resource not found');
  });

  it('accepts custom message', () => {
    const error = new NotFoundError('Post not found');

    expect(error.message).toBe('Post not found');
  });

  it('is instanceof AppError', () => {
    const error = new NotFoundError();

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(NotFoundError);
  });

  it('captures stack trace', () => {
    const error = new NotFoundError();

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('NotFoundError');
  });
});

describe('TimeoutError', () => {
  it('has correct status code (504)', () => {
    const error = new TimeoutError();

    expect(error.statusCode).toBe(504);
  });

  it('has correct error code', () => {
    const error = new TimeoutError();

    expect(error.code).toBe('TIMEOUT');
  });

  it('has default message', () => {
    const error = new TimeoutError();

    expect(error.message).toBe('Request timed out');
  });

  it('accepts custom message', () => {
    const error = new TimeoutError('API request exceeded 10s');

    expect(error.message).toBe('API request exceeded 10s');
  });

  it('is instanceof AppError', () => {
    const error = new TimeoutError();

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(TimeoutError);
  });

  it('captures stack trace', () => {
    const error = new TimeoutError();

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('TimeoutError');
  });
});

describe('isAppError', () => {
  it('returns true for AppError', () => {
    const error = new AppError('Test', 'TEST', 500);

    expect(isAppError(error)).toBe(true);
  });

  it('returns true for ApiAdapterError', () => {
    const error = new ApiAdapterError();

    expect(isAppError(error)).toBe(true);
  });

  it('returns true for NotFoundError', () => {
    const error = new NotFoundError();

    expect(isAppError(error)).toBe(true);
  });

  it('returns true for TimeoutError', () => {
    const error = new TimeoutError();

    expect(isAppError(error)).toBe(true);
  });

  it('returns false for standard Error', () => {
    const error = new Error('Standard error');

    expect(isAppError(error)).toBe(false);
  });

  it('returns false for non-error values', () => {
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
    expect(isAppError('string')).toBe(false);
    expect(isAppError(123)).toBe(false);
    expect(isAppError({})).toBe(false);
  });
});

describe('getUserFriendlyMessage', () => {
  it('returns error message for operational AppError', () => {
    const error = new AppError('Custom error message', 'CUSTOM', 500, true);

    expect(getUserFriendlyMessage(error)).toBe('Custom error message');
  });

  it('returns generic message for non-operational AppError', () => {
    const error = new AppError('Internal error', 'INTERNAL', 500, false);

    expect(getUserFriendlyMessage(error)).toBe(
      'Something went wrong. Please try again later.'
    );
  });

  it('returns generic message for standard Error', () => {
    const error = new Error('Standard error');

    expect(getUserFriendlyMessage(error)).toBe(
      'Something went wrong. Please try again later.'
    );
  });

  it('returns generic message for non-error values', () => {
    expect(getUserFriendlyMessage(null)).toBe(
      'Something went wrong. Please try again later.'
    );
    expect(getUserFriendlyMessage('string error')).toBe(
      'Something went wrong. Please try again later.'
    );
  });
});
