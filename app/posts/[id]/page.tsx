/**
 * Post Detail Page
 *
 * Server component that displays a single post with its comments.
 * Validates the post ID and returns 404 for invalid IDs.
 */

import { notFound } from 'next/navigation';
import { getPostById } from '../../../services/postsService';
import { getCommentsPaginated } from '../../../services/commentsService';
import BackButton from '../../../components/BackButton';
import PostDetail from '../../../components/PostDetail';
import CommentList from '../../../components/CommentList';

const COMMENTS_PAGE_SIZE = 6;

interface PostPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Validates that the ID is a positive integer
 */
function isValidPostId(id: string): boolean {
  const parsed = parseInt(id, 10);
  return !isNaN(parsed) && parsed > 0 && String(parsed) === id;
}

export default async function PostPage({
  params,
}: PostPageProps): Promise<React.ReactElement> {
  const { id } = await params;

  // Validate post ID is numeric
  if (!isValidPostId(id)) {
    notFound();
  }

  const postId = parseInt(id, 10);

  // Fetch post and initial comments in parallel
  const [post, commentsResult] = await Promise.all([
    getPostById(postId),
    getCommentsPaginated(postId, 1, COMMENTS_PAGE_SIZE),
  ]);

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-gray-100">
      <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col px-4 py-4">
        <div className="mb-3 shrink-0">
          <BackButton />
        </div>
        <PostDetail post={post} />
        <CommentList
          postId={postId}
          initialComments={commentsResult.comments}
          initialHasMore={commentsResult.hasMore}
          pageSize={COMMENTS_PAGE_SIZE}
        />
      </div>
    </main>
  );
}
