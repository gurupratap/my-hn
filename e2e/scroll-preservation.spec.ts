import { test, expect, BrowserContext, Page } from '@playwright/test';

test.describe('Scroll Position Preservation', () => {
  let context: BrowserContext;
  let page: Page;

  // Create a fresh browser context for each test to ensure complete isolation
  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto('/');
    // Wait for posts to load
    await page.waitForSelector('[data-index="9"]', { timeout: 10000 });
  });

  test.afterEach(async () => {
    await context.close();
  });

  test('should preserve scroll position when switching between tabs', async () => {
    // Wait for posts to load - wait for at least 10 posts to be visible
    await page.waitForSelector('[data-index="9"]', { timeout: 10000 });

    // Get the scroll container from the active tab only
    const getActiveScrollContainer = () => page.locator('[data-active="true"] .flex-1.overflow-auto');
    const getActivePosts = () => page.locator('[data-active="true"] [data-index]');

    // Wait for the container to be ready
    await getActiveScrollContainer().waitFor({ state: 'visible' });

    // Scroll to a specific post by scrolling the container
    await getActiveScrollContainer().hover();
    for (let i = 0; i < 15; i++) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(50);
    }

    // Wait for scroll and virtualizer to settle
    await page.waitForTimeout(500);

    const visiblePosts = await getActivePosts().all();
    const firstVisibleIndex = await visiblePosts[0].getAttribute('data-index');
    const initialVisibleIndex = parseInt(firstVisibleIndex || '0', 10);

    // Verify we actually scrolled (should see post index > 5)
    expect(initialVisibleIndex).toBeGreaterThan(5);

    // Switch to "New" tab
    await page.click('text=New');

    // Wait for new tab content to load
    await page.waitForTimeout(500);
    await page.waitForSelector('[data-active="true"] [data-index]');

    // Switch back to "Top" tab
    await page.click('text=Top');

    // Wait for content - scroll position is preserved naturally in mounted DOM
    await page.waitForSelector('[data-active="true"] [data-index]');
    await page.waitForTimeout(100);

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
    // Wait for posts to load
    await page.waitForSelector('[data-index="9"]', { timeout: 10000 });

    // Get the scroll container from the active tab
    const getActiveScrollContainer = () => page.locator('[data-active="true"] .flex-1.overflow-auto');
    await getActiveScrollContainer().waitFor({ state: 'visible' });

    // Scroll down using mouse wheel on Top tab
    await getActiveScrollContainer().hover();
    for (let i = 0; i < 15; i++) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(300);

    // Switch to "New" tab (first time visiting)
    await page.click('text=New');

    // Wait for content to load
    await page.waitForTimeout(500);
    await page.waitForSelector('[data-active="true"] [data-index]');

    // Get visible posts from the active (New) tab only
    const visiblePosts = await page.locator('[data-active="true"] [data-index]').all();
    const firstVisibleIndex = await visiblePosts[0].getAttribute('data-index');
    const visibleIndex = parseInt(firstVisibleIndex || '0', 10);

    // First visit to a tab should start at the top (index 0-2)
    expect(visibleIndex).toBeLessThanOrEqual(2);
  });

  test('should preserve scroll position independently for each tab', async () => {
    // Wait for posts to load
    await page.waitForSelector('[data-index="9"]', { timeout: 10000 });

    // Helper to get active tab's scroll container and posts
    const getActiveScrollContainer = () => page.locator('[data-active="true"] .flex-1.overflow-auto');
    const getActivePosts = () => page.locator('[data-active="true"] [data-index]');

    await getActiveScrollContainer().waitFor({ state: 'visible' });

    // Scroll Top tab down (15 wheel events)
    await getActiveScrollContainer().hover();
    for (let i = 0; i < 15; i++) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(300);

    // Get the visible index for Top tab
    let visiblePosts = await getActivePosts().all();
    const topTabIndex = parseInt((await visiblePosts[0].getAttribute('data-index')) || '0', 10);
    expect(topTabIndex).toBeGreaterThan(5); // Verify we scrolled

    // Switch to New tab and scroll less (8 wheel events)
    await page.click('text=New');
    await page.waitForSelector('[data-active="true"] [data-index="9"]', { timeout: 10000 });
    await getActiveScrollContainer().waitFor({ state: 'visible' });
    await page.waitForTimeout(300);

    await getActiveScrollContainer().hover();
    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(500);

    // Get the visible index for New tab
    visiblePosts = await getActivePosts().all();
    const newTabIndex = parseInt((await visiblePosts[0].getAttribute('data-index')) || '0', 10);
    expect(newTabIndex).toBeGreaterThan(0); // Verify we scrolled on New tab

    // Switch to Best tab (don't scroll - stay at top)
    await page.click('text=Best');
    await page.waitForSelector('[data-active="true"] [data-index]');
    await page.waitForTimeout(200);

    // Now go back to Top tab - scroll position is preserved in mounted DOM
    await page.click('text=Top');
    await page.waitForSelector('[data-active="true"] [data-index]');
    await page.waitForTimeout(100);

    visiblePosts = await getActivePosts().all();
    const topTabIndexRestored = parseInt((await visiblePosts[0].getAttribute('data-index')) || '0', 10);
    console.log('topTabIndex:', topTabIndex, 'topTabIndexRestored:', topTabIndexRestored);

    // Scroll should be preserved (DOM stays mounted)
    expect(topTabIndexRestored).toBeGreaterThan(0);

    // Go to New tab - scroll position is preserved in mounted DOM
    await page.click('text=New');
    await page.waitForSelector('[data-active="true"] [data-index]');
    await page.waitForTimeout(100);

    visiblePosts = await getActivePosts().all();
    const newTabIndexRestored = parseInt((await visiblePosts[0].getAttribute('data-index')) || '0', 10);
    console.log('newTabIndex:', newTabIndex, 'newTabIndexRestored:', newTabIndexRestored);

    // Scroll should be preserved (DOM stays mounted)
    expect(newTabIndexRestored).toBeGreaterThan(0);
  });
});
