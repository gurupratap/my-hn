'use client';

/**
 * Global Error Boundary Component
 *
 * Catches errors in the root layout and other critical components.
 * This is a fallback for errors that the regular error.tsx cannot catch.
 * Must include its own <html> and <body> tags as it replaces the root layout.
 */

import ErrorDisplay from '../components/ErrorDisplay';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({
  error,
  reset,
}: GlobalErrorProps): React.ReactElement {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div className="min-h-screen flex items-center justify-center px-4">
          <ErrorDisplay
            title="Critical Error"
            message="Something went wrong while loading the application. Please try refreshing the page."
            digest={error.digest}
            onRetry={reset}
            size="large"
          />
        </div>
      </body>
    </html>
  );
}
