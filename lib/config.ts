/**
 * Configuration Module
 *
 * Centralized environment configuration with type safety and validation.
 * Implements fail-fast validation for required environment variables.
 */

/**
 * Get an environment variable with optional required validation.
 * Throws an error immediately if a required variable is missing (fail-fast).
 *
 * @param name - The environment variable name
 * @param required - Whether the variable is required (defaults to false)
 * @returns The environment variable value or undefined if not required and missing
 * @throws Error if required variable is missing
 */
export function getEnvVar(name: string, required: boolean = false): string | undefined {
  const value = process.env[name];

  if (required && (value === undefined || value === '')) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Please check your .env file or environment configuration.`
    );
  }

  return value;
}

/**
 * Parse an environment variable as an integer with a default value.
 *
 * @param name - The environment variable name
 * @param defaultValue - The default value if not set or invalid
 * @returns The parsed integer value or the default
 */
export function parseIntEnv(name: string, defaultValue: number): number {
  const value = process.env[name];

  if (value === undefined || value === '') {
    return defaultValue;
  }

  const parsed = parseInt(value, 10);

  if (isNaN(parsed)) {
    console.warn(
      `Invalid integer value for ${name}: "${value}". Using default: ${defaultValue}`
    );
    return defaultValue;
  }

  return parsed;
}

/**
 * Application configuration object.
 * All environment variables are validated and typed here.
 */
export const config = {
  /**
   * Node environment (required)
   * Values: 'development' | 'production' | 'test'
   */
  NODE_ENV: getEnvVar('NODE_ENV', true) as 'development' | 'production' | 'test',

  /**
   * Base URL for the Hacker News API (required)
   * Default HN API: https://hacker-news.firebaseio.com
   */
  HN_API_BASE_URL: getEnvVar('HN_API_BASE_URL', true) as string,

  /**
   * Data source adapter to use (optional)
   * Default: 'hackernews'
   * Can be changed to use a different backend adapter
   */
  DATA_SOURCE: getEnvVar('DATA_SOURCE') ?? 'hackernews',

  /**
   * Logging level (optional)
   * Values: 'error' | 'warn' | 'info' | 'debug'
   * Default: 'info'
   */
  LOG_LEVEL: (getEnvVar('LOG_LEVEL') ?? 'info') as 'error' | 'warn' | 'info' | 'debug',

  /**
   * Cache TTL in seconds for Next.js fetch revalidation (optional)
   * Default: 60 seconds
   */
  CACHE_TTL_SECONDS: parseIntEnv('CACHE_TTL_SECONDS', 60),

  /**
   * API request timeout in milliseconds (optional)
   * Default: 10000ms (10 seconds)
   */
  API_TIMEOUT_MS: parseIntEnv('API_TIMEOUT_MS', 10000),

  /**
   * Number of retry attempts for failed API requests (optional)
   * Default: 3 retries
   */
  API_RETRY_COUNT: parseIntEnv('API_RETRY_COUNT', 3),

  /**
   * Typesense host (optional)
   * Default: localhost
   */
  TYPESENSE_HOST: getEnvVar('TYPESENSE_HOST') ?? 'localhost',

  /**
   * Typesense port (optional)
   * Default: 8108
   */
  TYPESENSE_PORT: parseIntEnv('TYPESENSE_PORT', 8108),

  /**
   * Typesense protocol (optional)
   * Default: http
   */
  TYPESENSE_PROTOCOL: getEnvVar('TYPESENSE_PROTOCOL') ?? 'http',

  /**
   * Typesense Admin API key (optional)
   * Required for admin operations (collection management, indexing).
   * If not set, ingestion will be disabled.
   */
  TYPESENSE_ADMIN_API_KEY: getEnvVar('TYPESENSE_ADMIN_API_KEY'),

  /**
   * Typesense Search API key (optional)
   * Used for search operations. More restrictive than admin key.
   * Falls back to admin key if not set.
   */
  TYPESENSE_SEARCH_API_KEY: getEnvVar('TYPESENSE_SEARCH_API_KEY'),

  /**
   * Typesense collection name (optional)
   * Default: posts
   */
  TYPESENSE_COLLECTION: getEnvVar('TYPESENSE_COLLECTION') ?? 'posts',

  /**
   * Cron secret for protecting ingestion endpoint (optional)
   * Should be set in production to prevent unauthorized access.
   */
  CRON_SECRET: getEnvVar('CRON_SECRET'),
} as const;

// Type for the config object
export type Config = typeof config;

// Export individual values for convenience
export const {
  NODE_ENV,
  HN_API_BASE_URL,
  DATA_SOURCE,
  LOG_LEVEL,
  CACHE_TTL_SECONDS,
  API_TIMEOUT_MS,
  API_RETRY_COUNT,
  TYPESENSE_HOST,
  TYPESENSE_PORT,
  TYPESENSE_PROTOCOL,
  TYPESENSE_ADMIN_API_KEY,
  TYPESENSE_SEARCH_API_KEY,
  TYPESENSE_COLLECTION,
  CRON_SECRET,
} = config;
