/**
 * Configuration Module Tests
 */

describe('lib/config', () => {
  // Store original env to restore after tests
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules before each test to clear cached config
    jest.resetModules();
    // Create a fresh copy of environment
    process.env = { ...originalEnv };
    // Set required env vars for most tests (tests for missing required vars will override)
    process.env.NODE_ENV = 'test';
    process.env.HN_API_BASE_URL = 'https://test-api.example.com';
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('getEnvVar', () => {
    it('should return the environment variable value when set', () => {
      process.env.TEST_VAR = 'test-value';

      // Import fresh module
      const { getEnvVar } = require('../../lib/config');

      expect(getEnvVar('TEST_VAR')).toBe('test-value');
    });

    it('should return undefined for optional missing variable', () => {
      delete process.env.OPTIONAL_VAR;

      const { getEnvVar } = require('../../lib/config');

      expect(getEnvVar('OPTIONAL_VAR')).toBeUndefined();
    });

    it('should throw error when required variable is missing', () => {
      delete process.env.REQUIRED_VAR;

      const { getEnvVar } = require('../../lib/config');

      expect(() => getEnvVar('REQUIRED_VAR', true)).toThrow(
        'Missing required environment variable: REQUIRED_VAR'
      );
    });

    it('should throw error when required variable is empty string', () => {
      process.env.REQUIRED_VAR = '';

      const { getEnvVar } = require('../../lib/config');

      expect(() => getEnvVar('REQUIRED_VAR', true)).toThrow(
        'Missing required environment variable: REQUIRED_VAR'
      );
    });
  });

  describe('parseIntEnv', () => {
    it('should parse valid integer values', () => {
      process.env.INT_VAR = '42';

      const { parseIntEnv } = require('../../lib/config');

      expect(parseIntEnv('INT_VAR', 0)).toBe(42);
    });

    it('should return default value when variable is not set', () => {
      delete process.env.INT_VAR;

      const { parseIntEnv } = require('../../lib/config');

      expect(parseIntEnv('INT_VAR', 100)).toBe(100);
    });

    it('should return default value when variable is empty string', () => {
      process.env.INT_VAR = '';

      const { parseIntEnv } = require('../../lib/config');

      expect(parseIntEnv('INT_VAR', 100)).toBe(100);
    });

    it('should return default value for invalid integer', () => {
      process.env.INT_VAR = 'not-a-number';

      // Suppress console.warn for this test
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { parseIntEnv } = require('../../lib/config');

      expect(parseIntEnv('INT_VAR', 50)).toBe(50);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid integer value for INT_VAR')
      );

      warnSpy.mockRestore();
    });

    it('should parse negative integers correctly', () => {
      process.env.INT_VAR = '-10';

      const { parseIntEnv } = require('../../lib/config');

      expect(parseIntEnv('INT_VAR', 0)).toBe(-10);
    });

    it('should handle zero correctly', () => {
      process.env.INT_VAR = '0';

      const { parseIntEnv } = require('../../lib/config');

      expect(parseIntEnv('INT_VAR', 100)).toBe(0);
    });
  });

  describe('config object', () => {
    it('should have correct default values for optional variables', () => {
      // Set required variables
      process.env.NODE_ENV = 'development';
      process.env.HN_API_BASE_URL = 'https://example.com';

      // Clear optional variables to test defaults
      delete process.env.DATA_SOURCE;
      delete process.env.LOG_LEVEL;
      delete process.env.CACHE_TTL_SECONDS;
      delete process.env.API_TIMEOUT_MS;
      delete process.env.API_RETRY_COUNT;

      const { config } = require('../../lib/config');

      expect(config.DATA_SOURCE).toBe('hackernews');
      expect(config.LOG_LEVEL).toBe('info');
      expect(config.CACHE_TTL_SECONDS).toBe(60);
      expect(config.API_TIMEOUT_MS).toBe(10000);
      expect(config.API_RETRY_COUNT).toBe(3);
    });

    it('should use provided values for optional variables', () => {
      process.env.NODE_ENV = 'production';
      process.env.HN_API_BASE_URL = 'https://api.example.com';
      process.env.DATA_SOURCE = 'custom';
      process.env.LOG_LEVEL = 'debug';
      process.env.CACHE_TTL_SECONDS = '120';
      process.env.API_TIMEOUT_MS = '5000';
      process.env.API_RETRY_COUNT = '5';

      const { config } = require('../../lib/config');

      expect(config.NODE_ENV).toBe('production');
      expect(config.HN_API_BASE_URL).toBe('https://api.example.com');
      expect(config.DATA_SOURCE).toBe('custom');
      expect(config.LOG_LEVEL).toBe('debug');
      expect(config.CACHE_TTL_SECONDS).toBe(120);
      expect(config.API_TIMEOUT_MS).toBe(5000);
      expect(config.API_RETRY_COUNT).toBe(5);
    });

    it('should throw error when NODE_ENV is missing', () => {
      delete process.env.NODE_ENV;
      process.env.HN_API_BASE_URL = 'https://example.com';

      expect(() => require('../../lib/config')).toThrow(
        'Missing required environment variable: NODE_ENV'
      );
    });

    it('should throw error when HN_API_BASE_URL is missing', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.HN_API_BASE_URL;

      expect(() => require('../../lib/config')).toThrow(
        'Missing required environment variable: HN_API_BASE_URL'
      );
    });
  });
});
