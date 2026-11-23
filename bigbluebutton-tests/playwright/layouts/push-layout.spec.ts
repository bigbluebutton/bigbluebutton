import { Browser, expect, TestInfo } from '@playwright/test';

import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { test } from '../core/setup/fixtures';
import { waitForStableGeometry } from './geometry/regions';
import {
  box,
  DOCK_HANDLE,
  dockPosition,
  dockSize,
  minimizePresentation,
  moveDock,
  newDeviceContext,
  openClient,
  OpenClientOptions,
  recordLayoutProps,
  resizeBy,
  restorePresentation,
  shareWebcam,
} from './layoutDriver';

// Characterization of push layout as users see it: a presenter changes the layout, a viewer mirrors it.
// Assertions are on rendered boxes and attributes, not on the payload (see push-contract.spec.ts), so
// they hold across a change of the push wire format.

const PX = 2;

const presentationShown = (page: Page) => page.page.locator('[data-test="presentationContainer"]').isVisible();

async function presenterAndViewer(browser: Browser, testInfo: TestInfo, viewerOptions: OpenClientOptions = {}) {
  const presenter = await openClient(browser, testInfo, { fullName: 'Presenter' });
  await shareWebcam(presenter);
  const viewer = await openClient(browser, testInfo, {
    fullName: 'Viewer',
    isModerator: false,
    meetingId: presenter.meetingId,
    ...viewerOptions,
  });
  await viewer.page.locator('#cameraDock').waitFor();
  await waitForStableGeometry(viewer.page);
  return { presenter, viewer };
}

test.describe('Push layout: the viewer mirrors the presenter', { tag: ['@layout', '@media'] }, () => {
  test('Presentation minimize and restore', async ({ browser }, testInfo) => {
    const { presenter, viewer } = await presenterAndViewer(browser, testInfo);
    await minimizePresentation(presenter);
    await expect.poll(() => presentationShown(viewer), { message: 'the viewer minimizes too' }).toBe(false);
    await restorePresentation(presenter);
    await expect.poll(() => presentationShown(viewer), { message: 'the viewer restores too' }).toBe(true);
  });

  test('Dock position', async ({ browser }, testInfo) => {
    const { presenter, viewer } = await presenterAndViewer(browser, testInfo);
    for (const position of ['contentRight', 'contentBottom', 'contentLeft', 'contentTop'] as const) {
      // eslint-disable-next-line no-await-in-loop
      await moveDock(presenter.page, position);
      // eslint-disable-next-line no-await-in-loop
      await expect.poll(() => dockPosition(viewer.page), { message: `the viewer docks at ${position}` }).toBe(position);
    }
  });

  test('Dock size, at the same viewport', async ({ browser }, testInfo) => {
    // Today the size travels as a 2-decimal share of the window (rounding error up to 0.005 of the axis), and
    // a follower that stores a left/right width drops the 1vw sidebar margin. The bound below holds for
    // today's client and for one that carries the exact size.
    const { presenter, viewer } = await presenterAndViewer(browser, testInfo);
    const viewport = viewer.page.viewportSize()!;
    await resizeBy(presenter.page, DOCK_HANDLE, '#cameraDock', 150);
    const height = await dockSize(presenter.page);
    await expect
      .poll(async () => Math.abs((await dockSize(viewer.page)) - height), { message: 'the viewer dock matches' })
      .toBeLessThanOrEqual(0.005 * viewport.height + PX);
    await moveDock(presenter.page, 'contentRight');
    await resizeBy(presenter.page, DOCK_HANDLE, '#cameraDock', 100);
    const width = await dockSize(presenter.page);
    await expect
      .poll(async () => Math.abs((await dockSize(viewer.page)) - width), { message: 'the viewer side dock matches' })
      .toBeLessThanOrEqual(0.005 * viewport.width + 0.01 * viewport.width + PX);
  });

  test('Focused camera', async ({ browser }, testInfo) => {
    const { presenter, viewer } = await presenterAndViewer(browser, testInfo);
    // the focus action exists only with more than two streams
    const second = await openClient(browser, testInfo, {
      fullName: 'Second',
      isModerator: false,
      meetingId: presenter.meetingId,
    });
    await shareWebcam(viewer);
    await shareWebcam(second);
    await expect(presenter.page.locator(e.webcamVideoItem)).toHaveCount(3, { timeout: 30_000 });
    await presenter.page.locator(e.dropdownWebcamButton).filter({ hasText: 'Second' }).click();
    await presenter.getVisibleLocator(e.focusWebcamBtn).click();
    await viewer.hasText(`:nth-match(${e.dropdownWebcamButton}, 1)`, 'Second', 'the viewer focuses the same camera');
  });

  test('The layout type, when the presenter propagates it', async ({ browser }, testInfo) => {
    // the viewer starts in a hidden layout; the presenter joins in unified, which propagates
    const viewer = await openClient(browser, testInfo, {
      fullName: 'Viewer',
      isModerator: false,
      createParameter: 'meetingLayout=CAMERAS_ONLY',
      expectPresentation: false,
    });
    await expect(viewer.page.locator('#layout')).toHaveAttribute('data-layout', 'camerasOnly');
    await openClient(browser, testInfo, {
      fullName: 'Presenter',
      meetingId: viewer.meetingId,
      joinParameter: 'enforceLayout=UNIFIED_LAYOUT',
    });
    await expect(viewer.page.locator('#layout'), 'the viewer follows to unified').toHaveAttribute(
      'data-layout',
      'unified',
      { timeout: 30_000 },
    );
  });
});

test.describe('Push layout: when the viewer does not follow', { tag: ['@layout', '@media'] }, () => {
  test('With syncCameraDockSizeAndPosition off, the dock stays put but the presentation follows', async ({
    browser,
  }, testInfo) => {
    const { presenter, viewer } = await presenterAndViewer(browser, testInfo, {
      clientSettingsOverrides: { public: { layout: { syncCameraDockSizeAndPosition: false } } },
    });
    const viewerSize = await dockSize(viewer.page);
    await moveDock(presenter.page, 'contentRight');
    await resizeBy(presenter.page, DOCK_HANDLE, '#cameraDock', 120);
    await minimizePresentation(presenter);
    await expect.poll(() => presentationShown(viewer), { message: 'the presentation follows' }).toBe(false);
    await restorePresentation(presenter);
    await expect.poll(() => presentationShown(viewer)).toBe(true);
    await waitForStableGeometry(viewer.page);
    expect(await dockPosition(viewer.page), 'the dock does not move').toBe('contentTop');
    expect(Math.abs((await dockSize(viewer.page)) - viewerSize), 'the dock does not resize').toBeLessThanOrEqual(PX);
  });

  test('A presenter in a hidden layout sends no SetLayoutProps', async ({ browser }, testInfo) => {
    const context = await newDeviceContext(browser);
    const sent = await recordLayoutProps(context);
    const presenter = await openClient(browser, testInfo, {
      context,
      fullName: 'Presenter',
      joinParameter: 'enforceLayout=CAMERAS_ONLY',
      expectPresentation: false,
    });
    await expect(presenter.page.locator('#layout')).toHaveAttribute('data-layout', 'camerasOnly');
    await shareWebcam(presenter);
    await presenter.page.waitForTimeout(5000);
    expect(sent, 'no layout pushes from a hidden layout').toEqual([]);
  });
});

test.describe('Push layout: characterization', { tag: ['@layout', '@media'] }, () => {
  test('A late joiner does not get the size the presenter resized to (defect 12)', async ({ browser }, testInfo) => {
    const { presenter, viewer: early } = await presenterAndViewer(browser, testInfo);
    await resizeBy(presenter.page, DOCK_HANDLE, '#cameraDock', 200);
    const size = await dockSize(presenter.page);
    await expect.poll(async () => Math.abs((await dockSize(early.page)) - size)).toBeLessThanOrEqual(PX);

    // a brand-new browser context: the stored size is per tab, not per meeting
    const late = await openClient(browser, testInfo, {
      fullName: 'Late',
      isModerator: false,
      meetingId: presenter.meetingId,
    });
    await late.page.locator('#cameraDock').waitFor();
    await waitForStableGeometry(late.page);
    const dock = (await box(late.page, '#cameraDock'))!;
    const presentation = (await box(late.page, '[data-test="presentationContainer"]'))!;
    const media = dock.height + 10 + presentation.height;
    const defaultHeight = Math.max(0.2 * media, 120);
    testInfo.annotations.push({ type: 'late-joiner', description: `presenter ${size}, late ${dock.height}` });
    expect(Math.abs(dock.height - defaultHeight), 'the late joiner gets the 20% default').toBeLessThanOrEqual(PX);
    expect(Math.abs(dock.height - size), 'not the presenter size').toBeGreaterThan(PX);
  });

  test('SetLayoutProps per 200 px dock resize drag', async ({ browser }, testInfo) => {
    const context = await newDeviceContext(browser);
    const sent = await recordLayoutProps(context);
    const presenter = await openClient(browser, testInfo, { context, fullName: 'Presenter' });
    await shareWebcam(presenter);
    await presenter.page.waitForTimeout(2000);
    const before = sent.length;
    // 200 px in 40 mouse moves of 5 px
    await resizeBy(presenter.page, DOCK_HANDLE, '#cameraDock', 200, 40);
    await presenter.page.waitForTimeout(2000);
    const count = sent.length - before;
    testInfo.annotations.push({ type: 'SetLayoutProps per 200 px drag', description: String(count) });
    console.log(`[push] SetLayoutProps per 200 px drag: ${count}`);
    const resizing = sent.slice(before).map((m) => m.isResizing);
    expect(resizing[0], 'the first push marks the resize').toBe(true);
    expect(resizing[resizing.length - 1], 'the last push ends it').toBe(false);
    // today's client: about one push per 0.01 of rate change, plus start and stop
    expect(count).toBeLessThanOrEqual(LAYOUT_PROPS_PER_200PX_BUDGET);
  });

  test('A moderator who joins in a hidden layout sends no syncWithPresenterLayout change', async ({
    browser,
  }, testInfo) => {
    // The flag is sent only when the moderator's own push flag changes at runtime and differs from the
    // meeting's (pushLayoutEngine.jsx); joining straight into a hidden layout does not change it.
    const presenter = await openClient(browser, testInfo, { fullName: 'Presenter' });
    const context = await newDeviceContext(browser);
    const syncs: boolean[] = [];
    await context.routeWebSocket('**/graphql**', (webSocket) => {
      const server = webSocket.connectToServer();
      webSocket.onMessage((message) => {
        const text = message.toString();
        if (text.includes('SetSyncWithPresenterLayout')) {
          syncs.push(JSON.parse(text).payload.variables.syncWithPresenterLayout);
        }
        server.send(message);
      });
      server.onMessage((message) => webSocket.send(message));
    });
    const moderator = await openClient(browser, testInfo, {
      context,
      fullName: 'Moderator2',
      meetingId: presenter.meetingId,
      joinParameter: 'enforceLayout=CAMERAS_ONLY',
      expectPresentation: false,
    });
    await expect(moderator.page.locator('#layout')).toHaveAttribute('data-layout', 'camerasOnly');
    await moderator.page.waitForTimeout(5000);
    expect(syncs).toEqual([]);
  });
});

// Measured on the unchanged client (dist-base): 22 in 3 of 3 runs. The new client must not send more.
export const LAYOUT_PROPS_PER_200PX_BUDGET = 22;
