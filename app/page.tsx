/**
 * Home Page - Post List
 *
 * Server component that fetches and displays a paginated list of posts.
 * Supports sorting by top, new, or best via URL search params.
 */

import { fetchPosts, type SortType } from '../services/postsService';
import VirtualizedPostList from '../components/VirtualizedPostList';
import SortTabs from '../components/SortTabs';

interface HomePageProps {
  searchParams: Promise<{ sort?: string }>;
}

/**
 * Validates and returns a valid sort type from the search params
 */
function parseSortParam(sort?: string): SortType {
  if (sort === 'new' || sort === 'best' || sort === 'top') {
    return sort;
  }
  return 'top';
}

export default async function HomePage({
  searchParams,
}: HomePageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const sort = parseSortParam(params.sort);

  const posts = await fetchPosts({ sort, pageSize: 20, page: 1 });

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-gray-100">
      <SortTabs activeSort={sort} />
      <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col px-4 pb-2">
        <VirtualizedPostList initialPosts={posts} sort={sort} pageSize={20} />
      </div>
    </main>
  );
}
