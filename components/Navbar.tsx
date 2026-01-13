/**
 * Navbar Component
 *
 * Main navigation bar with logo and home link.
 * Sort controls are handled by the SortTabs component on the page.
 */

import Link from 'next/link';

export default function Navbar(): React.ReactElement {
  return (
    <header className="bg-orange-500">
      <nav className="mx-auto flex max-w-4xl items-center px-4 py-2">
        {/* Logo and title - links to home */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-white hover:opacity-90"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded border-2 border-white text-xs">
            Y
          </span>
          <span>Hacker News</span>
        </Link>
      </nav>
    </header>
  );
}
