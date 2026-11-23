import { Browser, BrowserContext, expect, Page as PlaywrightPage, TestInfo } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME, VIDEO_LOADING_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { ClientSettingsOverrides, Page } from '../core/page';
import { Box, captureGeometry, Geometry, waitForStableGeometry } from './geometry/regions';

// Shared steps for the layout characterization suite. Everything here reads or drives the page
// through stable hooks (ids, data-test, bbb-* classes) and geometry, never through the layout
// engine's internals, so the same tests run against the old and the new client.

export const DOCK_POSITIONS = [
  'contentTop',
  'contentRight',
  'contentBottom',
  'contentLeft',
  'sidebarContentBottom',
] as const;
export type DockPosition = (typeof DOCK_POSITIONS)[number];

export interface DeviceProfile {
  width: number;
  height: number;
  /** a phone: mobile user agent, touch, isMobile */
  phone?: boolean;
}

export const PHONE_USER_AGENT =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) ' +
  'Version/17.0 Mobile/15E148 Safari/604.1';

// Version-agnostic resize handles (core/elements.ts): the new hooks first, then today's re-resizable markup.
export const DOCK_HANDLE = e.resizeWebcamHandler;
export const SIDEBAR_CONTENT_HANDLE = e.resizeSidebarContentMain;
export const SIDEBAR_AUX_HANDLE = e.resizeSidebarContentAuxiliary;

export const MULTI_FUNCTIONAL_MODE: ClientSettingsOverrides = { public: { multiFunctionalMode: { enabled: true } } };

export interface OpenClientOptions {
  profile?: DeviceProfile;
  isModerator?: boolean;
  fullName?: string;
  meetingId?: string;
  createParameter?: string;
  joinParameter?: string;
  clientDist?: string;
  clientSettingsOverrides?: ClientSettingsOverrides;
  shouldCloseAudioModal?: boolean;
  /** wait for the presentation to mount (default true; false for layouts without one) */
  expectPresentation?: boolean;
  context?: BrowserContext;
}

export async function newDeviceContext(browser: Browser, profile: DeviceProfile = { width: 1366, height: 768 }) {
  return browser.newContext({
    viewport: { width: profile.width, height: profile.height },
    ...(profile.phone ? { userAgent: PHONE_USER_AGENT, isMobile: true, hasTouch: true, deviceScaleFactor: 1 } : {}),
  });
}

/** Joins one user in a fresh context sized for `profile`, and waits for a settled layout. */
export async function openClient(browser: Browser, testInfo: TestInfo, options: OpenClientOptions = {}): Promise<Page> {
  const { profile, isModerator = true, context: givenContext, expectPresentation = true, ...initOptions } = options;
  const context = givenContext ?? (await newDeviceContext(browser, profile));
  const page = await context.newPage();
  const bbbPage = new Page(browser, page, testInfo);
  await bbbPage.init(isModerator, { testInfo, ...initOptions });
  // The presentation mounts once its slide data arrives, after the layout first settles: wait for it
  // whenever the layout shows one, or a capture can catch the empty media area.
  if (expectPresentation) {
    await page.locator('[data-test="presentationContainer"]').waitFor({ timeout: ELEMENT_WAIT_LONGER_TIME * 3 });
  }
  await waitForStableGeometry(page);
  return bbbPage;
}

export async function shareWebcam(page: Page): Promise<void> {
  await page.shareWebcam();
  await page.page.locator('video[data-local-stream="true"]').first().waitFor({ timeout: VIDEO_LOADING_WAIT_TIME });
  await waitForStableGeometry(page.page);
}

export async function box(page: PlaywrightPage, selector: string): Promise<Box | null> {
  const locator = page.locator(selector).first();
  if (!(await locator.count())) return null;
  const rect = await locator.boundingBox();
  if (!rect) return null;
  return {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    visible: rect.width > 0 && rect.height > 0,
  };
}

export const dockPosition = (page: PlaywrightPage) =>
  page.locator('#cameraDock').getAttribute('data-position', { timeout: ELEMENT_WAIT_LONGER_TIME });

/** Closes the visible toasts (as Page.closeAllToastNotifications does): on narrow viewports they cover the tiles. */
export async function closeToasts(page: PlaywrightPage): Promise<void> {
  const toasts = page.locator(e.toastContainer);
  const deadline = Date.now() + ELEMENT_WAIT_LONGER_TIME;
  while ((await toasts.count()) > 0 && Date.now() < deadline) {
    // eslint-disable-next-line no-await-in-loop
    await toasts
      .first()
      .click({ timeout: 2000 })
      .catch(() => undefined);
    // a pointer left on a toast pauses its auto-close
    // eslint-disable-next-line no-await-in-loop
    await page.mouse.move(0, 0);
    // eslint-disable-next-line no-await-in-loop
    await toasts
      .first()
      .waitFor({ state: 'hidden', timeout: 2000 })
      .catch(() => undefined);
  }
  await expect(toasts).toHaveCount(0, { timeout: ELEMENT_WAIT_LONGER_TIME });
}

/**
 * Starts a dock drag on the local video and moves a little, so the drop zones appear. Dragging stays
 * disabled while a resize settles (webcam/component.tsx, the 100 ms snap delay), so a drag that does
 * not start is released and tried again, as a user would.
 */
export async function startDockDrag(page: PlaywrightPage): Promise<void> {
  await closeToasts(page);
  const zones = page.locator('[data-test^="dropArea-"]').first();
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    // Grab the local video at a point the dock owns: toasts (e.g. "joined the audio conference")
    // can cover the middle of the tile on narrow viewports.
    // eslint-disable-next-line no-await-in-loop
    const grab = await page.evaluate(() => {
      const video = document.querySelector('video[data-local-stream="true"]');
      const dock = document.querySelector('#cameraDock');
      if (!video || !dock) return null;
      const r = video.getBoundingClientRect();
      const fractions = [0.5, 0.3, 0.7, 0.2, 0.8];
      for (const fy of fractions) {
        for (const fx of fractions) {
          const x = r.x + r.width * fx;
          const y = r.y + r.height * fy;
          const hit = document.elementFromPoint(x, y);
          if (hit && dock.contains(hit)) return { x, y };
        }
      }
      return null;
    });
    if (!grab) throw new Error('no grabbable point on the local video');
    // eslint-disable-next-line no-await-in-loop
    await page.mouse.move(grab.x, grab.y);
    // eslint-disable-next-line no-await-in-loop
    await page.mouse.down();
    // a small first move starts the drag
    // eslint-disable-next-line no-await-in-loop
    await page.mouse.move(grab.x + 10, grab.y + 10, { steps: 6 });
    // eslint-disable-next-line no-await-in-loop
    const started = await zones.waitFor({ timeout: 4000 }).then(
      () => true,
      () => false,
    );
    if (started) return;
    // eslint-disable-next-line no-await-in-loop
    await page.mouse.up();
    // eslint-disable-next-line no-await-in-loop
    await waitForStableGeometry(page);
  }
  throw new Error('the dock drag did not start (no drop zones) after 3 attempts');
}

/** Drags the dock from the local video to a drop zone and waits for the layout to settle. */
export async function moveDock(page: PlaywrightPage, position: DockPosition): Promise<void> {
  if ((await dockPosition(page)) === position) return;
  await startDockDrag(page);
  const zone = await box(page, `[data-test="dropArea-${position}"]`);
  if (!zone || !zone.visible) {
    await page.mouse.up();
    throw new Error(`drop zone ${position} is not available`);
  }
  await page.mouse.move(zone.x + zone.width / 2, zone.y + zone.height / 2, { steps: 15 });
  await page.mouse.up();
  await expect.poll(() => dockPosition(page), { timeout: ELEMENT_WAIT_LONGER_TIME }).toBe(position);
  await waitForStableGeometry(page);
}

export type Edge = 'top' | 'right' | 'bottom' | 'left';

export interface Handle {
  box: Box;
  edge: Edge;
  selector: string;
  index: number;
}

/** The handle of a region and the edge of that region it sits on. */
export async function findHandle(page: PlaywrightPage, handleSelector: string, regionSelector: string) {
  const handles = page.locator(handleSelector);
  const region = await box(page, regionSelector);
  if (!region) return null;
  const count = await handles.count();
  for (let i = 0; i < count; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const rect = await handles.nth(i).boundingBox();
    if (rect && rect.width > 0 && rect.height > 0) {
      const cx = rect.x + rect.width / 2;
      const cy = rect.y + rect.height / 2;
      const distances: [Edge, number][] = [
        ['top', Math.abs(cy - region.y)],
        ['bottom', Math.abs(cy - (region.y + region.height))],
        ['left', Math.abs(cx - region.x)],
        ['right', Math.abs(cx - (region.x + region.width))],
      ];
      distances.sort((a, b) => a[1] - b[1]);
      return {
        box: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          visible: true,
        },
        edge: distances[0][0],
        selector: handleSelector,
        index: i,
      } as Handle;
    }
  }
  return null;
}

// Today the dock's own content covers the half of a top/left-edge handle that overlaps the dock, and
// toasts can cover a handle too: grab it at a point the handle itself owns, preferring its outer side.
async function grabPoint(page: PlaywrightPage, handle: Handle) {
  const point = await page
    .locator(handle.selector)
    .nth(handle.index)
    .evaluate((element, edge) => {
      const r = element.getBoundingClientRect();
      const across = edge === 'top' || edge === 'bottom';
      // outer side first: top/left edges grab near their start, bottom/right near their end
      const outerFirst = edge === 'top' || edge === 'left' ? [0.2, 0.5, 0.8] : [0.8, 0.5, 0.2];
      const along = [0.5, 0.3, 0.7, 0.15, 0.85];
      for (const a of along) {
        for (const o of outerFirst) {
          const x = across ? r.x + r.width * a : r.x + r.width * o;
          const y = across ? r.y + r.height * o : r.y + r.height * a;
          const hit = document.elementFromPoint(x, y);
          if (hit && (hit === element || element.contains(hit))) return { x, y };
        }
      }
      return null;
    }, handle.edge);
  if (!point) throw new Error(`no grabbable point on the ${handle.edge} handle`);
  return point;
}

/** Drags a handle by `delta` px along its axis (positive = right or down), in `steps` mouse moves. */
export async function dragHandle(page: PlaywrightPage, handle: Handle, delta: number, steps = 20): Promise<void> {
  await closeToasts(page);
  const from = await grabPoint(page, handle);
  const vertical = handle.edge === 'top' || handle.edge === 'bottom';
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(vertical ? from.x : from.x + delta, vertical ? from.y + delta : from.y, { steps });
  await page.mouse.up();
  await waitForStableGeometry(page);
}

/** Grows (positive) or shrinks (negative) a region through its handle, whatever edge it sits on. */
export async function resizeBy(
  page: PlaywrightPage,
  handleSelector: string,
  regionSelector: string,
  amount: number,
  steps = 20,
): Promise<Handle> {
  const handle = await findHandle(page, handleSelector, regionSelector);
  if (!handle) throw new Error(`no resize handle for ${regionSelector}`);
  const outward = handle.edge === 'bottom' || handle.edge === 'right' ? 1 : -1;
  await dragHandle(page, handle, outward * amount, steps);
  return handle;
}

export async function dockSize(page: PlaywrightPage): Promise<number> {
  const dock = await box(page, '#cameraDock');
  const position = await dockPosition(page);
  if (!dock) return 0;
  return position === 'contentLeft' || position === 'contentRight' ? dock.width : dock.height;
}

export async function minimizePresentation(page: Page): Promise<void> {
  await page.waitAndClick(e.minimizePresentation);
  await waitForStableGeometry(page.page);
}

export async function restorePresentation(page: Page): Promise<void> {
  await page.waitAndClick(e.restorePresentation);
  await waitForStableGeometry(page.page);
}

/** Toggles the sidebar content through the chat button (open on desktop by default). */
export async function toggleChatPanel(page: Page): Promise<void> {
  await page.waitAndClick(e.messagesSidebarButton);
  await waitForStableGeometry(page.page);
}

export async function openUserList(page: Page): Promise<void> {
  await page.waitAndClick(e.usersListSidebarButton);
  await waitForStableGeometry(page.page);
}

/** Opens the auxiliary sidebar (multi-functional mode must be enabled) with the user list in it. */
export async function openAuxiliaryWithUserList(page: Page): Promise<void> {
  await page.waitAndClick(e.enableMultiFunctionalMode);
  await page.waitAndClick(e.usersListSidebarButton);
  await page.page.locator(`${e.sidebarContentAuxiliary} ${e.userListPanel}`).waitFor();
  await waitForStableGeometry(page.page);
}

export async function webcamsFullscreen(page: Page): Promise<void> {
  await page.waitAndClick(e.dropdownWebcamButton);
  await page.waitAndClick(e.webcamsFullscreenButton);
  await waitForStableGeometry(page.page);
}

export async function geometryOf(page: PlaywrightPage): Promise<Geometry> {
  await waitForStableGeometry(page);
  return captureGeometry(page);
}

export interface LayoutPropsMessage {
  layout: string;
  presentationIsOpen: boolean;
  isResizing: boolean;
  cameraPosition: string;
  focusedCamera: string;
  presentationVideoRate: number;
  syncWithPresenterLayout: boolean;
}

/**
 * Records every SetLayoutProps mutation a context sends on the GraphQL websocket. Must run before
 * the pages of the context are created.
 */
export async function recordLayoutProps(context: BrowserContext): Promise<LayoutPropsMessage[]> {
  const sent: LayoutPropsMessage[] = [];
  await context.routeWebSocket('**/graphql**', (webSocket) => {
    const server = webSocket.connectToServer();
    webSocket.onMessage((message) => {
      const text = message.toString();
      if (text.includes('SetLayoutProps')) {
        try {
          sent.push(JSON.parse(text).payload.variables as LayoutPropsMessage);
        } catch {
          // not a JSON frame
        }
      }
      server.send(message);
    });
    server.onMessage((message) => webSocket.send(message));
  });
  return sent;
}
