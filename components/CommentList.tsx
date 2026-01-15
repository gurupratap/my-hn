'use client';

/**
 * CommentList Component
 *
 * Displays a list of comments with nested threading and infinite scroll.
 * Handles empty state when there are no comments.
 */

import type { Comment } from '../domain/models';
import { useComments } from '../hooks/useComments';
import InfiniteScrollContainer from './InfiniteScrollContainer';
import CommentItem from './CommentItem';

interface CommentListProps {
  postId: number;
  initialComments: Comment[];
  initialHasMore: boolean;
  pageSize?: number;
}

export default function CommentList({
  postId,
  initialComments,
  initialHasMore,
  pageSize = 10,
}: CommentListProps): React.ReactElement {
  const { comments, loading, hasMore, loadMore } = useComments({
    postId,
    initialComments,
    initialHasMore,
    pageSize,
  });

  if (comments.length === 0 && !loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">No comments yet.</p>
        <p className="mt-1 text-sm text-gray-400">
          Be the first to share your thoughts!
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-lg border border-gray-200 bg-white">
      <div className="flex-1 overflow-auto">
        <InfiniteScrollContainer
          onLoadMore={loadMore}
          loading={loading}
          hasMore={hasMore}
          endMessage="End of comments"
          className="divide-y divide-gray-100 px-4"
        >
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} depth={0} />
          ))}
        </InfiniteScrollContainer>
      </div>
    </div>
  );
}
