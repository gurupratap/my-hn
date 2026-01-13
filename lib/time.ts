/**
 * Time Utilities
 *
 * Functions for formatting and manipulating dates/times.
 */

interface TimeUnit {
  threshold: number;
  divisor: number;
  singular: string;
  plural: string;
}

const TIME_UNITS: TimeUnit[] = [
  { threshold: 60, divisor: 1, singular: 'second', plural: 'seconds' },
  { threshold: 3600, divisor: 60, singular: 'minute', plural: 'minutes' },
  { threshold: 86400, divisor: 3600, singular: 'hour', plural: 'hours' },
  { threshold: 2592000, divisor: 86400, singular: 'day', plural: 'days' },
  { threshold: 31536000, divisor: 2592000, singular: 'month', plural: 'months' },
  { threshold: Infinity, divisor: 31536000, singular: 'year', plural: 'years' },
];

function formatUnit(value: number, singular: string, plural: string): string {
  return value === 1 ? `1 ${singular} ago` : `${value} ${plural} ago`;
}

/**
 * Formats a date as a relative time string (e.g., "2 hours ago")
 *
 * @param date - The date to format
 * @returns A human-readable relative time string
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSeconds <= 1) {
    return 'just now';
  }

  for (const unit of TIME_UNITS) {
    if (diffSeconds < unit.threshold) {
      const value = Math.floor(diffSeconds / unit.divisor);
      return formatUnit(value, unit.singular, unit.plural);
    }
  }

  // Fallback (should never reach here due to Infinity threshold)
  const years = Math.floor(diffSeconds / 31536000);
  return formatUnit(years, 'year', 'years');
}

/**
 * Extracts the domain from a URL
 *
 * @param url - The URL to extract the domain from
 * @returns The domain (e.g., "example.com") or undefined if invalid
 */
export function extractDomain(url: string): string | undefined {
  try {
    const urlObj = new URL(url);
    // Remove 'www.' prefix if present
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}
