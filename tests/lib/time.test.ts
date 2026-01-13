/**
 * Tests for Time Utilities
 */

import { formatRelativeTime, extractDomain } from '../../lib/time';

describe('formatRelativeTime', () => {
  // Helper to create a date relative to now
  function createDateAgo(seconds: number): Date {
    return new Date(Date.now() - seconds * 1000);
  }

  it('returns "just now" for 0 seconds', () => {
    const date = createDateAgo(0);
    expect(formatRelativeTime(date)).toBe('just now');
  });

  it('returns "just now" for 1 second ago', () => {
    const date = createDateAgo(1);
    expect(formatRelativeTime(date)).toBe('just now');
  });

  it('returns seconds for times under 1 minute', () => {
    const date = createDateAgo(30);
    expect(formatRelativeTime(date)).toBe('30 seconds ago');
  });

  it('returns "1 minute ago" for 60 seconds', () => {
    const date = createDateAgo(60);
    expect(formatRelativeTime(date)).toBe('1 minute ago');
  });

  it('returns minutes for times under 1 hour', () => {
    const date = createDateAgo(30 * 60);
    expect(formatRelativeTime(date)).toBe('30 minutes ago');
  });

  it('returns "1 hour ago" for 1 hour', () => {
    const date = createDateAgo(60 * 60);
    expect(formatRelativeTime(date)).toBe('1 hour ago');
  });

  it('returns hours for times under 1 day', () => {
    const date = createDateAgo(12 * 60 * 60);
    expect(formatRelativeTime(date)).toBe('12 hours ago');
  });

  it('returns "1 day ago" for 1 day', () => {
    const date = createDateAgo(24 * 60 * 60);
    expect(formatRelativeTime(date)).toBe('1 day ago');
  });

  it('returns days for times under 1 month', () => {
    const date = createDateAgo(15 * 24 * 60 * 60);
    expect(formatRelativeTime(date)).toBe('15 days ago');
  });

  it('returns "1 month ago" for 30 days', () => {
    const date = createDateAgo(30 * 24 * 60 * 60);
    expect(formatRelativeTime(date)).toBe('1 month ago');
  });

  it('returns months for times under 1 year', () => {
    const date = createDateAgo(6 * 30 * 24 * 60 * 60);
    expect(formatRelativeTime(date)).toBe('6 months ago');
  });

  it('returns "1 year ago" for 365 days', () => {
    const date = createDateAgo(365 * 24 * 60 * 60);
    expect(formatRelativeTime(date)).toBe('1 year ago');
  });

  it('returns years for times over 1 year', () => {
    const date = createDateAgo(3 * 365 * 24 * 60 * 60);
    expect(formatRelativeTime(date)).toBe('3 years ago');
  });
});

describe('extractDomain', () => {
  it('extracts domain from standard URL', () => {
    expect(extractDomain('https://example.com/page')).toBe('example.com');
  });

  it('removes www prefix', () => {
    expect(extractDomain('https://www.example.com/page')).toBe('example.com');
  });

  it('handles subdomain', () => {
    expect(extractDomain('https://blog.example.com/post')).toBe(
      'blog.example.com'
    );
  });

  it('handles URL with port', () => {
    expect(extractDomain('https://example.com:8080/page')).toBe('example.com');
  });

  it('handles http URLs', () => {
    expect(extractDomain('http://example.com/page')).toBe('example.com');
  });

  it('returns undefined for invalid URL', () => {
    expect(extractDomain('not-a-url')).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(extractDomain('')).toBeUndefined();
  });

  it('handles complex paths', () => {
    expect(
      extractDomain('https://example.com/path/to/page?query=value#hash')
    ).toBe('example.com');
  });
});
