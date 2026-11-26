import { expect, Page as PlaywrightPage } from '@playwright/test';

import { elements as e } from '../core/elements';
import { test } from '../core/setup/fixtures';
import { captureGeometry, waitForStableGeometry } from './geometry/regions';
import { minimizePresentation, openClient, restorePresentation, toggleChatPanel } from './layoutDriver';

// Characterization of what the layout does at startup: the panels it opens (which waits for the
// layout to be ready), the first-load-only chat opening, and the userdata that hides bars.

const openPanel = (page: PlaywrightPage) =>
  page.evaluate(() => {
    const sidebar = document.querySelector('.bbb-sidebar-content');
    if (!sidebar || sidebar.getBoundingClientRect().width === 0) return null;
    const match = Array.from(sidebar.classList).find((c) => c.startsWith('bbb-sidebar-content--'));
    return match ? match.replace('bbb-sidebar-content--', '') : null;
  });

test.describe('Layout startup', { tag: ['@layout', '@ci'] }, () => {
  test('On desktop the public chat opens on join', async ({ browser }, testInfo) => {
    const mod = await openClient(browser, testInfo);
    await expect.poll(() => openPanel(mod.page)).toBe('chat');
  });

  test('bbb_show_participants_on_login opens the user list', async ({ browser }, testInfo) => {
    const mod = await openClient(browser, testInfo, {
      joinParameter: 'userdata-bbb_show_participants_on_login=true',
    });
    await expect.poll(() => openPanel(mod.page)).toBe('userlist');
  });

  test('bbb_hide_sidebar_navigation hides the navigation and opens no panel', async ({ browser }, testInfo) => {
    const mod = await openClient(browser, testInfo, { joinParameter: 'userdata-bbb_hide_sidebar_navigation=true' });
    const { regions } = await captureGeometry(mod.page);
    expect(regions.sidebarNavigation?.visible ?? false, 'no navigation').toBe(false);
    expect(await openPanel(mod.page), 'no panel').toBeNull();
  });

  test('bbb_hide_presentation_on_join starts with the presentation minimized', async ({ browser }, testInfo) => {
    const mod = await openClient(browser, testInfo, {
      joinParameter: 'userdata-bbb_hide_presentation_on_join=true',
      expectPresentation: false,
    });
    await expect(mod.page.locator(e.restorePresentation)).toBeVisible();
    await expect(mod.page.locator('[data-test="presentationContainer"]')).toBeHidden();
  });

  test('A chat the user closed stays closed while the meeting layout changes', async ({ browser }, testInfo) => {
    // the viewer joins first, so the presenter's arrival writes the meeting layout record
    const viewer = await openClient(browser, testInfo, { fullName: 'Viewer', isModerator: false });
    await expect.poll(() => openPanel(viewer.page)).toBe('chat');
    await toggleChatPanel(viewer);
    expect(await openPanel(viewer.page)).toBeNull();
    const presenter = await openClient(browser, testInfo, { fullName: 'Presenter', meetingId: viewer.meetingId });
    await minimizePresentation(presenter);
    await expect(viewer.page.locator('[data-test="presentationContainer"]')).toBeHidden();
    await restorePresentation(presenter);
    await expect(viewer.page.locator('[data-test="presentationContainer"]')).toBeVisible();
    await waitForStableGeometry(viewer.page);
    expect(await openPanel(viewer.page), 'the chat does not reopen').toBeNull();
  });
});

test.describe('Layout startup: hidden bars', { tag: ['@layout', '@ci'] }, () => {
  test('bbb_hide_nav_bar hides the nav bar', async ({ browser }, testInfo) => {
    const mod = await openClient(browser, testInfo, { joinParameter: 'userdata-bbb_hide_nav_bar=true' });
    const { regions } = await captureGeometry(mod.page);
    expect(regions.navBar?.visible ?? false).toBe(false);
    expect(regions.actionsBar?.visible).toBe(true);
    expect(regions.presentation?.y, 'the media area starts at the top').toBe(0);
  });

  test('bbb_hide_actions_bar hides the actions bar', async ({ browser }, testInfo) => {
    const mod = await openClient(browser, testInfo, { joinParameter: 'userdata-bbb_hide_actions_bar=true' });
    const { regions, viewport } = await captureGeometry(mod.page);
    expect(regions.actionsBar?.visible ?? false).toBe(false);
    expect(regions.navBar?.visible).toBe(true);
    const presentation = regions.presentation!;
    expect(presentation.y + presentation.height, 'the media area reaches the bottom').toBe(viewport.height);
  });

  test('bbb_hide_controls hides the actions bar and the top row of the nav bar', async ({ browser }, testInfo) => {
    const mod = await openClient(browser, testInfo, { joinParameter: 'userdata-bbb_hide_controls=true' });
    const { regions } = await captureGeometry(mod.page);
    expect(regions.actionsBar?.visible ?? false).toBe(false);
    expect(regions.navBar?.visible, 'the nav bar stays').toBe(true);
    await expect(mod.page.locator(e.leaveMeetingDropdown)).toBeHidden();
  });
});
