/**
 * Test Constants
 *
 * Shared constants for test files to avoid magic strings.
 */

import { config } from '../lib/config';

// Derived constant for v0 API endpoint
export const HN_API_BASE = `${config.HN_API_BASE_URL}/v0`;
