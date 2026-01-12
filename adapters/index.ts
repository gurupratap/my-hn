/**
 * Adapter Index
 *
 * Exports the appropriate data adapter based on the DATA_SOURCE configuration.
 * This abstraction allows swapping backend data sources without changing
 * consumer code in services or components.
 *
 * ## How to Swap Adapters
 *
 * 1. Create a new adapter file (e.g., `adapters/customAdapter.ts`) that implements
 *    the same interface as `hackerNewsAdapter`:
 *    - getTopPostIds(): Promise<number[]>
 *    - getNewPostIds(): Promise<number[]>
 *    - getBestPostIds(): Promise<number[]>
 *    - getPostById(id: number): Promise<Post>
 *    - getPostsByIds(ids: number[]): Promise<Post[]>
 *    - getCommentById(id: number): Promise<Comment>
 *
 * 2. Import your adapter in this file and add a case to the switch statement.
 *
 * 3. Set the DATA_SOURCE environment variable to your adapter's key.
 *
 * Example:
 *   DATA_SOURCE=custom  # Uses customAdapter
 *   DATA_SOURCE=hackernews  # Uses hackerNewsAdapter (default)
 */

import { config } from '../lib/config';
import { hackerNewsAdapter } from './hackerNewsAdapter';
import { type Adapter } from './types';

export type { Adapter } from './types';

/**
 * Returns the appropriate adapter based on current DATA_SOURCE config.
 * Called at runtime rather than import time for better testability.
 */
export function getAdapter(): Adapter {
  switch (config.DATA_SOURCE) {
    case 'hackernews':
    default:
      return hackerNewsAdapter;
  }
}
