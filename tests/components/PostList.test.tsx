/**
 * Tests for PostList Component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import PostList from '../../components/PostList';
import type { Post } from '../../domain/models';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }): React.ReactElement {
    return <a href={href}>{children}</a>;
  };
});

/**
 * Helper to create a mock post
 */
function createMockPost(overrides: Partial<Post> = {}): Post {
  return {
    id: 1,
    type: 'story',
    title: 'Test Post Title',
    url: 'https://example.com/test',
    author: 'testuser',
    points: 100,
    commentCount: 50,
    commentIds: [1, 2, 3],
    createdAt: new Date('2024-01-01T12:00:00Z'),
    ...overrides,
  };
}

describe('PostList', () => {
  it('renders correct number of posts', () => {
    const posts = [
      createMockPost({ id: 1, title: 'First Post' }),
      createMockPost({ id: 2, title: 'Second Post' }),
      createMockPost({ id: 3, title: 'Third Post' }),
    ];

    render(<PostList posts={posts} />);

    expect(screen.getByText('First Post')).toBeInTheDocument();
    expect(screen.getByText('Second Post')).toBeInTheDocument();
    expect(screen.getByText('Third Post')).toBeInTheDocument();
  });

  it('shows empty state when no posts', () => {
    render(<PostList posts={[]} />);

    expect(screen.getByText('No posts found.')).toBeInTheDocument();
  });

  it('renders posts with correct ranks starting from 1', () => {
    const posts = [
      createMockPost({ id: 1, title: 'First Post' }),
      createMockPost({ id: 2, title: 'Second Post' }),
    ];

    render(<PostList posts={posts} />);

    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('2.')).toBeInTheDocument();
  });

  it('renders posts with custom startRank', () => {
    const posts = [
      createMockPost({ id: 1, title: 'First Post' }),
      createMockPost({ id: 2, title: 'Second Post' }),
    ];

    render(<PostList posts={posts} startRank={31} />);

    expect(screen.getByText('31.')).toBeInTheDocument();
    expect(screen.getByText('32.')).toBeInTheDocument();
  });
});
