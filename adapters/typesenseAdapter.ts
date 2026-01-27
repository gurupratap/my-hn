/**
 * Typesense Adapter
 *
 * Adapter layer for Typesense search engine operations.
 * Handles collection management and document indexing.
 */

import 'server-only';

import Typesense, { Client } from 'typesense';
import { type CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';
import { type Post, type PostType } from '../domain/models';
import {
  TYPESENSE_HOST,
  TYPESENSE_PORT,
  TYPESENSE_PROTOCOL,
  TYPESENSE_ADMIN_API_KEY,
  TYPESENSE_SEARCH_API_KEY,
  TYPESENSE_COLLECTION,
} from '../lib/config';
import { logger } from '../lib/logger';

/**
 * Typesense document structure for posts
 */
export interface TypesensePost {
  id: string;
  type: string;
  title: string;
  url?: string;
  text?: string;
  author: string;
  points: number;
  commentCount: number;
  createdAt: number;
}

/**
 * Collection schema for posts
 */
const postsSchema: CollectionCreateSchema = {
  name: TYPESENSE_COLLECTION,
  fields: [
    { name: 'id', type: 'string' },
    { name: 'type', type: 'string', facet: true },
    { name: 'title', type: 'string' },
    { name: 'url', type: 'string', optional: true },
    { name: 'text', type: 'string', optional: true },
    { name: 'author', type: 'string', facet: true },
    { name: 'points', type: 'int32', sort: true },
    { name: 'commentCount', type: 'int32', sort: true },
    { name: 'createdAt', type: 'int64', sort: true },
  ],
  default_sorting_field: 'points',
};

let adminClientInstance: Client | null = null;
let searchClientInstance: Client | null = null;

/**
 * Check if Typesense is fully configured with both API keys
 */
export function isTypesenseConfigured(): boolean {
  return !!(TYPESENSE_ADMIN_API_KEY && TYPESENSE_SEARCH_API_KEY);
}

/**
 * Create a Typesense client with the given API key.
 */
function createClient(apiKey: string): Client {
  return new Typesense.Client({
    nodes: [
      {
        host: TYPESENSE_HOST,
        port: TYPESENSE_PORT,
        protocol: TYPESENSE_PROTOCOL,
      },
    ],
    apiKey,
    connectionTimeoutSeconds: 100,
  });
}

/**
 * Get the singleton Typesense admin client instance.
 * Used for collection management and indexing operations.
 * Returns null if admin API key is not configured.
 */
export function getTypesenseAdminClient(): Client | null {
  if (!TYPESENSE_ADMIN_API_KEY) {
    return null;
  }

  if (!adminClientInstance) {
    adminClientInstance = createClient(TYPESENSE_ADMIN_API_KEY);
  }

  return adminClientInstance;
}

/**
 * Get the singleton Typesense search client instance.
 * Used for search operations.
 * Returns null if search API key is not configured.
 */
export function getTypesenseSearchClient(): Client | null {
  if (!TYPESENSE_SEARCH_API_KEY) {
    return null;
  }

  if (!searchClientInstance) {
    searchClientInstance = createClient(TYPESENSE_SEARCH_API_KEY);
  }

  return searchClientInstance;
}

/**
 * Map a Post domain model to a Typesense document
 */
export function postToTypesenseDoc(post: Post): TypesensePost {
  return {
    id: String(post.id),
    type: post.type,
    title: post.title,
    url: post.url,
    text: post.text,
    author: post.author,
    points: post.points,
    commentCount: post.commentCount,
    createdAt: Math.floor(post.createdAt.getTime() / 1000),
  };
}

/**
 * Map a Typesense document back to a Post domain model
 */
export function typesenseDocToPost(doc: TypesensePost): Post {
  return {
    id: parseInt(doc.id, 10),
    type: doc.type as PostType,
    title: doc.title,
    url: doc.url,
    text: doc.text,
    author: doc.author,
    points: doc.points,
    commentCount: doc.commentCount,
    commentIds: [],
    createdAt: new Date(doc.createdAt * 1000),
  };
}

/**
 * Ensure the posts collection exists with the correct schema.
 * Creates the collection if it doesn't exist.
 */
export async function ensureCollection(): Promise<void> {
  const client = getTypesenseAdminClient();
  if (!client) {
    throw new Error('Typesense admin API key is not configured');
  }

  try {
    await client.collections(TYPESENSE_COLLECTION).retrieve();
    logger.debug({ collection: TYPESENSE_COLLECTION }, 'Collection already exists');
  } catch (error) {
    if ((error as { httpStatus?: number }).httpStatus === 404) {
      logger.info({ collection: TYPESENSE_COLLECTION }, 'Creating collection');
      await client.collections().create(postsSchema);
      logger.info({ collection: TYPESENSE_COLLECTION }, 'Collection created');
    } else {
      throw error;
    }
  }
}

/**
 * Index (upsert) multiple posts into Typesense.
 * Filters out deleted and dead posts.
 *
 * @param posts - Array of posts to index
 * @returns Number of posts successfully indexed
 */
export async function indexPosts(posts: Post[]): Promise<number> {
  const client = getTypesenseAdminClient();
  if (!client) {
    throw new Error('Typesense admin API key is not configured');
  }

  // Filter out deleted and dead posts
  const validPosts = posts.filter((post) => !post.deleted && !post.dead && post.title);

  if (validPosts.length === 0) {
    return 0;
  }

  const documents = validPosts.map(postToTypesenseDoc);

  try {
    const results = await client
      .collections(TYPESENSE_COLLECTION)
      .documents()
      .import(documents, { action: 'upsert' });

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    if (failCount > 0) {
      const errors = results.filter((r) => !r.success);
      logger.warn({ failCount, errors: errors.slice(0, 5) }, 'Some documents failed to index');
    }

    logger.info({ successCount, failCount, totalAttempted: documents.length }, 'Posts indexed');

    return successCount;
  } catch (error) {
    logger.error({ error }, 'Failed to index posts');
    throw error;
  }
}
