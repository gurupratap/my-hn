/**
 * Tests for PostItem Component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import PostItem from '../../components/PostItem';
import type { Post } from '../../domain/models';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }): React.ReactElement {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
});

// Mock the time utility to have predictable output
jest.mock('../../lib/time', () => ({
  formatRelativeTime: jest.fn(() => '2 hours ago'),
  extractDomain: jest.fn((url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, '');
    } catch {
      return undefined;
    }
  }),
}));

/**
 * Helper to create a mock post
 */
function createMockPost(overrides: Partial<Post> = {}): Post {
  return {
    id: 123,
    type: 'story',
    title: 'Test Post Title',
    url: 'https://example.com/article',
    author: 'testuser',
    points: 100,
    commentCount: 50,
    commentIds: [1, 2, 3],
    createdAt: new Date('2024-01-01T12:00:00Z'),
    ...overrides,
  };
}

describe('PostItem', () => {
  it('renders all fields correctly', () => {
    const post = createMockPost();

    render(<PostItem post={post} rank={1} />);

    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    expect(screen.getByText('(example.com)')).toBeInTheDocument();
    expect(screen.getByText('100 points')).toBeInTheDocument();
    expect(screen.getByText('by testuser')).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    expect(screen.getByText('50 comments')).toBeInTheDocument();
  });

  it('external URL opens in new tab', () => {
    const post = createMockPost({ url: 'https://external-site.com/page' });

    render(<PostItem post={post} rank={1} />);

    const titleLink = screen.getByText('Test Post Title');
    expect(titleLink).toHaveAttribute('href', 'https://external-site.com/page');
    expect(titleLink).toHaveAttribute('target', '_blank');
    expect(titleLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('text post title links to detail page', () => {
    const post = createMockPost({ url: undefined });

    render(<PostItem post={post} rank={1} />);

    const titleLink = screen.getByText('Test Post Title');
    expect(titleLink).toHaveAttribute('href', '/posts/123');
  });

  it('comment link has correct href', () => {
    const post = createMockPost({ id: 456, commentCount: 25 });

    render(<PostItem post={post} rank={1} />);

    const commentLink = screen.getByText('25 comments');
    expect(commentLink).toHaveAttribute('href', '/posts/456');
  });

  it('shows singular comment when count is 1', () => {
    const post = createMockPost({ commentCount: 1 });

    render(<PostItem post={post} rank={1} />);

    expect(screen.getByText('1 comment')).toBeInTheDocument();
  });

  it('shows "discuss" when no comments', () => {
    const post = createMockPost({ commentCount: 0 });

    render(<PostItem post={post} rank={1} />);

    expect(screen.getByText('discuss')).toBeInTheDocument();
  });

  it('does not show domain for text posts', () => {
    const post = createMockPost({ url: undefined });

    render(<PostItem post={post} rank={1} />);

    expect(screen.queryByText(/\(.*\)/)).not.toBeInTheDocument();
  });
});
