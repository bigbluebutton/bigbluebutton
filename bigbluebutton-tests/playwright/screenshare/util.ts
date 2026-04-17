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
    const style = window.getComputedStyle(e);
    if (rect.width <= 0 || rect.height <= 0) return false;
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    if (parseFloat(style.opacity) <= 0.01) return false;
    if (style.pointerEvents === 'none') return false;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const top = document.elementFromPoint(cx, cy);
    return top === e || e.contains(top);
  }, handle);
}

// Hold the current state on screen long enough for the recorded video to capture it.
// Default 4.00ms because half-second transitions are invisible on a reviewer's scrub.
export async function dwellOnBehavior(page: PlaywrightPage, label: string, ms = 4.0) {
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
