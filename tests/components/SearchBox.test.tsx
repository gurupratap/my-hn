/**
 * Tests for SearchBox Component
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import SearchBox from '../../components/SearchBox';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('SearchBox', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          posts: [
            { id: 1, title: 'First Result', points: 100, author: 'user1' },
            { id: 2, title: 'Second Result', points: 80, author: 'user2' },
          ],
          totalFound: 2,
          searchTimeMs: 15,
        }),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('rendering', () => {
    it('renders search input', () => {
      render(<SearchBox />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('has correct ARIA attributes', () => {
      render(<SearchBox />);

      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-label', 'Search posts');
      expect(input).toHaveAttribute('aria-controls', 'search-results-listbox');
      expect(input).toHaveAttribute('aria-haspopup', 'listbox');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
    });

    it('does not show dropdown initially', () => {
      render(<SearchBox />);

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('search behavior', () => {
    it('does not search when query is less than 2 characters', async () => {
      render(<SearchBox />);

      const input = screen.getByRole('combobox');
      await act(async () => {
        fireEvent.change(input, { target: { value: 'a' } });
        jest.advanceTimersByTime(350);
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('searches after debounce delay when query is 2+ characters', async () => {
      render(<SearchBox />);

      const input = screen.getByRole('combobox');
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } });
        jest.advanceTimersByTime(350);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/search?q=test&limit=10');
    });

    it('trims whitespace from query', async () => {
      render(<SearchBox />);

      const input = screen.getByRole('combobox');
      await act(async () => {
        fireEvent.change(input, { target: { value: '  test  ' } });
        jest.advanceTimersByTime(350);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/search?q=test&limit=10');
    });

    it('shows loading spinner while searching', async () => {
      mockFetch.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: () => Promise.resolve({ posts: [], totalFound: 0 }) }), 100))
      );

      render(<SearchBox />);

      const input = screen.getByRole('combobox');
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } });
        jest.advanceTimersByTime(350);
      });

      // Spinner should be visible during loading
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('shows results in dropdown', async () => {
      render(<SearchBox />);

      const input = screen.getByRole('combobox');
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } });
        jest.advanceTimersByTime(350);
      });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      expect(screen.getByText('First Result')).toBeInTheDocument();
      expect(screen.getByText('Second Result')).toBeInTheDocument();
      expect(screen.getByText('100 points by user1')).toBeInTheDocument();
    });

    it('shows "No results found" for empty results', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ posts: [], totalFound: 0, searchTimeMs: 10 }),
      });

      render(<SearchBox />);

      const input = screen.getByRole('combobox');
      await act(async () => {
        fireEvent.change(input, { target: { value: 'nonexistent' } });
        jest.advanceTimersByTime(350);
      });

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('handles search failure without crashing', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      render(<SearchBox />);

      const input = screen.getByRole('combobox');
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } });
        jest.advanceTimersByTime(350);
      });

      // Verify fetch was called
      expect(mockFetch).toHaveBeenCalledWith('/api/search?q=test&limit=10');

      // Loading should finish (no spinner)
      await waitFor(() => {
        expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
      });

      // Component should still function - no results dropdown since isOpen is false on error
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('handles 503 status without crashing', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
      });

      render(<SearchBox />);

      const input = screen.getByRole('combobox');
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } });
        jest.advanceTimersByTime(350);
      });

      // Verify fetch was called
      expect(mockFetch).toHaveBeenCalledWith('/api/search?q=test&limit=10');

      // Loading should finish
      await waitFor(() => {
        expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
      });
    });

    it('handles network errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      render(<SearchBox />);

      const input = screen.getByRole('combobox');
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } });
        jest.advanceTimersByTime(350);
      });

      // Verify fetch was called
      expect(mockFetch).toHaveBeenCalledWith('/api/search?q=test&limit=10');

      // Loading should finish without crashing
      await waitFor(() => {
        expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
      });
    });
  });

  describe('keyboard navigation', () => {
    async function setupWithResults() {
      render(<SearchBox />);
      const input = screen.getByRole('combobox');
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } });
        jest.advanceTimersByTime(350);
      });
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
      return input;
    }

    it('closes dropdown on Escape', async () => {
      const input = await setupWithResults();

      await act(async () => {
        fireEvent.keyDown(input, { key: 'Escape' });
      });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('selects next item on ArrowDown', async () => {
      const input = await setupWithResults();

      await act(async () => {
        fireEvent.keyDown(input, { key: 'ArrowDown' });
      });

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('selects previous item on ArrowUp', async () => {
      const input = await setupWithResults();

      // First go down twice
      await act(async () => {
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        fireEvent.keyDown(input, { key: 'ArrowDown' });
      });

      // Then go up once
      await act(async () => {
        fireEvent.keyDown(input, { key: 'ArrowUp' });
      });

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('navigates to post on Enter', async () => {
      const input = await setupWithResults();

      // ArrowDown to select first item
      await act(async () => {
        fireEvent.keyDown(input, { key: 'ArrowDown' });
      });

      // Enter to navigate - separate act block so selectedIndex state is updated
      await act(async () => {
        fireEvent.keyDown(input, { key: 'Enter' });
      });

      expect(mockPush).toHaveBeenCalledWith('/posts/1');
    });

    it('does not navigate when no item selected', async () => {
      const input = await setupWithResults();

      await act(async () => {
        fireEvent.keyDown(input, { key: 'Enter' });
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('mouse interaction', () => {
    async function setupWithResults() {
      render(<SearchBox />);
      const input = screen.getByRole('combobox');
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } });
        jest.advanceTimersByTime(350);
      });
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
      return input;
    }

    it('navigates to post on click', async () => {
      await setupWithResults();

      const firstResult = screen.getByText('First Result');
      await act(async () => {
        fireEvent.click(firstResult);
      });

      expect(mockPush).toHaveBeenCalledWith('/posts/1');
    });

    it('highlights item on hover', async () => {
      await setupWithResults();

      const secondResult = screen.getByText('Second Result').closest('button');
      await act(async () => {
        fireEvent.mouseEnter(secondResult!);
      });

      expect(secondResult).toHaveAttribute('aria-selected', 'true');
    });

    it('closes dropdown when clicking outside', async () => {
      await setupWithResults();

      await act(async () => {
        fireEvent.mouseDown(document.body);
      });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('reopens dropdown on focus if results exist', async () => {
      const input = await setupWithResults();

      // Close dropdown
      await act(async () => {
        fireEvent.mouseDown(document.body);
      });
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

      // Focus input again
      await act(async () => {
        fireEvent.focus(input);
      });

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('navigation cleanup', () => {
    it('clears query after navigation', async () => {
      render(<SearchBox />);

      const input = screen.getByRole('combobox');
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } });
        jest.advanceTimersByTime(350);
      });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.keyDown(input, { key: 'ArrowDown' });
      });

      await act(async () => {
        fireEvent.keyDown(input, { key: 'Enter' });
      });

      expect(input).toHaveValue('');
    });

    it('closes dropdown after navigation', async () => {
      render(<SearchBox />);

      const input = screen.getByRole('combobox');
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } });
        jest.advanceTimersByTime(350);
      });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.keyDown(input, { key: 'ArrowDown' });
      });

      await act(async () => {
        fireEvent.keyDown(input, { key: 'Enter' });
      });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });
});
