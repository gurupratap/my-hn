/**
 * Mock Comment Data
 *
 * Mock data matching the Hacker News API response format.
 * Used for testing without making real API calls.
 */

/**
 * HN API item type for comments
 */
export interface HNComment {
  id: number;
  type: 'comment';
  by: string;
  time: number;
  text: string;
  parent: number;
  kids?: number[];
}

/**
 * Mock comments data
 */
export const mockComments: Record<number, HNComment> = {
  // Comments for post 1
  101: {
    id: 101,
    type: 'comment',
    by: 'commenter1',
    time: 1702901000,
    text: 'Great project! I love the clean architecture.',
    parent: 1,
    kids: [201, 202],
  },
  102: {
    id: 102,
    type: 'comment',
    by: 'commenter2',
    time: 1702902000,
    text: 'How does this compare to the original HN?',
    parent: 1,
    kids: [203],
  },
  103: {
    id: 103,
    type: 'comment',
    by: 'commenter3',
    time: 1702903000,
    text: 'Nice work! The performance looks solid.',
    parent: 1,
  },

  // Comments for post 2
  104: {
    id: 104,
    type: 'comment',
    by: 'user42',
    time: 1702891000,
    text: 'Interesting approach. Can you share more details?',
    parent: 2,
  },
  105: {
    id: 105,
    type: 'comment',
    by: 'hacker99',
    time: 1702892000,
    text: 'This is exactly what I was looking for!',
    parent: 2,
  },

  // Comments for post 3
  106: {
    id: 106,
    type: 'comment',
    by: 'airesearcher',
    time: 1702881000,
    text: 'The predictions in this article are fascinating.',
    parent: 3,
    kids: [204],
  },
  107: {
    id: 107,
    type: 'comment',
    by: 'mleng',
    time: 1702882000,
    text: 'I disagree with some points but overall good analysis.',
    parent: 3,
  },
  108: {
    id: 108,
    type: 'comment',
    by: 'datascientist',
    time: 1702883000,
    text: 'Would love to see more technical depth.',
    parent: 3,
  },
  109: {
    id: 109,
    type: 'comment',
    by: 'ethicist',
    time: 1702884000,
    text: 'Important considerations about AI safety here.',
    parent: 3,
  },

  // Nested comments (replies)
  201: {
    id: 201,
    type: 'comment',
    by: 'replier1',
    time: 1702904000,
    text: 'Thanks! The adapter pattern really helps with testing.',
    parent: 101,
  },
  202: {
    id: 202,
    type: 'comment',
    by: 'replier2',
    time: 1702905000,
    text: 'Agreed, very well structured codebase.',
    parent: 101,
  },
  203: {
    id: 203,
    type: 'comment',
    by: 'commenter1',
    time: 1702906000,
    text: 'It is read-only but covers all the core features.',
    parent: 102,
  },
  204: {
    id: 204,
    type: 'comment',
    by: 'researcher2',
    time: 1702885000,
    text: 'Especially the part about emergent capabilities.',
    parent: 106,
  },

  // Additional comments for other posts
  110: {
    id: 110,
    type: 'comment',
    by: 'securitypro',
    time: 1702871000,
    text: 'OWASP Top 10 should be required reading for all devs.',
    parent: 4,
  },
  111: {
    id: 111,
    type: 'comment',
    by: 'founder1',
    time: 1702861000,
    text: 'Great insights from someone who has done it.',
    parent: 5,
  },
  112: {
    id: 112,
    type: 'comment',
    by: 'startup_dev',
    time: 1702862000,
    text: 'The pricing section was particularly helpful.',
    parent: 5,
  },
};

/**
 * Get a mock comment by ID
 */
export function getMockComment(id: number): HNComment | null {
  return mockComments[id] ?? null;
}
