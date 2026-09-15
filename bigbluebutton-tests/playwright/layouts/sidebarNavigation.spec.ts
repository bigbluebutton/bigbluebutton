import { initializePages, linkIssue } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { SidebarNavigation } from './sidebarNavigation';

test.describe.parallel('Sidebar navigation rail - scrollbar', { tag: '@ci' }, () => {
  // Spec A: the ghost scrollbar. Needs real (space-consuming) scrollbars, so it
  // runs on an own browser without --hide-scrollbars (still headless in CI).
  test('Icon buttons keep their size when the rail enters the ghost-scrollbar band', async ({
    browser,
    context,
  }, testInfo) => {
    linkIssue(25564);
    const nav = new SidebarNavigation(browser, context);
    try {
      await nav.initModPageWithVisibleScrollbars(testInfo);
      await nav.assertGhostScrollbarAbsent();
    } finally {
      await nav.closeVisibleScrollbarsPage();
    }
  });

  // Spec C: dynamic viewport resizes, the real-world trigger of the issue.
  test('Rail stays correct across viewport resizes (bar only on real overflow)', async ({
    browser,
    context,
  }, testInfo) => {
    linkIssue(25564);
    const nav = new SidebarNavigation(browser, context);
    try {
      await nav.initModPageWithVisibleScrollbars(testInfo);
      await nav.assertResizeInvariant();
    } finally {
      await nav.closeVisibleScrollbarsPage();
    }
  });

  // Spec B: CI-safe height-budget guard on the default (scrollbars-hidden) browser.
  test('Sidebar navigation scrolls only when the content really overflows', async ({ browser, context }, testInfo) => {
    linkIssue(25564);
    const nav = new SidebarNavigation(browser, context);
    await initializePages(nav, browser, { testInfo });
    await nav.assertOverflowIsHonest();
  });

  // Spec D: the icon size follows the user font-size setting but never overflows the
  // scrollbox content box. Needs real scrollbars, so it runs on the same own browser
  // as Specs A and C: with the gutter hidden the content box bound is invisible.
  test('Rail icons follow the user font size and stay within the rail content box', async ({
    browser,
    context,
  }, testInfo) => {
    linkIssue(25564);
    const nav = new SidebarNavigation(browser, context);
    try {
      await nav.initModPageWithVisibleScrollbars(testInfo);
      await nav.assertFontSizeScaling();
    } finally {
      await nav.closeVisibleScrollbarsPage();
    }
  });
});
