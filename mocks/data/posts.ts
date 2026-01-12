/**
 * Mock Post Data
 *
 * Mock data matching the Hacker News API response format.
 * Used for testing without making real API calls.
 */

/**
 * HN API item type for posts
 */
export interface HNPost {
  id: number;
  type: 'story' | 'job' | 'poll';
  by: string;
  time: number;
  title: string;
  url?: string;
  text?: string;
  score: number;
  descendants: number;
  kids?: number[];
}

/**
 * Mock post IDs for different feed types
 * All IDs must exist in mockPosts below
 */
export const mockTopStoryIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const mockNewStoryIds = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
export const mockBestStoryIds = [5, 3, 10, 1, 9, 4, 8, 2, 7, 6];

/**
 * Mock posts data
 */
export const mockPosts: Record<number, HNPost> = {
  1: {
    id: 1,
    type: 'story',
    by: 'pg',
    time: 1702900000,
    title: 'Hacker News Clone Built with Next.js',
    url: 'https://example.com/nextjs-hn',
    score: 150,
    descendants: 45,
    kids: [101, 102, 103],
  },
  2: {
    id: 2,
    type: 'story',
    by: 'dang',
    time: 1702890000,
    title: 'Show HN: A Text Post Without URL',
    text: 'This is a text post with some content. It demonstrates posts without external URLs.',
    score: 89,
    descendants: 23,
    kids: [104, 105],
  },
  3: {
    id: 3,
    type: 'story',
    by: 'sama',
    time: 1702880000,
    title: 'The Future of AI Development',
    url: 'https://example.com/ai-future',
    score: 234,
    descendants: 156,
    kids: [106, 107, 108, 109],
  },
  4: {
    id: 4,
    type: 'story',
    by: 'tptacek',
    time: 1702870000,
    title: 'Security Best Practices for Web Applications',
    url: 'https://example.com/web-security',
    score: 178,
    descendants: 67,
    kids: [110],
  },
  5: {
    id: 5,
    type: 'story',
    by: 'patio11',
    time: 1702860000,
    title: 'Building a SaaS Business from Scratch',
    url: 'https://example.com/saas-guide',
    score: 312,
    descendants: 89,
    kids: [111, 112],
  },
  6: {
    id: 6,
    type: 'job',
    by: 'ycombinator',
    time: 1702850000,
    title: 'YC is hiring engineers',
    url: 'https://ycombinator.com/jobs',
    score: 1,
    descendants: 0,
  },
  7: {
    id: 7,
    type: 'story',
    by: 'jl',
    time: 1702840000,
    title: 'Ask HN: Best programming language to learn in 2024?',
    text: 'Looking for recommendations on which programming language to focus on.',
    score: 56,
    descendants: 234,
    kids: [113, 114, 115],
  },
  8: {
    id: 8,
    type: 'story',
    by: 'kogir',
    time: 1702830000,
    title: 'Understanding TypeScript Generics',
    url: 'https://example.com/ts-generics',
    score: 145,
    descendants: 34,
    kids: [116],
  },
  9: {
    id: 9,
    type: 'story',
    by: 'minimaxir',
    time: 1702820000,
    title: 'Data Science with Python: A Complete Guide',
    url: 'https://example.com/python-ds',
    score: 198,
    descendants: 45,
    kids: [117, 118],
  },
  10: {
    id: 10,
    type: 'story',
    by: 'rauchg',
    time: 1702810000,
    title: 'Deploying Next.js Applications at Scale',
    url: 'https://example.com/nextjs-scale',
    score: 267,
    descendants: 78,
    kids: [119, 120, 121],
  },
};

/**
 * Get a mock post by ID
 */
export function getMockPost(id: number): HNPost | null {
  return mockPosts[id] ?? null;
}
