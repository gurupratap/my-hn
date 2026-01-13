'use client';

/**
 * PostListWithLoadMore Component
 *
 * Client component wrapper that displays posts with load more functionality.
 * Uses usePosts hook for state management.
 */

import type { Post } from '../domain/models';
import type { SortType } from '../services/postsService';
import { usePosts } from '../hooks/usePosts';
import PostList from './PostList';
import LoadMoreButton from './LoadMoreButton';

interface PostListWithLoadMoreProps {
  /** Initial posts from server */
  initialPosts: Post[];
  /** Current sort type */
  sort: SortType;
  /** Number of posts per page */
  pageSize?: number;
}

export default function PostListWithLoadMore({
  initialPosts,
  sort,
  pageSize = 30,
}: PostListWithLoadMoreProps): React.ReactElement {
  const { posts, loading, hasMore, loadMore } = usePosts({
    initialPosts,
    sort,
    pageSize,
  });

  return (
    <>
      <PostList posts={posts} />
      <LoadMoreButton loading={loading} hasMore={hasMore} onLoadMore={loadMore} />
    </>
  );
}
