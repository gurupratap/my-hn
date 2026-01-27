'use client';

/**
 * SearchBox Component
 *
 * Instant search with debounced input and dropdown results.
 * Supports keyboard navigation (arrow keys, enter, escape).
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: number;
  title: string;
  points: number;
  author: string;
}

interface SearchResponse {
  posts: SearchResult[];
  totalFound: number;
  searchTimeMs: number;
}

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

function DropdownMessage({ text }: { text: string }): React.ReactElement {
  return <div className="px-3 py-2 text-sm text-gray-500">{text}</div>;
}

interface ResultItemProps {
  result: SearchResult;
  isSelected: boolean;
  onSelect: () => void;
  onHover: () => void;
}

function ResultItem({
  result,
  isSelected,
  onSelect,
  onHover,
}: ResultItemProps): React.ReactElement {
  return (
    <button
      onClick={onSelect}
      onMouseEnter={onHover}
      className={`w-full px-3 py-2 text-left hover:bg-orange-50 ${
        isSelected ? 'bg-orange-100' : ''
      }`}
      role="option"
      aria-selected={isSelected}
    >
      <div className="truncate text-sm font-medium text-gray-900">
        {result.title}
      </div>
      <div className="text-xs text-gray-500">
        {result.points} points by {result.author}
      </div>
    </button>
  );
}

export default function SearchBox(): React.ReactElement {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsOpen(false);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmedQuery)}&limit=10`
        );

        if (!response.ok) {
          setError(response.status === 503 ? 'Search unavailable' : 'Search failed');
          setResults([]);
          return;
        }

        const data: SearchResponse = await response.json();
        setResults(data.posts);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch {
        setError('Search failed');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      const isOutsideDropdown =
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node);
      const isOutsideInput =
        inputRef.current && !inputRef.current.contains(event.target as Node);

      if (isOutsideDropdown && isOutsideInput) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigateToPost = useCallback(
    (postId: number) => {
      setIsOpen(false);
      setQuery('');
      router.push(`/posts/${postId}`);
    },
    [router]
  );

  const closeAndBlur = useCallback(() => {
    setIsOpen(false);
    inputRef.current?.blur();
  }, []);

  const handleArrowDown = useCallback(() => {
    setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
  }, [results.length]);

  const handleArrowUp = useCallback(() => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
  }, []);

  const handleEnter = useCallback(() => {
    if (selectedIndex >= 0 && selectedIndex < results.length) {
      navigateToPost(results[selectedIndex].id);
    }
  }, [selectedIndex, results, navigateToPost]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAndBlur();
        return;
      }

      if (!isOpen || results.length === 0) return;

      const handlers: Record<string, () => void> = {
        ArrowDown: handleArrowDown,
        ArrowUp: handleArrowUp,
        Enter: handleEnter,
      };

      const handler = handlers[e.key];
      if (handler) {
        e.preventDefault();
        handler();
      }
    },
    [isOpen, results.length, closeAndBlur, handleArrowDown, handleArrowUp, handleEnter]
  );

  const showDropdown: boolean =
    isOpen &&
    (results.length > 0 || !!error || (query.trim().length >= MIN_QUERY_LENGTH && !isLoading));

  const renderDropdownContent = (): React.ReactNode => {
    if (error) {
      return <DropdownMessage text={error} />;
    }
    if (results.length === 0) {
      return <DropdownMessage text="No results found" />;
    }
    return results.map((result, index) => (
      <ResultItem
        key={result.id}
        result={result}
        isSelected={index === selectedIndex}
        onSelect={() => navigateToPost(result.id)}
        onHover={() => setSelectedIndex(index)}
      />
    ));
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search..."
          className="w-32 rounded border border-orange-300 bg-white px-2 py-1 text-sm text-gray-900 placeholder-gray-500 focus:w-48 focus:border-orange-500 focus:outline-none sm:w-40 sm:focus:w-56 transition-all"
          aria-label="Search posts"
          role="combobox"
          aria-controls="search-results-listbox"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
        {isLoading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          </div>
        )}
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          id="search-results-listbox"
          className="absolute right-0 top-full z-50 mt-1 max-h-80 w-72 overflow-y-auto rounded border border-gray-200 bg-white shadow-lg sm:w-96"
          role="listbox"
        >
          {renderDropdownContent()}
        </div>
      )}
    </div>
  );
}
