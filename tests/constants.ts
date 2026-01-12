/**
 * Test Constants
 *
 * Shared constants for test files to avoid magic strings and numbers.
 * Re-exports config values and defines test-specific overrides.
 */

// Re-export from config for convenience
import { config } from '../lib/config';
export const HN_API_BASE_URL = config.HN_API_BASE_URL;

// Derived constant for v0 API endpoint
export const HN_API_BASE = `${HN_API_BASE_URL}/v0`;

// Data source identifiers
export const DATA_SOURCE_HACKERNEWS = 'hackernews';

// API configuration defaults (matching lib/config.ts defaults)
export const DEFAULT_API_TIMEOUT_MS = 10000;
export const DEFAULT_API_RETRY_COUNT = 3;

// Test-specific overrides
export const TEST_API_RETRY_COUNT = 2;
