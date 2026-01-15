/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { useComments } from '../../hooks/useComments';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockInitialComments = [
  {
    id: 101,
    author: 'commenter1',
    text: 'Great post!',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    parentId: 1,
    commentIds: [201],
    children: [
      {
        id: 201,
        author: 'replier1',
        text: 'I agree!',
        createdAt: new Date('2024-01-01T01:00:00.000Z'),
        parentId: 101,
        commentIds: [],
        children: [],
      },
    ],
  },
];

const mockNextPageComments = [
  {
    id: 102,
    author: 'commenter2',
    text: 'Nice work!',
    createdAt: '2024-01-01T02:00:00.000Z',
    parentId: 1,
    commentIds: [],
    children: [],
  },
];

describe('useComments', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('initializes with provided comments', () => {
    const { result } = renderHook(() =>
      useComments({
        postId: 1,
        initialComments: mockInitialComments,
        initialHasMore: true,
      })
    );

    expect(result.current.comments).toHaveLength(1);
    expect(result.current.comments[0].id).toBe(101);
    expect(result.current.loading).toBe(false);
    expect(result.current.hasMore).toBe(true);
  });

  it('initializes with hasMore false when no more comments', () => {
    const { result } = renderHook(() =>
      useComments({
        postId: 1,
        initialComments: mockInitialComments,
        initialHasMore: false,
      })
    );

    expect(result.current.hasMore).toBe(false);
  });

  it('loads more comments when loadMore is called', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        comments: mockNextPageComments,
        hasMore: false,
      }),
    });

    const { result } = renderHook(() =>
      useComments({
        postId: 1,
        initialComments: mockInitialComments,
        initialHasMore: true,
      })
    );

    expect(result.current.comments).toHaveLength(1);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.comments).toHaveLength(2);
    expect(result.current.comments[1].id).toBe(102);
    expect(result.current.hasMore).toBe(false);
  });

  it('converts date strings to Date objects when loading more', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        comments: mockNextPageComments,
        hasMore: false,
      }),
    });

    const { result } = renderHook(() =>
      useComments({
        postId: 1,
        initialComments: mockInitialComments,
        initialHasMore: true,
      })
    );

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.comments[1].createdAt instanceof Date).toBe(true);
  });

  it('does not load more when hasMore is false', async () => {
    const { result } = renderHook(() =>
      useComments({
        postId: 1,
        initialComments: mockInitialComments,
        initialHasMore: false,
      })
    );

    await act(async () => {
      await result.current.loadMore();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does not load more when already loading', async () => {
    mockFetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() =>
      useComments({
        postId: 1,
        initialComments: mockInitialComments,
        initialHasMore: true,
      })
    );

    // Start first load
    act(() => {
      result.current.loadMore();
    });

    // Try to load again while loading
    act(() => {
      result.current.loadMore();
    });

    // Should only have been called once
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('uses correct API endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        comments: [],
        hasMore: false,
      }),
    });

    const { result } = renderHook(() =>
      useComments({
        postId: 123,
        initialComments: [],
        initialHasMore: true,
        pageSize: 20,
      })
    );

    await act(async () => {
      await result.current.loadMore();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/comments?postId=123&page=2&pageSize=20'
    );
  });

  it('deduplicates comments by ID', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        comments: [
          { ...mockNextPageComments[0] },
          {
            id: 101, // Duplicate ID
            author: 'duplicate',
            text: 'Duplicate',
            createdAt: '2024-01-01T00:00:00.000Z',
            parentId: 1,
            commentIds: [],
            children: [],
          },
        ],
        hasMore: false,
      }),
    });

    const { result } = renderHook(() =>
      useComments({
        postId: 1,
        initialComments: mockInitialComments,
        initialHasMore: true,
      })
    );

    await act(async () => {
      await result.current.loadMore();
    });

    // Should only have 2 comments (original + 1 new, not the duplicate)
    expect(result.current.comments).toHaveLength(2);
  });

  it('handles fetch error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() =>
      useComments({
        postId: 1,
        initialComments: mockInitialComments,
        initialHasMore: true,
      })
    );

    await act(async () => {
      await result.current.loadMore();
    });

    expect(consoleSpy).toHaveBeenCalled();
    // Comments should remain unchanged
    expect(result.current.comments).toHaveLength(1);
    consoleSpy.mockRestore();
  });

  it('resets state when postId changes', async () => {
    const newComments = [
      {
        id: 301,
        author: 'newAuthor',
        text: 'New comment',
        createdAt: new Date('2024-01-02T00:00:00.000Z'),
        parentId: 2,
        commentIds: [],
        children: [],
      },
    ];

    const { result, rerender } = renderHook(
      ({ postId, initialComments, initialHasMore }) =>
        useComments({ postId, initialComments, initialHasMore }),
      {
        initialProps: {
          postId: 1,
          initialComments: mockInitialComments,
          initialHasMore: true,
        },
      }
    );

    expect(result.current.comments[0].id).toBe(101);

    rerender({
      postId: 2,
      initialComments: newComments,
      initialHasMore: false,
    });

    expect(result.current.comments[0].id).toBe(301);
    expect(result.current.hasMore).toBe(false);
  });
});
