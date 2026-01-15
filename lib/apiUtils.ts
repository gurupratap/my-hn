/**
 * API Utility Functions
 *
 * Shared helpers for API route handlers.
 */

/**
 * Parses a string parameter to an integer with a default fallback.
 */
export function parseIntParam(value: string | null, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Validates that a page number is valid (>= 1).
 */
export function isValidPage(page: number): boolean {
  return page >= 1;
}

/**
 * Validates that a page size is within allowed bounds.
 */
export function isValidPageSize(pageSize: number, maxSize: number = 100): boolean {
  return pageSize >= 1 && pageSize <= maxSize;
}
