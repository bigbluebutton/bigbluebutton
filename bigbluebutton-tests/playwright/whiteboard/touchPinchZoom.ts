import {
  type Browser,
  type BrowserContext,
  type CDPSession,
  devices,
  expect,
  type JSHandle,
  type Page as PlaywrightPage,
  test,
  type TestInfo,
} from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';
import { dragAcrossWhiteboard, getTldrawCamera, getTldrawEditor, type TldrawCamera, type TldrawEditor } from './util';

type Point = { x: number; y: number };

type TouchTestEditor = TldrawEditor & {
  getCurrentToolId: () => string;
  screenToPage: (point: Point) => Point;
};

interface PinchOptions {
  steps?: number;
  stepMs?: number;
  // How far the point between the fingers travels over the whole gesture.
  drift?: Point;
}

const SLOW_PINCH: PinchOptions = { steps: 60, stepMs: 33 };
// Largest zoom change against the pinch direction, relative, that still counts as one direction.
const MAX_ZOOM_REVERSAL = 0.003;

// Same desktop user agent and viewport as the project; only touch input is added, so the
// layout and the zoom toolbar stay the desktop ones.
async function newTouchContext(browser: Browser): Promise<BrowserContext> {
  return browser.newContext({
    ...devices['Desktop Chrome'],
    viewport: { width: 1366, height: 768 },
    hasTouch: true,
  });
}

// Two fingers on a vertical line through `center`, moving from `fromDistance` to `toDistance`
// apart. CDP input gives the page trusted touch and pointer events, like a real touch screen.
async function touchPinch(
  page: PlaywrightPage,
  cdp: CDPSession,
  center: Point,
  fromDistance: number,
  toDistance: number,
  { steps = 30, stepMs = 16, drift = { x: 0, y: 0 } }: PinchOptions = {},
) {
  const fingers = (distance: number, progress: number) => [
    { id: 0, x: center.x + drift.x * progress, y: center.y + drift.y * progress - distance / 2 },
    { id: 1, x: center.x + drift.x * progress, y: center.y + drift.y * progress + distance / 2 },
  ];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: fingers(fromDistance, 0) });
  for (let step = 1; step <= steps; step += 1) {
    await page.waitForTimeout(stepMs);
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: fingers(fromDistance + ((toDistance - fromDistance) * step) / steps, step / steps),
    });
  }
  await page.waitForTimeout(stepMs);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

async function twoFingerTap(page: PlaywrightPage, cdp: CDPSession, center: Point) {
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [
      { id: 0, x: center.x, y: center.y - 50 },
      { id: 1, x: center.x, y: center.y + 50 },
    ],
  });
  await page.waitForTimeout(80);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

async function readCamera(page: PlaywrightPage): Promise<TldrawCamera> {
  const camera = await getTldrawCamera(page);
  if (!camera) throw new Error('tldraw camera not available');
  return camera;
}

async function waitForSettledCamera(page: PlaywrightPage, label: string): Promise<TldrawCamera> {
  await expect
    .poll(
      async () => {
        const before = await getTldrawCamera(page);
        await page.waitForTimeout(600);
        const after = await getTldrawCamera(page);
        return JSON.stringify(before) === JSON.stringify(after);
      },
      { message: label, timeout: ELEMENT_WAIT_LONGER_TIME },
    )
    .toBe(true);
  return readCamera(page);
}

async function withEditor<T>(page: PlaywrightPage, read: (editor: JSHandle<TouchTestEditor>) => Promise<T>) {
  const editor = (await getTldrawEditor(page)) as unknown as JSHandle<TouchTestEditor>;
  try {
    return await read(editor);
  } finally {
    await editor.dispose();
  }
}

// The camera zoom of every animation frame, read from the transform tldraw puts on its html layer.
async function startZoomSampler(page: PlaywrightPage) {
  await page.evaluate(() => {
    const state = window as unknown as { pinchZoomSamples: number[]; pinchZoomSampling: boolean };
    state.pinchZoomSamples = [];
    state.pinchZoomSampling = true;
    const sample = () => {
      const layer = document.querySelector('.tl-html-layer') as HTMLElement | null;
      const scale = /scale\(([-\d.e]+)\)/.exec(layer?.style.transform ?? '');
      if (scale) state.pinchZoomSamples.push(Number(scale[1]));
      if (state.pinchZoomSampling) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
}

async function stopZoomSampler(page: PlaywrightPage): Promise<number[]> {
  return page.evaluate(() => {
    const state = window as unknown as { pinchZoomSamples: number[]; pinchZoomSampling: boolean };
    state.pinchZoomSampling = false;
    return state.pinchZoomSamples;
  });
}

// Largest frame-to-frame zoom change against `direction` (1 = zooming in), relative.
function largestZoomReversal(samples: number[], direction: 1 | -1): number {
  return samples.reduce((largest, zoom, index) => {
    if (index === 0) return largest;
    const change = ((zoom - samples[index - 1]) / samples[index - 1]) * direction;
    return Math.max(largest, -change);
  }, 0);
}

export class TouchPinchZoom extends MultiUsers {
  private cdp!: CDPSession;

  private touchPage!: PlaywrightPage;

  private center!: Point;

  private presenterZoom100 = 1;

  private viewerZoom100 = 1;

  // `touch` picks the role that joins from a touch screen; the other one joins from the test's
  // own (mouse) context.
  async initTouchPages(testInfo: TestInfo, { touch = 'presenter' }: { touch?: 'presenter' | 'viewer' } = {}) {
    const touchContext = await newTouchContext(this.browser);
    const presenterPage = touch === 'presenter' ? await touchContext.newPage() : await this.context.newPage();
    await this.initModPage(presenterPage, { testInfo });
    await this.initUserPage(touch === 'viewer' ? touchContext : this.context, { testInfo });

    for (const [role, page] of [
      ['presenter', this.modPage],
      ['viewer', this.userPage],
    ] as const) {
      await page.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
      // At 100 % the slide fills the whiteboard: a camera still being calibrated does not.
      await expect
        .poll(
          async () => {
            const slide = await page.page.locator('#whiteboard-element .tl-image').first().boundingBox();
            const whiteboard = await page.page.locator(e.whiteboard).boundingBox();
            if (!slide || !whiteboard) return Infinity;
            return Math.max(Math.abs(slide.width - whiteboard.width), Math.abs(slide.height - whiteboard.height));
          },
          { message: `${role}: the slide should fill the whiteboard at 100%`, timeout: ELEMENT_WAIT_LONGER_TIME },
        )
        .toBeLessThan(3);
    }
    await expect(this.modPage.page.locator(e.resetZoomButton)).toContainText('100%');
    this.presenterZoom100 = (await waitForSettledCamera(this.modPage.page, 'presenter camera settles at 100%')).z;
    this.viewerZoom100 = (await waitForSettledCamera(this.userPage.page, 'viewer camera settles at 100%')).z;

    this.touchPage = touch === 'presenter' ? this.modPage.page : this.userPage.page;
    this.cdp = await touchContext.newCDPSession(this.touchPage);
    const box = await this.touchPage.locator(e.whiteboard).boundingBox();
    if (!box) throw new Error('whiteboard bounding box not available');
    // Left of the middle, clear of the whiteboard toolbar on the right.
    this.center = { x: box.x + box.width / 2 - 60, y: box.y + box.height / 2 };
  }

  private presenterPercent(camera: TldrawCamera) {
    return (camera.z / this.presenterZoom100) * 100;
  }

  private viewerPercent(camera: TldrawCamera) {
    return (camera.z / this.viewerZoom100) * 100;
  }

  private async pinch(fromDistance: number, toDistance: number, options?: PinchOptions) {
    await touchPinch(this.touchPage, this.cdp, this.center, fromDistance, toDistance, options);
  }

  private async toolbarZoomText(): Promise<string> {
    return this.modPage.page.evaluate(() => {
      const button = document.querySelector('[data-test="resetZoomButton"]') as HTMLElement | null;
      return button?.innerText.trim() ?? '';
    });
  }

  // Waits for the presenter camera to settle and for the viewer to show the same part of the
  // slide: same zoom percentage, same page offset.
  private async expectViewerOnPresenterView(label: string): Promise<TldrawCamera> {
    const presenter = await waitForSettledCamera(this.modPage.page, `${label}: presenter camera settles`);
    const presenterPercent = this.presenterPercent(presenter);
    await expect
      .poll(
        async () => {
          const viewer = await readCamera(this.userPage.page);
          return { percent: this.viewerPercent(viewer), x: viewer.x, y: viewer.y };
        },
        { message: `${label}: the viewer should show the presenter's view`, timeout: ELEMENT_WAIT_LONGER_TIME },
      )
      .toMatchObject({
        percent: expect.closeTo(presenterPercent, 0),
        x: expect.closeTo(presenter.x, 0),
        y: expect.closeTo(presenter.y, 0),
      });
    await expect
      .poll(() => this.toolbarZoomText(), { message: `${label}: the zoom toolbar should show the camera zoom` })
      .toBe(`${Math.round(presenterPercent)}%`);
    return presenter;
  }

  // The pencil is selected, so the first finger of a two-finger gesture starts a stroke that
  // the second finger has to drop. A stroke that reached the server would come back a moment later.
  private async expectNoStrokeLeftByTheFingers() {
    await this.modPage.page.waitForTimeout(1500);
    for (const [role, page] of [
      ['presenter', this.modPage.page],
      ['viewer', this.userPage.page],
    ] as const) {
      await expect(page.locator(e.wbDraw), `${role}: the fingers should leave no stroke`).toHaveCount(0);
    }
  }

  async pinchStaysWithinZoomRange() {
    await test.step('pinching in at 100% keeps everyone at 100%', async () => {
      await this.pinch(400, 150);
      const presenter = await this.expectViewerOnPresenterView('pinch in at 100%');
      expect(this.presenterPercent(presenter), 'presenter zoom should stay at 100%').toBeCloseTo(100, 0);
      expect(presenter.x, 'presenter should still show the whole slide (x)').toBeCloseTo(0, 0);
      expect(presenter.y, 'presenter should still show the whole slide (y)').toBeCloseTo(0, 0);
    });

    await test.step('a quick pinch out reaches the viewer', async () => {
      await this.pinch(150, 450);
      const presenter = await this.expectViewerOnPresenterView('quick pinch out');
      expect(this.presenterPercent(presenter), 'presenter should have zoomed in').toBeGreaterThan(200);
    });

    await test.step('pinching past 400% stops at 400%', async () => {
      await this.pinch(100, 500);
      const presenter = await this.expectViewerOnPresenterView('pinch past 400%');
      expect(this.presenterPercent(presenter), 'presenter zoom should stop at 400%').toBeCloseTo(400, 0);
      await expect(this.modPage.page.locator(e.zoomInButton), 'zoom in should be disabled at 400%').toBeDisabled();
    });

    await this.expectNoStrokeLeftByTheFingers();
  }

  async slowPinchReachesViewer() {
    const pageUnderFingers = () =>
      withEditor(this.modPage.page, (editor) =>
        editor.evaluate((value, point) => value.screenToPage(point), this.center),
      );
    const before = await pageUnderFingers();
    await this.pinch(150, 450, SLOW_PINCH);
    const presenter = await this.expectViewerOnPresenterView('slow pinch out');
    expect(this.presenterPercent(presenter), 'presenter should have zoomed in').toBeGreaterThan(200);
    const after = await pageUnderFingers();
    const driftInPixels = Math.hypot(after.x - before.x, after.y - before.y) * presenter.z;
    expect(driftInPixels, 'the slide point between the fingers should stay between them').toBeLessThan(3);
    await this.expectNoStrokeLeftByTheFingers();
  }

  async pinchZoomsInOneDirection() {
    await Promise.all([startZoomSampler(this.modPage.page), startZoomSampler(this.userPage.page)]);
    await this.pinch(150, 450, SLOW_PINCH);
    const presenter = await this.expectViewerOnPresenterView('slow pinch out');
    const [presenterSamples, viewerSamples] = await Promise.all([
      stopZoomSampler(this.modPage.page),
      stopZoomSampler(this.userPage.page),
    ]);
    expect(this.presenterPercent(presenter), 'presenter should have zoomed in').toBeGreaterThan(200);
    expect(
      largestZoomReversal(presenterSamples, 1),
      'presenter zoom should only grow while the fingers spread apart',
    ).toBeLessThan(MAX_ZOOM_REVERSAL);
    expect(largestZoomReversal(viewerSamples, 1), 'viewer zoom should only grow while it follows').toBeLessThan(
      MAX_ZOOM_REVERSAL,
    );
  }

  async twoFingerPanReachesViewer() {
    for (const percent of ['125%', '150%', '175%', '200%']) {
      await this.modPage.waitAndClick(e.zoomInButton);
      await expect(this.modPage.page.locator(e.resetZoomButton)).toContainText(percent);
    }
    const zoomed = await this.expectViewerOnPresenterView('toolbar zoom to 200%');
    await this.pinch(200, 200, { steps: 20, drift: { x: 0, y: -120 } });
    const panned = await this.expectViewerOnPresenterView('two-finger pan');
    expect(panned.z / zoomed.z, 'a two-finger pan should keep the zoom').toBeCloseTo(1, 2);
    expect(panned.x, 'a vertical pan should keep x').toBeCloseTo(zoomed.x, 0);
    // The first few pixels only tell a pan from a tap.
    const fullPan = 120 / zoomed.z;
    expect(zoomed.y - panned.y, 'the slide should follow the fingers up').toBeGreaterThan(0.75 * fullPan);
    expect(zoomed.y - panned.y, 'the slide should not move further than the fingers').toBeLessThan(1.05 * fullPan);
  }

  async viewerTouchGestures() {
    await test.step('a viewer pinch moves no camera', async () => {
      const [presenterBefore, viewerBefore] = await Promise.all([
        readCamera(this.modPage.page),
        readCamera(this.userPage.page),
      ]);
      await this.pinch(150, 450);
      await this.userPage.page.waitForTimeout(2000);
      const [presenterAfter, viewerAfter] = await Promise.all([
        readCamera(this.modPage.page),
        readCamera(this.userPage.page),
      ]);
      expect(viewerAfter, 'viewer camera should not move').toMatchObject({
        x: expect.closeTo(viewerBefore.x, 1),
        y: expect.closeTo(viewerBefore.y, 1),
        z: expect.closeTo(viewerBefore.z, 3),
      });
      expect(presenterAfter, 'presenter camera should not move').toMatchObject({
        x: expect.closeTo(presenterBefore.x, 1),
        y: expect.closeTo(presenterBefore.y, 1),
        z: expect.closeTo(presenterBefore.z, 3),
      });
    });

    await test.step('a two-finger tap undoes the last action of a whiteboard user and keeps the pencil', async () => {
      await this.modPage.waitAndClick(e.multiUsersWhiteboardOn);
      await this.userPage.hasElement(e.wbToolbar, 'should display the whiteboard toolbar for the viewer');
      await this.userPage.waitAndClick(e.wbArrowShape);
      await dragAcrossWhiteboard(this.userPage, 0.3, 0.4);
      await this.modPage.hasElement(e.wbDrawnArrow, 'should display the arrow drawn by the viewer');
      const arrowWidth = async (page: PlaywrightPage) =>
        (
          await page
            .locator(e.wbDrawnArrow)
            .first()
            .boundingBox({ timeout: 1000 })
            .catch(() => null)
        )?.width ?? 0;
      const drawnWidth = await arrowWidth(this.modPage.page);
      expect(drawnWidth, 'the arrow should span the drag').toBeGreaterThan(100);
      await this.userPage.waitAndClick(e.wbPencilShape);
      await twoFingerTap(this.touchPage, this.cdp, this.center);
      // Undo takes the arrow back to where it was created (or removes it), not the
      // stroke the first finger started.
      for (const [role, page] of [
        ['viewer', this.userPage.page],
        ['presenter', this.modPage.page],
      ] as const) {
        await expect
          .poll(() => arrowWidth(page), {
            message: `${role}: the two-finger tap should undo the arrow`,
            timeout: ELEMENT_WAIT_LONGER_TIME,
          })
          .toBeLessThan(drawnWidth / 4);
      }
      const tool = await withEditor(this.userPage.page, (editor) =>
        editor.evaluate((value) => value.getCurrentToolId()),
      );
      expect(tool, 'the pencil should stay selected').toBe('draw');
    });
  }
}
