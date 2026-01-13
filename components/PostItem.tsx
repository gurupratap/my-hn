/**
 * PostItem Component
 *
 * Displays a single post with rank, title, metadata, and links.
 */

import Link from 'next/link';
import type { Post } from '../domain/models';
import { formatRelativeTime, extractDomain } from '../lib/time';

interface PostItemProps {
  post: Post;
  rank: number;
}

export default function PostItem({
  post,
  rank,
}: PostItemProps): React.ReactElement {
  const domain = post.url ? extractDomain(post.url) : null;
  const isExternalLink = Boolean(post.url);
  const detailUrl = `/posts/${post.id}`;

  return (
    <article className="flex gap-2 border-b border-gray-200 px-4 py-3 last:border-b-0">
      {/* Rank */}
      <span className="w-8 flex-shrink-0 text-right text-sm text-gray-500">
        {rank}.
      </span>

      <div className="min-w-0 flex-1">
        {/* Title */}
        <div className="flex flex-wrap items-baseline gap-1">
          {isExternalLink ? (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 hover:underline"
            >
              {post.title}
            </a>
          ) : (
            <Link href={detailUrl} className="text-gray-900 hover:underline">
              {post.title}
            </Link>
          )}

          {domain && (
            <span className="text-xs text-gray-500">({domain})</span>
          )}
        </div>

        {/* Meta line */}
        <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-gray-500">
          <span>{post.points} points</span>
          <span>by {post.author}</span>
          <span>{formatRelativeTime(post.createdAt)}</span>
          <Link
            href={detailUrl}
            className="hover:underline"
          >
            {post.commentCount === 0
              ? 'discuss'
              : `${post.commentCount} comment${post.commentCount === 1 ? '' : 's'}`}
          </Link>
        </div>
      </div>
    </article>
  );
}
