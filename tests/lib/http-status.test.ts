/**
 * Tests for HTTP Status Code utilities
 */

import { HttpStatus, isServerError, isClientError } from '../../lib/http-status';

describe('HttpStatus constants', () => {
  describe('2xx Success', () => {
    it('OK is 200', () => {
      expect(HttpStatus.OK).toBe(200);
    });

    it('CREATED is 201', () => {
      expect(HttpStatus.CREATED).toBe(201);
    });

    it('NO_CONTENT is 204', () => {
      expect(HttpStatus.NO_CONTENT).toBe(204);
    });
  });

  describe('4xx Client Errors', () => {
    it('BAD_REQUEST is 400', () => {
      expect(HttpStatus.BAD_REQUEST).toBe(400);
    });

    it('UNAUTHORIZED is 401', () => {
      expect(HttpStatus.UNAUTHORIZED).toBe(401);
    });

    it('FORBIDDEN is 403', () => {
      expect(HttpStatus.FORBIDDEN).toBe(403);
    });

    it('NOT_FOUND is 404', () => {
      expect(HttpStatus.NOT_FOUND).toBe(404);
    });

    it('UNPROCESSABLE_ENTITY is 422', () => {
      expect(HttpStatus.UNPROCESSABLE_ENTITY).toBe(422);
    });

    it('TOO_MANY_REQUESTS is 429', () => {
      expect(HttpStatus.TOO_MANY_REQUESTS).toBe(429);
    });
  });

  describe('5xx Server Errors', () => {
    it('INTERNAL_SERVER_ERROR is 500', () => {
      expect(HttpStatus.INTERNAL_SERVER_ERROR).toBe(500);
    });

    it('BAD_GATEWAY is 502', () => {
      expect(HttpStatus.BAD_GATEWAY).toBe(502);
    });

    it('SERVICE_UNAVAILABLE is 503', () => {
      expect(HttpStatus.SERVICE_UNAVAILABLE).toBe(503);
    });

    it('GATEWAY_TIMEOUT is 504', () => {
      expect(HttpStatus.GATEWAY_TIMEOUT).toBe(504);
    });
  });
});

describe('isServerError', () => {
  it('returns true for 500', () => {
    expect(isServerError(500)).toBe(true);
  });

  it('returns true for 502', () => {
    expect(isServerError(502)).toBe(true);
  });

  it('returns true for 503', () => {
    expect(isServerError(503)).toBe(true);
  });

  it('returns true for 504', () => {
    expect(isServerError(504)).toBe(true);
  });

  it('returns true for 599', () => {
    expect(isServerError(599)).toBe(true);
  });

  it('returns false for 400', () => {
    expect(isServerError(400)).toBe(false);
  });

  it('returns false for 404', () => {
    expect(isServerError(404)).toBe(false);
  });

  it('returns false for 200', () => {
    expect(isServerError(200)).toBe(false);
  });
});

describe('isClientError', () => {
  it('returns true for 400', () => {
    expect(isClientError(400)).toBe(true);
  });

  it('returns true for 401', () => {
    expect(isClientError(401)).toBe(true);
  });

  it('returns true for 403', () => {
    expect(isClientError(403)).toBe(true);
  });

  it('returns true for 404', () => {
    expect(isClientError(404)).toBe(true);
  });

  it('returns true for 429', () => {
    expect(isClientError(429)).toBe(true);
  });

  it('returns true for 499', () => {
    expect(isClientError(499)).toBe(true);
  });

  it('returns false for 500', () => {
    expect(isClientError(500)).toBe(false);
  });

  it('returns false for 200', () => {
    expect(isClientError(200)).toBe(false);
  });
});
