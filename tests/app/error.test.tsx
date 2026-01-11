/**
 * Tests for Error Boundary Components
 *
 * Validates that error boundaries render correctly and handle user interactions.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../../app/error';

// Mock next/link for testing
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
 * Helper to create a mock error object for testing
 */
function createMockError(
  message: string,
  digest?: string
): Error & { digest?: string } {
  const error = new Error(message) as Error & { digest?: string };
  if (digest) {
    error.digest = digest;
  }
  return error;
}

describe('Error Boundary', () => {
  const mockReset = jest.fn();

  beforeEach(() => {
    mockReset.mockClear();
  });

  it('renders error message', () => {
    const testError = createMockError('Test error message');

    render(<ErrorBoundary error={testError} reset={mockReset} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders default message when error has no message', () => {
    const testError = createMockError('');

    render(<ErrorBoundary error={testError} reset={mockReset} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText('An unexpected error occurred. Please try again.')
    ).toBeInTheDocument();
  });

  it('displays error digest when provided', () => {
    const testError = createMockError('Test error', 'abc123');

    render(<ErrorBoundary error={testError} reset={mockReset} />);

    expect(screen.getByText('Error ID: abc123')).toBeInTheDocument();
  });

  it('does not display error digest when not provided', () => {
    const testError = createMockError('Test error');

    render(<ErrorBoundary error={testError} reset={mockReset} />);

    expect(screen.queryByText(/Error ID:/)).not.toBeInTheDocument();
  });

  it('renders Try Again button', () => {
    const testError = createMockError('Test error');

    render(<ErrorBoundary error={testError} reset={mockReset} />);

    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    expect(tryAgainButton).toBeInTheDocument();
  });

  it('calls reset when Try Again button is clicked', () => {
    const testError = createMockError('Test error');

    render(<ErrorBoundary error={testError} reset={mockReset} />);

    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(tryAgainButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('renders Go Home link', () => {
    const testError = createMockError('Test error');

    render(<ErrorBoundary error={testError} reset={mockReset} />);

    const goHomeLink = screen.getByRole('link', { name: /go home/i });
    expect(goHomeLink).toBeInTheDocument();
    expect(goHomeLink).toHaveAttribute('href', '/');
  });

  it('renders error icon', () => {
    const testError = createMockError('Test error');

    render(<ErrorBoundary error={testError} reset={mockReset} />);

    // Check for SVG icon (warning triangle)
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
