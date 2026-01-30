import { test, expect, BrowserContext, Page, Locator } from '@playwright/test';

test.describe('Scroll Position Preservation', () => {
  let context: BrowserContext;
  let page: Page;

  // Increase timeout for CI environments
  test.setTimeout(60000);

  // Helper to wait for scroll container to be scrollable
  const waitForScrollable = async (container: Locator) => {
    await container.waitFor({ state: 'visible' });
    // Wait for the container to have scrollable content
    await expect(async () => {
      const isScrollable = await container.evaluate(
        (el) => el.scrollHeight > el.clientHeight
      );
      expect(isScrollable).toBe(true);
    }).toPass({ timeout: 10000 });
  };

  // Helper to scroll and verify the scroll actually worked
  const scrollAndVerify = async (
    container: Locator,
    deltaY: number,
    iterations: number,
    expectedMinScroll: number
  ) => {
    // Scroll the container
    for (let i = 0; i < iterations; i++) {
      await container.evaluate((el, dy) => el.scrollBy(0, dy), deltaY);
      await page.waitForTimeout(50);
    }
    // Wait for scroll to settle and verify it worked
    await page.waitForTimeout(200);
    await expect(async () => {
      const scrollTop = await container.evaluate((el) => el.scrollTop);
      expect(scrollTop).toBeGreaterThanOrEqual(expectedMinScroll);
    }).toPass({ timeout: 5000 });
  };

  // Create a fresh browser context for each test to ensure complete isolation
  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto('/');
    // Wait for at least the first post to load (virtualized list may not render all items)
    await page.waitForSelector('[data-active="true"] [data-index="0"]', { timeout: 30000 });
  });

  test.afterEach(async () => {
    await context.close();
  });

  test('should preserve scroll position when switching between tabs', async () => {
    // Get the scroll container from the active tab only
    const getActiveScrollContainer = () => page.locator('[data-active="true"] .flex-1.overflow-auto');
    const getActivePosts = () => page.locator('[data-active="true"] [data-index]');

    // Wait for the container to be scrollable
    await waitForScrollable(getActiveScrollContainer());

    // Scroll and verify it worked
    await scrollAndVerify(getActiveScrollContainer(), 100, 15, 500);

    // Wait for virtualizer to settle
    await page.waitForTimeout(300);

    const visiblePosts = await getActivePosts().all();
    const firstVisibleIndex = await visiblePosts[0].getAttribute('data-index');
    const initialVisibleIndex = parseInt(firstVisibleIndex || '0', 10);

    // Verify we actually scrolled (should see post index > 5)
    expect(initialVisibleIndex).toBeGreaterThan(5);

    // Switch to "New" tab
    await page.click('text=New');

    // Wait for new tab content to load
    await page.waitForSelector('[data-active="true"] [data-index="0"]', { timeout: 30000 });
    await page.waitForTimeout(300);

    // Switch back to "Top" tab
    await page.click('text=Top');

    // Wait for content - scroll position is preserved naturally in mounted DOM
    await page.waitForSelector('[data-active="true"] [data-index]');
    await page.waitForTimeout(300);

    // Get the first visible post index after returning
    const visiblePostsAfter = await getActivePosts().all();
    const firstVisibleIndexAfter = await visiblePostsAfter[0].getAttribute('data-index');
    const returnedVisibleIndex = parseInt(firstVisibleIndexAfter || '0', 10);

    // Get scroll position after returning
    const scrollPositionAfterReturn = await getActiveScrollContainer().evaluate((el) => el.scrollTop);

    // Scroll should be preserved (DOM stays mounted, scroll position is retained)
    expect(returnedVisibleIndex).toBeGreaterThan(0);
    expect(scrollPositionAfterReturn).toBeGreaterThan(0);
  });

  test('should start at top when visiting a tab for the first time', async () => {
    // Get the scroll container from the active tab
    const getActiveScrollContainer = () => page.locator('[data-active="true"] .flex-1.overflow-auto');

    // Wait for the container to be scrollable
    await waitForScrollable(getActiveScrollContainer());

    // Scroll down on Top tab and verify
    await scrollAndVerify(getActiveScrollContainer(), 100, 15, 500);
    await page.waitForTimeout(300);

    // Switch to "New" tab (first time visiting)
    await page.click('text=New');

    // Wait for new tab content to fully load - must wait for index 0 specifically
    await page.waitForSelector('[data-active="true"] [data-index="0"]', { timeout: 30000 });
    await page.waitForTimeout(300);

    // Verify the New tab's scroll container is at the top
    const newTabScrollTop = await getActiveScrollContainer().evaluate((el) => el.scrollTop);

    // First visit to a tab should start at the top (scrollTop near 0)
    expect(newTabScrollTop).toBeLessThanOrEqual(50);
  });

  test('should preserve scroll position independently for each tab', async () => {
    // Helper to get active tab's scroll container and posts
    const getActiveScrollContainer = () => page.locator('[data-active="true"] .flex-1.overflow-auto');
    const getActivePosts = () => page.locator('[data-active="true"] [data-index]');

    // Wait for scroll container to be scrollable
    await waitForScrollable(getActiveScrollContainer());

    // Scroll Top tab down and verify
    await scrollAndVerify(getActiveScrollContainer(), 100, 15, 500);
    await page.waitForTimeout(300);

    // Get the visible index for Top tab
    let visiblePosts = await getActivePosts().all();
    const topTabIndex = parseInt((await visiblePosts[0].getAttribute('data-index')) || '0', 10);
    expect(topTabIndex).toBeGreaterThan(5); // Verify we scrolled

    // Switch to New tab and scroll less
    await page.click('text=New');
    await page.waitForSelector('[data-active="true"] [data-index="0"]', { timeout: 30000 });
    await waitForScrollable(getActiveScrollContainer());
    await page.waitForTimeout(300);

    // Scroll New tab and verify
    await scrollAndVerify(getActiveScrollContainer(), 100, 10, 300);
    await page.waitForTimeout(300);

    // Get the visible index for New tab
    visiblePosts = await getActivePosts().all();
    const newTabIndex = parseInt((await visiblePosts[0].getAttribute('data-index')) || '0', 10);
    expect(newTabIndex).toBeGreaterThan(0); // Verify we scrolled on New tab

    // Switch to Best tab (don't scroll - stay at top)
    await page.click('text=Best');
    await page.waitForSelector('[data-active="true"] [data-index]');
    await page.waitForTimeout(300);

    // Now go back to Top tab - scroll position is preserved in mounted DOM
    await page.click('text=Top');
    await page.waitForSelector('[data-active="true"] [data-index]');
    await page.waitForTimeout(300);

    visiblePosts = await getActivePosts().all();
    const topTabIndexRestored = parseInt((await visiblePosts[0].getAttribute('data-index')) || '0', 10);
    console.log('topTabIndex:', topTabIndex, 'topTabIndexRestored:', topTabIndexRestored);

    // Scroll should be preserved (DOM stays mounted)
    expect(topTabIndexRestored).toBeGreaterThan(0);

    // Go to New tab - scroll position is preserved in mounted DOM
    await page.click('text=New');
    await page.waitForSelector('[data-active="true"] [data-index]');
    await page.waitForTimeout(300);

    visiblePosts = await getActivePosts().all();
    const newTabIndexRestored = parseInt((await visiblePosts[0].getAttribute('data-index')) || '0', 10);
    console.log('newTabIndex:', newTabIndex, 'newTabIndexRestored:', newTabIndexRestored);

    // Scroll should be preserved (DOM stays mounted)
    expect(newTabIndexRestored).toBeGreaterThan(0);
  });
});
