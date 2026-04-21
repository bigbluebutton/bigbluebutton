import { Page as PlaywrightPage } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';

// Prove that a media surface is decoding live frames from the user's point of view.
export async function expectDecodedFrames(page: PlaywrightPage, videoSelector: string, minGrowth = 5, sampleMs = 2000) {
  const handle = await page.waitForSelector(videoSelector, { state: 'attached' });
  await page.waitForFunction((el) => {
    const v = el as HTMLVideoElement;
    return v.readyState >= 2 && v.videoWidth > 0 && v.videoHeight > 0;
  }, handle);
  const before = await handle.evaluate((el) => (el as HTMLVideoElement).getVideoPlaybackQuality().totalVideoFrames);
  await page.waitForTimeout(sampleMs);
  const after = await handle.evaluate((el) => (el as HTMLVideoElement).getVideoPlaybackQuality().totalVideoFrames);
  if (after - before < minGrowth) {
    throw new Error(`Expected >= ${minGrowth} new decoded frames for ${videoSelector}, got ${after - before}`);
  }
}

// Prove that a UI surface is rendered visibly and interactively from the user's point of view.
export async function expectVisiblyRendered(page: PlaywrightPage, selector: string) {
  const handle = await page.waitForSelector(selector, { state: 'attached' });
  await page.waitForFunction((el) => {
    const e = el as HTMLElement;
    const rect = e.getBoundingClientRect();
    const style = globalThis.getComputedStyle(e);
    if (rect.width <= 0 || rect.height <= 0) return false;
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    if (Number.parseFloat(style.opacity) <= 0.01) return false;
    if (style.pointerEvents === 'none') return false;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const top = document.elementFromPoint(cx, cy);
    return top === e || e.contains(top);
  }, handle);
}

// Hold the current state on screen long enough for the recorded video to capture it.
// Default 4000 ms because half-second transitions are invisible on a reviewer's scrub.
export async function dwellOnBehavior(page: PlaywrightPage, label: string, ms = 4000) {
  await page.evaluate((text) => console.log(`DWELL: ${text}`), label);
  await page.waitForTimeout(ms);
}

// Run a test body N consecutive times for stability-budget enforcement.
// Used when CI cannot naturally rerun a single file; for normal cases, configure CI retries.
export async function stabilityBudget(runs: number, body: () => Promise<void>) {
  for (let i = 0; i < runs; i++) {
    await body();
  }
}

export async function startScreenshare(testPage: Page) {
  await testPage.waitAndClick(e.startScreenSharing);
  await testPage.hasElement(
    e.screenShareVideo,
    'should display the screen share video when start sharing',
    ELEMENT_WAIT_EXTRA_LONG_TIME,
  );
  await testPage.hasElement(e.stopScreenSharing, 'should display the stop screen sharing button when start sharing');
}

// Phase B variant: own share moves to camera dock, so video[id="screenshareVideo"] may not
// appear in the main area for the publisher.  Confirm startup via the stop button instead.
export async function startScreensharePhaseB(testPage: Page) {
  await testPage.waitAndClick(e.startScreenSharing);
  await testPage.hasElement(
    e.stopScreenSharing,
    'should display the stop screen sharing button when start sharing (Phase B)',
    ELEMENT_WAIT_EXTRA_LONG_TIME,
  );
}

// Prove that multiple video surfaces are each decoding live frames simultaneously.
// Fails immediately if fewer than `count` matching elements exist.
// For each element, asserts at least `minGrowth` new decoded frames within `sampleMs`.
export async function expectMultipleDecodedVideos(
  page: PlaywrightPage,
  selector: string,
  count: number,
  minGrowth = 10,
  sampleMs = 2500,
): Promise<void> {
  const actualCount = await page.locator(selector).count();
  if (actualCount < count) {
    throw new Error(
      `expectMultipleDecodedVideos: Expected ${count} video elements matching "${selector}", found ${actualCount}`,
    );
  }

  // Wait for each targeted element to reach a decodable state before sampling
  for (let i = 0; i < count; i++) {
    await page.waitForFunction(
      ([sel, idx]) => {
        const el = document.querySelectorAll(sel as string)[idx as number] as HTMLVideoElement | null;
        return el !== null && el.readyState >= 2 && el.videoWidth > 0 && el.videoHeight > 0;
      },
      [selector, i],
    );
  }

  // Snapshot frame counts before the measurement window
  const before: number[] = [];
  for (let i = 0; i < count; i++) {
    const frames = await page.evaluate(
      ([sel, idx]) => {
        const el = document.querySelectorAll(sel as string)[idx as number] as HTMLVideoElement;
        return el.getVideoPlaybackQuality().totalVideoFrames;
      },
      [selector, i],
    );
    before.push(frames as number);
  }

  await page.waitForTimeout(sampleMs);

  // Verify each element grew by at least minGrowth frames over the window
  for (let i = 0; i < count; i++) {
    const after = await page.evaluate(
      ([sel, idx]) => {
        const el = document.querySelectorAll(sel as string)[idx as number] as HTMLVideoElement;
        return el.getVideoPlaybackQuality().totalVideoFrames;
      },
      [selector, i],
    );
    const growth = (after as number) - before[i];
    if (growth < minGrowth) {
      const detail = `grew by ${growth} frames, expected >= ${minGrowth}`;
      throw new Error(`expectMultipleDecodedVideos: video[${i}] ${detail} (selector: "${selector}")`);
    }
  }
}

// Prove that at least `minCount` elements matching `selector` are each rendered with a
// bounding box of at least `minBBoxPx` x `minBBoxPx` pixels.  All indices are checked
// independently; the error message lists which passed and which failed.
export async function expectVideosRenderedSideBySide(
  page: PlaywrightPage,
  selector: string,
  minCount: number,
  minBBoxPx = 120,
): Promise<void> {
  const locators = await page.locator(selector).all();

  if (locators.length < minCount) {
    throw new Error(
      `expectVideosRenderedSideBySide: Expected >= ${minCount} elements for "${selector}", found ${locators.length}`,
    );
  }

  const results: string[] = [];
  let anyFailed = false;

  for (let i = 0; i < locators.length; i++) {
    const bbox = await locators[i].boundingBox();
    const w = bbox?.width ?? 0;
    const h = bbox?.height ?? 0;
    if (!bbox || w < minBBoxPx || h < minBBoxPx) {
      results.push(`[${i}] FAIL: ${w.toFixed(0)}x${h.toFixed(0)}px (min ${minBBoxPx}x${minBBoxPx})`);
      anyFailed = true;
    } else {
      results.push(`[${i}] PASS: ${w.toFixed(0)}x${h.toFixed(0)}px`);
    }
  }

  if (anyFailed) {
    const summary = `not all ${locators.length} elements meet minimum ${minBBoxPx}x${minBBoxPx}px`;
    throw new Error(`expectVideosRenderedSideBySide: ${summary}:\n${results.join('\n')}`);
  }
}

// Run `assertion` on every poll tick for `durationMs`.  If the assertion throws on ANY
// tick the error is immediately re-thrown annotated with the tick index and elapsed time.
// This helper enforces that a condition holds *continuously*, not just once.
export async function stabilityWindow(
  page: PlaywrightPage,
  durationMs: number,
  pollIntervalMs: number,
  assertion: () => Promise<void>,
): Promise<void> {
  const start = Date.now();
  let tick = 0;
  while (Date.now() - start < durationMs) {
    try {
      await assertion();
    } catch (err) {
      const elapsed = Date.now() - start;
      const errMsg = err instanceof Error ? err.message : String(err);
      throw new Error(`stabilityWindow: assertion failed at tick ${tick} (${elapsed}ms elapsed): ${errMsg}`);
    }
    tick++;
    if (Date.now() - start < durationMs) {
      await page.waitForTimeout(pollIntervalMs);
    }
  }
}
