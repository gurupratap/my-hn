/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { useComments } from '../../hooks/useComments';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockComments = [
  {
    id: 101,
    author: 'commenter1',
    text: 'Great post!',
    createdAt: '2024-01-01T00:00:00.000Z',
    parentId: 1,
    commentIds: [201],
    children: [
      {
        id: 201,
        author: 'replier1',
        text: 'I agree!',
        createdAt: '2024-01-01T01:00:00.000Z',
        parentId: 101,
        commentIds: [],
        children: [],
      },
    ],
  },
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

  it('starts with loading state', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useComments({ postId: 1 }));

    expect(result.current.loading).toBe(true);
    expect(result.current.comments).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('fetches comments successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockComments,
    });

    const { result } = renderHook(() => useComments({ postId: 1 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comments).toHaveLength(2);
    expect(result.current.comments[0].id).toBe(101);
    expect(result.current.comments[0].text).toBe('Great post!');
    expect(result.current.error).toBeNull();
  });

  it('converts date strings to Date objects', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockComments,
    });

    const { result } = renderHook(() => useComments({ postId: 1 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comments[0].createdAt instanceof Date).toBe(true);
  });

  it('converts nested comment dates', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockComments,
    });

    const { result } = renderHook(() => useComments({ postId: 1 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check nested child comment date
    expect(result.current.comments[0].children[0].createdAt instanceof Date).toBe(true);
  });

  it('handles fetch error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() => useComments({ postId: 999 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toContain('404');
    expect(result.current.comments).toEqual([]);
  });

  it('uses correct postId in URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderHook(() => useComments({ postId: 123 }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/posts/123/comments')
    );
  });

  it('uses correct maxDepth parameter in URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderHook(() => useComments({ postId: 1, maxDepth: 5 }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('maxDepth=5')
    );
  });

  it('uses default maxDepth of 3', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderHook(() => useComments({ postId: 1 }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('maxDepth=3')
    );
  });

  it('refetch fetches comments again', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockComments,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [mockComments[0]],
      });

    const { result } = renderHook(() => useComments({ postId: 1 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comments).toHaveLength(2);

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.comments).toHaveLength(1);
  });

  it('refetches when postId changes', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockComments,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { result, rerender } = renderHook(
      ({ postId }) => useComments({ postId }),
      { initialProps: { postId: 1 } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comments).toHaveLength(2);

    rerender({ postId: 2 });

    await waitFor(() => {
      expect(result.current.comments).toHaveLength(0);
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
