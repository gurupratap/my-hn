/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { usePosts } from '../../hooks/usePosts';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockPosts = [
  {
    id: 1,
    type: 'story',
    title: 'Test Post 1',
    author: 'user1',
    points: 100,
    commentCount: 10,
    commentIds: [],
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    type: 'story',
    title: 'Test Post 2',
    author: 'user2',
    points: 50,
    commentCount: 5,
    commentIds: [],
    createdAt: '2024-01-02T00:00:00.000Z',
  },
];

describe('usePosts', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('starts with loading state', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => usePosts());

    expect(result.current.loading).toBe(true);
    expect(result.current.posts).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('fetches posts successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPosts,
    });

    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.posts).toHaveLength(2);
    expect(result.current.posts[0].id).toBe(1);
    expect(result.current.posts[0].title).toBe('Test Post 1');
    expect(result.current.error).toBeNull();
  });

  it('converts date strings to Date objects', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPosts,
    });

    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.posts[0].createdAt instanceof Date).toBe(true);
  });

  it('handles fetch error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toContain('500');
    expect(result.current.posts).toEqual([]);
  });

  it('uses correct sort parameter in URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderHook(() => usePosts({ sort: 'new' }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('sort=new')
    );
  });

  it('uses correct pageSize parameter in URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderHook(() => usePosts({ pageSize: 10 }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('pageSize=10')
    );
  });

  it('refetch resets and fetches posts again', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [mockPosts[0]],
      });

    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.posts).toHaveLength(2);

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.posts).toHaveLength(1);
  });

  it('loadMore appends posts', async () => {
    const page1Posts = mockPosts;
    const page2Posts = [
      {
        id: 3,
        type: 'story',
        title: 'Test Post 3',
        author: 'user3',
        points: 25,
        commentCount: 2,
        commentIds: [],
        createdAt: '2024-01-03T00:00:00.000Z',
      },
    ];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => page1Posts,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => page2Posts,
      });

    const { result } = renderHook(() => usePosts({ pageSize: 2 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.posts).toHaveLength(2);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.posts).toHaveLength(3);
    expect(result.current.posts[2].id).toBe(3);
  });

  it('sets hasMore to false when fewer posts returned than pageSize', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [mockPosts[0]], // Only 1 post when pageSize is 30
    });

    const { result } = renderHook(() => usePosts({ pageSize: 30 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasMore).toBe(false);
  });
});
