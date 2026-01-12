/**
 * HTTP Status Codes
 *
 * Constants for HTTP status codes used throughout the application.
 * Centralizes magic numbers for better maintainability.
 */

export const HttpStatus = {
  // 2xx Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // 4xx Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];

/**
 * Check if a status code indicates a server error (5xx)
 */
export function isServerError(status: number): boolean {
  return status >= 500 && status <= 599;
}

/**
 * Check if a status code indicates a client error (4xx)
 */
export function isClientError(status: number): boolean {
  return status >= 400 && status <= 499;
}
