'use client';

/**
 * CommentItem Component
 *
 * Displays a single comment with author, time, sanitized text,
 * and nested children. Supports collapse/expand functionality.
 */

import { useState } from 'react';
import type { Comment } from '../domain/models';
import { formatRelativeTime } from '../lib/time';
import { parseAndSanitize } from '../lib/sanitize';

interface CommentItemProps {
  comment: Comment;
  depth?: number;
}

interface CommentHeaderProps {
  comment: Comment;
  isCollapsed: boolean;
  hasChildren: boolean;
  onToggle: () => void;
}

const MAX_INDENT_DEPTH = 5;

function CommentHeader({
  comment,
  isCollapsed,
  hasChildren,
  onToggle,
}: CommentHeaderProps): React.ReactElement {
  const childCount = comment.children.length;
  const childLabel = childCount === 1 ? 'child' : 'children';

  return (
    <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
      <button
        onClick={onToggle}
        className="flex h-5 w-5 items-center justify-center rounded hover:bg-gray-100"
        aria-label={isCollapsed ? 'Expand comment' : 'Collapse comment'}
      >
        <span className="text-gray-400">{isCollapsed ? '[+]' : '[-]'}</span>
      </button>
      <span className="font-medium text-gray-700">{comment.author}</span>
      <span>{formatRelativeTime(comment.createdAt)}</span>
      {isCollapsed && hasChildren && (
        <span className="text-gray-400">
          ({childCount} {childLabel})
        </span>
      )}
    </div>
  );
}

function CommentBody({ comment }: { comment: Comment }): React.ReactElement {
  return (
    <div
      className="prose prose-sm max-w-none text-gray-800"
      dangerouslySetInnerHTML={{ __html: parseAndSanitize(comment.text) }}
    />
  );
}

function CommentChildren({
  comments,
  depth,
}: {
  comments: Comment[];
  depth: number;
}): React.ReactElement {
  return (
    <div className="mt-2">
      {comments.map((child) => (
        <CommentItem key={child.id} comment={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function CommentItem({
  comment,
  depth = 0,
}: CommentItemProps): React.ReactElement {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const hasChildren = comment.children.length > 0;
  const indentLevel = Math.min(depth, MAX_INDENT_DEPTH);
  const containerClass = depth > 0 ? 'border-l-2 border-gray-200 pl-4' : '';
  const marginLeft = depth > 0 ? `${indentLevel * 4}px` : '0';

  return (
    <div className={containerClass} style={{ marginLeft }}>
      <div className="py-3">
        <CommentHeader
          comment={comment}
          isCollapsed={isCollapsed}
          hasChildren={hasChildren}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
        {!isCollapsed && (
          <>
            <CommentBody comment={comment} />
            {hasChildren && (
              <CommentChildren comments={comment.children} depth={depth} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
