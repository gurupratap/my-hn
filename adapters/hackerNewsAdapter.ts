/**
 * Hacker News Adapter
 *
 * Adapter layer that talks to the Hacker News Firebase API and maps responses
 * into domain models.
 */

import { type Comment, type Post, type PostType } from '../domain/models';
import { config } from '../lib/config';
import { GatewayError, NotFoundError, TimeoutError } from '../lib/errors';
import { HttpStatus } from '../lib/http-status';
import { logger } from '../lib/logger';
import { withRetry } from '../lib/retry';

// Internal HN API item type (not exported)
interface HNItem {
  id: number;
  type?: string;
  by?: string;
  time?: number; // unix seconds
  title?: string;
  url?: string;
  text?: string;
  score?: number;
  descendants?: number;
  kids?: number[];
  parent?: number;
  deleted?: boolean;
  dead?: boolean;
}

function toV0BaseUrl(apiBaseUrl: string): string {
  return apiBaseUrl.endsWith('/') ? `${apiBaseUrl}v0` : `${apiBaseUrl}/v0`;
}

const HN_API_BASE = toV0BaseUrl(config.HN_API_BASE_URL);

function mapPostType(type: string | undefined): PostType {
  if (type === 'story' || type === 'job' || type === 'poll') return type;
  return 'story';
}

export function mapHNPostToPost(hnItem: HNItem): Post {
  return {
    id: hnItem.id,
    type: mapPostType(hnItem.type),
    title: hnItem.title ?? '',
    url: hnItem.url,
    text: hnItem.text,
    author: hnItem.by ?? 'unknown',
    points: hnItem.score ?? 0,
    commentCount: hnItem.descendants ?? 0,
    commentIds: hnItem.kids ?? [],
    createdAt: new Date((hnItem.time ?? 0) * 1000),
    deleted: hnItem.deleted,
    dead: hnItem.dead,
  };
}

export function mapHNCommentToComment(hnItem: HNItem): Comment {
  return {
    id: hnItem.id,
    author: hnItem.by ?? 'unknown',
    text: hnItem.text ?? '',
    createdAt: new Date((hnItem.time ?? 0) * 1000),
    parentId: hnItem.parent ?? 0,
    commentIds: hnItem.kids ?? [],
    children: [],
    deleted: hnItem.deleted,
    dead: hnItem.dead,
  };
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof Error || error instanceof DOMException) &&
    error.name === 'AbortError'
  );
}

export async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
  init?: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw new TimeoutError(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJsonWithRetry<T>(url: string, init?: RequestInit): Promise<T> {
  return withRetry(async () => {
    const res = await fetchWithTimeout(url, config.API_TIMEOUT_MS, init);

    if (!res.ok) {
      if (res.status === HttpStatus.NOT_FOUND) {
        throw new NotFoundError(`Resource not found: ${url}`);
      }
      throw new GatewayError(`HN API error (${res.status}) for ${url}`);
    }

    return (await res.json()) as T;
  });
}

async function timeCall<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    logger.info({ name, durationMs: Date.now() - start }, 'adapter call');
    return result;
  } catch (err) {
    logger.info({ name, durationMs: Date.now() - start, err }, 'adapter call failed');
    throw err;
  }
}

export const hackerNewsAdapter = {
  async getTopPostIds(): Promise<number[]> {
    return timeCall('hn.getTopPostIds', async () => {
      const url = `${HN_API_BASE}/topstories.json`;
      return fetchJsonWithRetry<number[]>(url, { next: { revalidate: 60 } });
    });
  },

  async getNewPostIds(): Promise<number[]> {
    return timeCall('hn.getNewPostIds', async () => {
      const url = `${HN_API_BASE}/newstories.json`;
      return fetchJsonWithRetry<number[]>(url, { next: { revalidate: 60 } });
    });
  },

  async getBestPostIds(): Promise<number[]> {
    return timeCall('hn.getBestPostIds', async () => {
      const url = `${HN_API_BASE}/beststories.json`;
      return fetchJsonWithRetry<number[]>(url, { next: { revalidate: 60 } });
    });
  },

  async getPostById(id: number): Promise<Post> {
    return timeCall('hn.getPostById', async () => {
      const url = `${HN_API_BASE}/item/${id}.json`;
      const item = await fetchJsonWithRetry<HNItem | null>(url, {
        next: { revalidate: 300 },
      });

      if (!item) {
        throw new NotFoundError(`Post not found: ${id}`);
      }

      return mapHNPostToPost(item);
    });
  },

  async getPostsByIds(ids: number[]): Promise<Post[]> {
    return timeCall('hn.getPostsByIds', async () => {
      return Promise.all(ids.map((id) => hackerNewsAdapter.getPostById(id)));
    });
  },

  async getCommentById(id: number): Promise<Comment> {
    return timeCall('hn.getCommentById', async () => {
      const url = `${HN_API_BASE}/item/${id}.json`;
      const item = await fetchJsonWithRetry<HNItem | null>(url, {
        next: { revalidate: 120 },
      });

      if (!item) {
        throw new NotFoundError(`Comment not found: ${id}`);
      }

      return mapHNCommentToComment(item);
    });
  },
} as const;
