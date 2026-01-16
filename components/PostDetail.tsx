/**
 * PostDetail Component
 *
 * Displays full details of a single post including title, URL,
 * text content (for text posts), and metadata.
 */

import type { Post } from '../domain/models';
import { formatRelativeTime, extractDomain } from '../lib/time';
import { parseAndSanitize } from '../lib/sanitize';

interface PostDetailProps {
  post: Post;
}

export default function PostDetail({
  post,
}: PostDetailProps): React.ReactElement {
  const domain = post.url ? extractDomain(post.url) : null;

  return (
    <article className="shrink-0 rounded-t-lg border border-b-0 border-gray-200 bg-white p-4">
      {/* Title */}
      <h1 className="mb-2 text-xl font-semibold text-gray-900">
        {post.url ? (
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {post.title}
          </a>
        ) : (
          post.title
        )}
        {domain && (
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({domain})
          </span>
        )}
      </h1>

      {/* Meta line */}
      <div className="mb-4 flex flex-wrap gap-x-2 text-sm text-gray-600">
        <span>{post.points} points</span>
        <span className="text-gray-400">|</span>
        <span>by {post.author}</span>
        <span className="text-gray-400">|</span>
        <span>{formatRelativeTime(post.createdAt)}</span>
        <span className="text-gray-400">|</span>
        <span>
          {post.commentCount === 0
            ? 'no comments'
            : `${post.commentCount} comment${post.commentCount === 1 ? '' : 's'}`}
        </span>
      </div>

      {/* Text content (for text posts) */}
      {post.text && (
        <div className="max-h-[30vh] overflow-y-auto overflow-x-hidden border-t border-gray-100 pt-4">
          <div
            className="prose prose-sm min-w-0 max-w-none break-words text-gray-800"
            dangerouslySetInnerHTML={{ __html: parseAndSanitize(post.text) }}
          />
        </div>
      )}
    </article>
  );
}
