/**
 * PostList Component
 *
 * Renders a list of posts with their ranks.
 */

import type { Post } from '../domain/models';
import PostItem from './PostItem';

interface PostListProps {
  posts: Post[];
  startRank?: number;
}

export default function PostList({
  posts,
  startRank = 1,
}: PostListProps): React.ReactElement {
  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center">
        <p className="text-gray-500">No posts found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      {posts.map((post, index) => (
        <PostItem key={post.id} post={post} rank={startRank + index} />
      ))}
    </div>
  );
}
