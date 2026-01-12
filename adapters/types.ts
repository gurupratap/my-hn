/**
 * Adapter Types
 *
 * Defines the contract that all data source adapters must implement.
 */

import { type Comment, type Post } from '../domain/models';

/**
 * Data source adapter interface.
 *
 * All adapters must implement this interface to be compatible with
 * the application's data fetching layer.
 */
export interface Adapter {
  /** Get IDs of top posts */
  getTopPostIds(): Promise<number[]>;

  /** Get IDs of newest posts */
  getNewPostIds(): Promise<number[]>;

  /** Get IDs of best posts */
  getBestPostIds(): Promise<number[]>;

  /** Get a single post by ID */
  getPostById(id: number): Promise<Post>;

  /** Get multiple posts by their IDs */
  getPostsByIds(ids: number[]): Promise<Post[]>;

  /** Get a single comment by ID */
  getCommentById(id: number): Promise<Comment>;
}
