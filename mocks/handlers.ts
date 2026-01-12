/**
 * MSW Request Handlers
 *
 * Mock handlers for the Hacker News API endpoints.
 * Used for testing without making real API calls.
 */

import { http, HttpResponse } from 'msw';
import {
  mockTopStoryIds,
  mockNewStoryIds,
  mockBestStoryIds,
  getMockPost,
} from './data/posts';
import { getMockComment } from './data/comments';
import { HttpStatus } from '../lib/http-status';

export const HN_API_BASE_URL = 'https://hacker-news.firebaseio.com';
export const HN_API_BASE = `${HN_API_BASE_URL}/v0`;

export const handlers = [
  // GET /v0/topstories.json - Returns top story IDs
  http.get(`${HN_API_BASE}/topstories.json`, () => {
    return HttpResponse.json(mockTopStoryIds);
  }),

  // GET /v0/newstories.json - Returns new story IDs
  http.get(`${HN_API_BASE}/newstories.json`, () => {
    return HttpResponse.json(mockNewStoryIds);
  }),

  // GET /v0/beststories.json - Returns best story IDs
  http.get(`${HN_API_BASE}/beststories.json`, () => {
    return HttpResponse.json(mockBestStoryIds);
  }),

  // GET /v0/item/:id.json - Returns a single item (post or comment)
  http.get(`${HN_API_BASE}/item/:id.json`, ({ params }) => {
    const id = Number(params.id);

    if (isNaN(id)) {
      return HttpResponse.json(null, { status: HttpStatus.BAD_REQUEST });
    }

    // Try to find as a post first
    const post = getMockPost(id);
    if (post) {
      return HttpResponse.json(post);
    }

    // Try to find as a comment
    const comment = getMockComment(id);
    if (comment) {
      return HttpResponse.json(comment);
    }

    // Item not found - HN API returns null for missing items
    return HttpResponse.json(null);
  }),
];

/**
 * Error handlers for testing error scenarios
 */
export const errorHandlers = {
  // Handler that returns 404 for any item request
  notFound: http.get(`${HN_API_BASE}/item/:id.json`, () => {
    return HttpResponse.json(null, { status: HttpStatus.NOT_FOUND });
  }),

  // Handler that returns 500 server error
  serverError: http.get(`${HN_API_BASE}/item/:id.json`, () => {
    return HttpResponse.json(
      { error: 'Internal Server Error' },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }),

  // Handler that returns 500 for story lists
  storiesServerError: http.get(`${HN_API_BASE}/topstories.json`, () => {
    return HttpResponse.json(
      { error: 'Internal Server Error' },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }),
};
