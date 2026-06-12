import * as fs from 'fs';
import * as path from 'path';

import { expect, type Page } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { DrawShape } from './drawShape';

// Read the zoom percentage text from the toolbar's resetZoomButton (e.g. "150%").
// customIcon renders the stateZoomPct string directly as text inside the button;
// innerText excludes the visually-hidden ButtonLabel (font-size:0), so we get
// only the percentage string.
async function getToolbarZoomText(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const btn = document.querySelector('[data-test="resetZoomButton"]') as HTMLElement | null;
    return btn ? (btn.innerText?.trim() ?? null) : null;
  });
}

// Read camera.z from the tldraw shapes layer inline style transform.
// tldraw applies the transform imperatively via:
//   el.style.setProperty("transform", `scale(${z}) translate(${x}px, ${y}px)`)
// on the element with classes .tl-html-layer and .tl-shapes.
// Note: the [data-testid="layer"] attribute does NOT exist in this tldraw build.
async function getCameraZoom(page: Page): Promise<number | null> {
  return page.evaluate(() => {
    const layer = document.querySelector('.tl-html-layer.tl-shapes') as HTMLElement | null;
    if (!layer) return null;
    const t = layer.style.transform;
    if (t && t !== 'none') {
      const m = t.match(/scale\(([^)]+)\)/);
      if (m) return parseFloat(m[1]);
    }
    // Fallback: use computed style (normalized to matrix form by the browser)
    const computed = getComputedStyle(layer).transform;
    if (!computed || computed === 'none') return null;
    return new DOMMatrix(computed).m11; // m11 = scaleX = camera.z
  });
}

// Read #presentationInnerWrapper offsetWidth — this equals svgWidth (the slide's
// pixel width in screen space) which is set inline by the presentation component.
async function getWrapperWidth(page: Page): Promise<number> {
  return page.evaluate(() => {
    const el = document.getElementById('presentationInnerWrapper');
    return el ? el.offsetWidth : 0;
  });
}

export class WhiteboardResize extends DrawShape {
  // Reproduces GitHub issue #24949: after a resize of the presentation area the
  // whiteboard camera is not re-synced, making the slide appear displaced.
  //
  // Core invariant (when the camera is correct):
  //   camera.z = svgWidth / scaledWidth
  //   → camera.z / svgWidth = 1 / scaledWidth  (constant regardless of container size)
  //
  // This ratio must be preserved after any viewport resize.  When the bug is present:
  //   • camera.z stays at the pre-resize value (stale)
  //   • svgWidth updates to the new value
  //   → the ratio changes noticeably (> 5 %)
  async cameraResync() {
    // ── 1. Wait for the whiteboard and slide image to be ready ──────────────────
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);
    await this.modPage.waitForSelector(e.resetZoomButton);

    const modSlideImg = this.modPage.page.locator('#whiteboard-element .tl-image').first();
    const userSlideImg = this.userPage.page.locator('#whiteboard-element .tl-image').first();

    await modSlideImg.waitFor({ state: 'visible', timeout: ELEMENT_WAIT_LONGER_TIME });
    await userSlideImg.waitFor({ state: 'visible', timeout: ELEMENT_WAIT_LONGER_TIME });

    // Let the camera-mount polling chain settle on both pages.
    await this.modPage.page.waitForTimeout(5000);

    // ── 2. Record pre-resize state on both pages ───────────────────────────────
    const modInitialZoom = await getCameraZoom(this.modPage.page);
    const modInitialWidth = await getWrapperWidth(this.modPage.page);
    const userInitialZoom = await getCameraZoom(this.userPage.page);
    const userInitialWidth = await getWrapperWidth(this.userPage.page);

    expect(modInitialZoom, '[mod] camera zoom should be positive after mount').toBeGreaterThan(0);
    expect(modInitialWidth, '[mod] slide wrapper width should be positive after mount').toBeGreaterThan(0);
    expect(userInitialZoom, '[viewer] camera zoom should be positive after mount').toBeGreaterThan(0);
    expect(userInitialWidth, '[viewer] slide wrapper width should be positive after mount').toBeGreaterThan(0);

    // Pre-resize visual fill check — slide should fill the wrapper on both pages.
    const modInnerWrapper = this.modPage.page.locator('#presentationInnerWrapper');
    const userInnerWrapper = this.userPage.page.locator('#presentationInnerWrapper');

    const modInitialWrapperBounds = await modInnerWrapper.boundingBox();
    const modInitialSlideBounds = await modSlideImg.boundingBox();
    const userInitialWrapperBounds = await userInnerWrapper.boundingBox();
    const userInitialSlideBounds = await userSlideImg.boundingBox();

    expect(modInitialWrapperBounds, '[mod] wrapper bounding box should be non-null').not.toBeNull();
    expect(modInitialSlideBounds, '[mod] slide image bounding box should be non-null').not.toBeNull();
    expect(userInitialWrapperBounds, '[viewer] wrapper bounding box should be non-null').not.toBeNull();
    expect(userInitialSlideBounds, '[viewer] slide image bounding box should be non-null').not.toBeNull();

    const modInitialFill = modInitialSlideBounds!.width / modInitialWrapperBounds!.width;
    expect(modInitialFill, '[mod] slide should fill wrapper before resize').toBeGreaterThan(0.8);
    expect(modInitialFill, '[mod] slide should not overflow wrapper before resize').toBeLessThan(1.2);

    const userInitialFill = userInitialSlideBounds!.width / userInitialWrapperBounds!.width;
    expect(userInitialFill, '[viewer] slide should fill wrapper before resize').toBeGreaterThan(0.8);
    expect(userInitialFill, '[viewer] slide should not overflow wrapper before resize').toBeLessThan(1.2);

    // ── 3. Shrink the moderator viewport (≈ 40 % height) — trigger only ─────────
    // setViewportSize targets only this page object — the viewer's page is untouched.
    const viewport = this.modPage.page.viewportSize()!;
    await this.modPage.page.setViewportSize({
      width: viewport.width,
      height: Math.round(viewport.height * 0.6),
    });

    // Wait for the layout to settle after shrink (no assertions here — shrink is just the trigger).
    await this.modPage.page.waitForTimeout(5000);

    // ── 4. Expand back to original size ───────────────────────────────────────
    await this.modPage.page.setViewportSize({ width: viewport.width, height: viewport.height });

    // Allow time for: React re-render → RAF → pollUntilMounted → 35 stable frames
    // → syncCameraWithPresentationArea to complete after the expansion.
    await this.modPage.page.waitForTimeout(5000);

    // ── 5. Verify moderator camera re-synced after expanding back ─────────────
    const modAfterZoom = await getCameraZoom(this.modPage.page);
    const modAfterWidth = await getWrapperWidth(this.modPage.page);

    expect(modAfterZoom, '[mod] camera zoom should be positive after expanding back').toBeGreaterThan(0);
    expect(modAfterWidth, '[mod] slide wrapper width should be positive after expanding back').toBeGreaterThan(0);

    // Wrapper must return to approximately its original width after expanding back.
    // Allow ±2 px for browser layout rounding after viewport resize/restore.
    expect(
      Math.abs(modAfterWidth - modInitialWidth),
      '[mod] slide wrapper width should return close to original after expanding back (within 2px)',
    ).toBeLessThanOrEqual(2);

    // Invariant: camera.z / svgWidth = 1/scaledWidth (constant regardless of container size).
    // Bug present  → modAfterZoom stays stale → ratio shifts
    // Bug fixed    → modAfterZoom updates to match the restored layout → ratio preserved within 5 %
    const modInitialRatio = modInitialZoom! / modInitialWidth;
    const modAfterRatio = modAfterZoom! / modAfterWidth;
    const modDeviation = Math.abs(modAfterRatio - modInitialRatio) / modInitialRatio;

    expect(
      modDeviation,
      `[mod] camera zoom/wrapper-width ratio should be restored after expanding back `
      + `(deviation: ${(modDeviation * 100).toFixed(1)} %, expected < 5 %)`,
    ).toBeLessThan(0.05);

    const modAfterWrapperBounds = await modInnerWrapper.boundingBox();
    const modAfterSlideBounds = await modSlideImg.boundingBox();
    if (modAfterWrapperBounds && modAfterSlideBounds) {
      const modAfterFill = modAfterSlideBounds.width / modAfterWrapperBounds.width;
      expect(modAfterFill, '[mod] slide should fill wrapper after expanding back').toBeGreaterThan(0.8);
      expect(modAfterFill, '[mod] slide should not overflow wrapper after expanding back').toBeLessThan(1.2);
    }

    // ── 6. Verify viewer page was NOT affected throughout ─────────────────────
    const userAfterZoom = await getCameraZoom(this.userPage.page);
    const userAfterWidth = await getWrapperWidth(this.userPage.page);

    expect(userAfterZoom, '[viewer] camera zoom should be unchanged').toBeGreaterThan(0);
    expect(userAfterWidth, '[viewer] slide wrapper width should be unchanged').toBeGreaterThan(0);

    // Viewer page was never resized — their wrapper width must be identical to initial.
    expect(
      userAfterWidth,
      '[viewer] slide wrapper width should not change (viewer page was not resized)',
    ).toBe(userInitialWidth);

    const userInitialRatio = userInitialZoom! / userInitialWidth;
    const userAfterRatio = userAfterZoom! / userAfterWidth;
    const userDeviation = Math.abs(userAfterRatio - userInitialRatio) / userInitialRatio;

    expect(
      userDeviation,
      `[viewer] camera zoom/wrapper-width ratio should remain stable (deviation: ${(userDeviation * 100).toFixed(1)} %)`,
    ).toBeLessThan(0.05);

    const userAfterWrapperBounds = await userInnerWrapper.boundingBox();
    const userAfterSlideBounds = await userSlideImg.boundingBox();
    if (userAfterWrapperBounds && userAfterSlideBounds) {
      const userAfterFill = userAfterSlideBounds.width / userAfterWrapperBounds.width;
      expect(userAfterFill, '[viewer] slide should still fill wrapper').toBeGreaterThan(0.8);
      expect(userAfterFill, '[viewer] slide should not overflow wrapper').toBeLessThan(1.2);
    }
  }

  async cameraResyncZoomedVisual() {
    // ── 1. Wait for the whiteboard and slide image to be ready ──────────────────
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);
    await this.modPage.waitForSelector(e.resetZoomButton);

    const modSlideImg = this.modPage.page.locator('#whiteboard-element .tl-image').first();
    const userSlideImg = this.userPage.page.locator('#whiteboard-element .tl-image').first();

    await modSlideImg.waitFor({ state: 'visible', timeout: ELEMENT_WAIT_LONGER_TIME });
    await userSlideImg.waitFor({ state: 'visible', timeout: ELEMENT_WAIT_LONGER_TIME });

    await this.modPage.page.waitForTimeout(5000);

    // ── 2. Zoom in 2× via direct tldraw editor access (no server round-trip) ────
    // Ctrl++ goes through zoomChanger → server → syncCamera, making the final
    // camera state timing-dependent and non-deterministic across runs.
    // Instead, access the editor via React fiber and call setCamera directly.
    // This sets storedZoomRatio > 1 via the store listener without a server call.
    const zoomed = await this.modPage.page.evaluate(() => {
      const whiteboard = document.getElementById('whiteboard-element');
      if (!whiteboard) return false;
      const fiberKey = Object.keys(whiteboard as unknown as Record<string, unknown>)
        .find((k) => k.startsWith('__reactFiber'));
      if (!fiberKey) return false;

      // Walk up the React fiber tree from #whiteboard-element to find tlEditorRef.
      // useRef stores its value as hook.memoizedState = { current: value }.
      let fiber = (whiteboard as unknown as Record<string, unknown>)[fiberKey] as { memoizedState: unknown; return: unknown } | null;
      while (fiber) {
        let hook = fiber.memoizedState as { memoizedState: unknown; next: unknown } | null;
        while (hook) {
          const ms = hook.memoizedState as { current?: { setCamera?: unknown; getCamera?: unknown; getViewportScreenBounds?: unknown } } | null;
          if (ms && ms.current && typeof ms.current.setCamera === 'function') {
            const editor = ms.current as {
              setCamera: (cam: { x: number; y: number; z: number }, opts?: { immediate?: boolean }) => void;
              getCamera: () => { x: number; y: number; z: number };
              getViewportScreenBounds: () => { w: number; h: number };
            };
            const cam = editor.getCamera();
            const vb = editor.getViewportScreenBounds();
            const newZ = cam.z * 2;
            // Zoom toward viewport center (keeps the same page point centred).
            editor.setCamera({
              x: cam.x + (vb.w / 2) * (1 / newZ - 1 / cam.z),
              y: cam.y + (vb.h / 2) * (1 / newZ - 1 / cam.z),
              z: newZ,
            }, { immediate: true });
            return true;
          }
          hook = hook.next as typeof hook;
        }
        fiber = fiber.return as typeof fiber;
      }
      return false;
    });

    expect(zoomed, 'tldraw editor must be accessible via React fiber for direct camera zoom').toBe(true);

    // Let the zoomed camera settle and broadcast to the viewer.
    await this.modPage.page.waitForTimeout(3000);

    // ── 3. Screenshot A — write this run's zoomed state as the baseline ──────────
    // Each BBB meeting produces a slightly different settled camera.y (different vh
    // from getViewportScreenBounds() across meetings). Rather than comparing against
    // a stale cross-run baseline, we write Screenshot A to disk here so that
    // Screenshot C (after the expand) is always compared against Screenshot A from
    // the SAME run. This tests "zoom is restored after resize" without relying on
    // an absolute pixel-perfect position across meetings.
    const snapshotDir = path.join(__dirname, 'whiteboard.spec.ts-snapshots');
    fs.mkdirSync(snapshotDir, { recursive: true });

    const modInitialPath = path.join(snapshotDir, 'mod-whiteboard-resize-zoomed-initial-Chromium-linux.png');
    const userInitialPath = path.join(snapshotDir, 'user-whiteboard-resize-zoomed-initial-Chromium-linux.png');

    fs.writeFileSync(modInitialPath, await this.modPage.page.screenshot());
    fs.writeFileSync(userInitialPath, await this.userPage.page.screenshot());

    // ── 4. Shrink moderator viewport (≈ 40 % height) ──────────────────────────
    const viewport = this.modPage.page.viewportSize()!;
    await this.modPage.page.setViewportSize({
      width: viewport.width,
      height: Math.round(viewport.height * 0.6),
    });

    await this.modPage.page.waitForTimeout(5000);

    // ── 5. Expand back to original size ───────────────────────────────────────
    await this.modPage.page.setViewportSize({ width: viewport.width, height: viewport.height });

    await this.modPage.page.waitForTimeout(5000);

    // ── 7. Screenshot C — must match Screenshot A (same run) ─────────────────
    // Playwright reads the baseline we wrote in step 3. A mismatch means the
    // camera was NOT restored to the zoomed position after the expand (the bug).
    await expect(this.modPage.page).toHaveScreenshot('mod-whiteboard-resize-zoomed-initial.png', { maxDiffPixels: 1000 });
    await expect(this.userPage.page).toHaveScreenshot('user-whiteboard-resize-zoomed-initial.png', { maxDiffPixels: 1000 });
  }

  async cameraResyncAfterMinimizeRestore() {
    // ── 1. Wait for the whiteboard and slide image to be ready ───────────────────
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);
    await this.modPage.waitForSelector(e.resetZoomButton);

    const modSlideImg = this.modPage.page.locator('#whiteboard-element .tl-image').first();

    await modSlideImg.waitFor({ state: 'visible', timeout: ELEMENT_WAIT_LONGER_TIME });

    // Let the camera-mount polling chain settle.
    await this.modPage.page.waitForTimeout(5000);

    // ── 2. Record fit-zoom baseline ──────────────────────────────────────────────
    const fitZoom = await getCameraZoom(this.modPage.page);
    expect(fitZoom, '[mod] camera zoom should be positive after mount').toBeGreaterThan(0);

    // ── 3. Zoom in via toolbar (2 clicks of +25% each = 150%) ────────────────────
    // Using the real toolbar path exercises the full flow:
    //   zoomChanger → Presentation.zoom state → whiteboard effect →
    //   syncCameraOnPresenterZoom → editor.setCamera (api source) →
    //   pageActualZoomRatioRef cache updated.
    // This lets us verify both camera AND toolbar % are preserved after restore.
    await this.modPage.waitAndClick(e.zoomInButton);
    // Wait longer than the zoomChanger debounce (200 ms) so the first click's
    // setState commits before the second click reads stateZoomValue; otherwise
    // both clicks see stateZoomValue=100 and only one +25% step is applied.
    await this.modPage.page.waitForTimeout(600);
    await this.modPage.waitAndClick(e.zoomInButton);

    // Wait for: zoomChanger debounce (200 ms) + syncCameraOnPresenterZoom + store settle.
    await this.modPage.page.waitForTimeout(3000);

    // ── 4. Record pre-minimize state ─────────────────────────────────────────────
    const toolbarZoomBefore = await getToolbarZoomText(this.modPage.page);
    const zoomBeforeMinimize = await getCameraZoom(this.modPage.page);

    expect(zoomBeforeMinimize, '[mod] camera zoom must be readable after toolbar zoom').not.toBeNull();
    expect(toolbarZoomBefore, '[mod] toolbar zoom text must be readable').not.toBeNull();

    const zoomRatio = zoomBeforeMinimize! / fitZoom!;
    expect(
      zoomRatio,
      `[mod] 2 toolbar clicks should have produced ≥ 1.4× zoom (got ${zoomRatio.toFixed(2)}×)`,
    ).toBeGreaterThan(1.4);

    // ── 5. Minimize then restore presentation ────────────────────────────────────
    await this.modPage.waitAndClick(e.minimizePresentation);
    // Wait for the whiteboard to unmount (presentation container leaves the DOM).
    await this.modPage.page.locator(e.presentationContainer)
      .waitFor({ state: 'detached', timeout: 10000 })
      .catch(() => {});
    await this.modPage.page.waitForTimeout(2000);

    await this.modPage.waitAndClick(e.restorePresentation);
    // Wait for the whiteboard to remount and for the camera polling to settle.
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.page.waitForTimeout(5000);

    // ── 6. Verify camera zoom is preserved after restore ─────────────────────────
    // Bug present → camera returns to fit zoom (zoomAfter ≈ fitZoom).
    // Bug fixed   → camera is restored from the per-page ratio cache (zoomAfter ≈ zoomBeforeMinimize).
    const zoomAfterRestore = await getCameraZoom(this.modPage.page);
    expect(zoomAfterRestore, '[mod] camera zoom must be readable after restore').not.toBeNull();

    const deviation = Math.abs(zoomAfterRestore! - zoomBeforeMinimize!) / zoomBeforeMinimize!;
    expect(
      deviation,
      `[mod] camera zoom should be preserved after minimize/restore `
      + `(before: ${zoomBeforeMinimize!.toFixed(4)}, after: ${zoomAfterRestore!.toFixed(4)}, `
      + `deviation: ${(deviation * 100).toFixed(1)} %, expected < 5 %)`,
    ).toBeLessThan(0.05);

    // ── 7. Verify toolbar zoom % is preserved after restore ───────────────────────
    // Bug: on remount usePrevious(curPageId) returns undefined → false-positive
    // pageChanged → zoomChanger(100) called from empty pageZoomMap → toolbar resets to 100%.
    // Fix: guard in the zoomValue effect skips the zoomChanger call when prevCurPageId
    // is undefined (first mount), so the Presentation.zoom state (and toolbar) stays intact.
    const toolbarZoomAfter = await getToolbarZoomText(this.modPage.page);
    expect(
      toolbarZoomAfter,
      `[mod] toolbar zoom % should be preserved after minimize/restore `
      + `(before: "${toolbarZoomBefore}", after: "${toolbarZoomAfter}")`,
    ).toBe(toolbarZoomBefore);
  }

  async cameraResyncVisual() {
    // ── 1. Wait for the whiteboard and slide image to be ready ──────────────────
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);
    await this.modPage.waitForSelector(e.resetZoomButton);

    const modSlideImg = this.modPage.page.locator('#whiteboard-element .tl-image').first();
    const userSlideImg = this.userPage.page.locator('#whiteboard-element .tl-image').first();

    await modSlideImg.waitFor({ state: 'visible', timeout: ELEMENT_WAIT_LONGER_TIME });
    await userSlideImg.waitFor({ state: 'visible', timeout: ELEMENT_WAIT_LONGER_TIME });

    // Scope the screenshots to the whiteboard canvas only. This is a camera/slide
    // position regression test, so capturing the full page would couple the
    // assertion to unrelated, non-deterministic UI (audio toolbar state, the
    // auto-mute toast, etc.) that differs between local and CI environments.
    const modWb = this.modPage.page.locator(e.whiteboard);
    const userWb = this.userPage.page.locator(e.whiteboard);

    await this.modPage.page.waitForTimeout(5000);

    // ── 2. Screenshot A — initial state (becomes the reference baseline) ────────
    await expect(modWb).toHaveScreenshot('mod-whiteboard-resize-initial.png', { maxDiffPixels: 1000 });
    await expect(userWb).toHaveScreenshot('user-whiteboard-resize-initial.png', { maxDiffPixels: 1000 });

    // ── 3. Shrink moderator viewport (≈ 40 % height) ──────────────────────────
    const viewport = this.modPage.page.viewportSize()!;
    await this.modPage.page.setViewportSize({
      width: viewport.width,
      height: Math.round(viewport.height * 0.6),
    });

    await this.modPage.page.waitForTimeout(5000);

    // ── 4. Screenshot B — shrunk state (recorded as its own baseline) ──────────
    await expect(modWb).toHaveScreenshot('mod-whiteboard-resize-shrunk.png', { maxDiffPixels: 1000 });
    await expect(userWb).toHaveScreenshot('user-whiteboard-resize-shrunk.png', { maxDiffPixels: 1000 });

    // ── 5. Expand back to original size ───────────────────────────────────────
    await this.modPage.page.setViewportSize({ width: viewport.width, height: viewport.height });

    await this.modPage.page.waitForTimeout(5000);

    // ── 6. Screenshot C — must match the initial baseline (Screenshot A) ───────
    // Using the same snapshot name as Screenshot A forces Playwright to compare
    // the restored state directly against the initial state.
    // If the slide is displaced after expand, pixels will differ and the test fails.
    await expect(modWb).toHaveScreenshot('mod-whiteboard-resize-initial.png', { maxDiffPixels: 1000 });
    await expect(userWb).toHaveScreenshot('user-whiteboard-resize-initial.png', { maxDiffPixels: 1000 });
  }
}
