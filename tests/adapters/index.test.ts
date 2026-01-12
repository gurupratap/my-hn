jest.mock('../../lib/config', () => ({
  config: {
    DATA_SOURCE: 'hackernews',
    HN_API_BASE_URL: 'https://hacker-news.firebaseio.com',
    API_TIMEOUT_MS: 10000,
    API_RETRY_COUNT: 3,
  },
  HN_API_BASE_URL: 'https://hacker-news.firebaseio.com',
}));

import { hackerNewsAdapter } from '../../adapters/hackerNewsAdapter';
import { getAdapter } from '../../adapters/index';

describe('getAdapter', () => {
  it('returns hackerNewsAdapter when DATA_SOURCE is hackernews', () => {
    const adapter = getAdapter();
    expect(adapter).toBe(hackerNewsAdapter);
  });

  it('returns adapter with all required methods', () => {
    const adapter = getAdapter();
    expect(typeof adapter.getTopPostIds).toBe('function');
    expect(typeof adapter.getNewPostIds).toBe('function');
    expect(typeof adapter.getBestPostIds).toBe('function');
    expect(typeof adapter.getPostById).toBe('function');
    expect(typeof adapter.getPostsByIds).toBe('function');
    expect(typeof adapter.getCommentById).toBe('function');
  });
});

describe('getAdapter with different DATA_SOURCE values', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('returns hackerNewsAdapter for unknown DATA_SOURCE (default case)', () => {
    jest.doMock('../../lib/config', () => ({
      config: {
        DATA_SOURCE: 'unknown',
        HN_API_BASE_URL: 'https://hacker-news.firebaseio.com',
        API_TIMEOUT_MS: 10000,
        API_RETRY_COUNT: 3,
      },
      HN_API_BASE_URL: 'https://hacker-news.firebaseio.com',
    }));
    const { getAdapter: freshGetAdapter } = require('../../adapters/index');
    const { hackerNewsAdapter: freshAdapter } = require('../../adapters/hackerNewsAdapter');
    expect(freshGetAdapter()).toBe(freshAdapter);
  });
});
