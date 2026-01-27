/**
 * Navbar Component
 *
 * Main navigation bar with logo, home link, and search.
 * Sort controls are handled by the SortTabs component on the page.
 */

import Link from 'next/link';
import SearchBox from './SearchBox';

export default function Navbar(): React.ReactElement {
  return (
    <header className="shrink-0 bg-orange-500">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-2">
        {/* Logo and title - links to home */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-white hover:opacity-90"
        >
          <span className="flex items-center justify-center rounded border-2 border-white px-1.5 py-0.5 text-xs">
            my-hn
          </span>
        </Link>

        {/* Search box */}
        <SearchBox />
      </nav>
    </header>
  );
}
