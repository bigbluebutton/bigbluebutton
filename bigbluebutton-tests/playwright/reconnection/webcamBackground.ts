import { expect } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';
import { severConnection } from './util';

// How the "is the virtual background still applied?" detector works.
//
// A virtual background is a canvas.captureStream() composite: the uploaded/preset
// background image fills the frame corners and the (moving) camera feed sits in the
// center. With the fake camera (a looping video.y4m), the four CORNER patches are
// therefore static while VB is applied, and become a moving video the instant the
// stream falls back to the raw camera. We sample each corner across several frames
// and compute the temporal variance: ~0 == still shows the static background image;
// a large value == raw feed. Calibrated on this suite's fake camera: VB corners
// score < 1, raw corners score > 50 (both locally and on a viewer's received tile).
// No pixel baselines are checked in - webcam.spec.ts already documents how flaky
// cross-machine screenshot baselines are.
const VB_CORNER_VARIANCE_MAX = 3;

// Liveness guards that close the false-green holes in the corner-variance test.
// Corner variance alone only proves the corners are STATIC (~0) - but two dead tiles
// are also static and would slip through as a fake pass:
//   1. a black/dead tile (camera peer never republished): static corners, dark center;
//   2. a FROZEN last frame of a live VB composite: static corners AND a bright center.
// Case 1 is caught by a center-brightness floor (a black tile scores ~0). Case 2 is
// NOT separable by pixel content in this harness: with the fake camera + a preset
// background, the person occupies only a sub-region, so the center patch samples the
// STATIC background image and reads ~0 motion even on a genuinely live composite
// (measured: per-pixel center motion 0, mean-brightness variance 0.06). What actually
// separates live from frozen is frame PRODUCTION: a live tile keeps decoding/rendering
// new frames while a frozen one does not advance. So we pair a center-brightness floor
// (not black) with a decoded-frame-advance floor (not frozen). A raw feed, in turn, is
// caught by the corner-variance check. Only a live VB composite clears all three.
const VB_CENTER_BRIGHTNESS_MIN = 30;
// Minimum new frames a live tile must present across the ~540 ms sampling window. A
// frozen/dead tile advances by 0; a live one decodes ~11-13 (measured). Kept at 1
// (deliberately low, huge margin) so a sluggish-but-live encoder still clears it.
const VB_MIN_FRAME_ADVANCE = 1;

async function cornerVariance(page: Page['page'], selector: string, frames = 10): Promise<number | null> {
  return page.evaluate(
    async ({ selector, frames }) => {
      const video = document.querySelector(selector) as HTMLVideoElement | null;
      if (!video || !video.srcObject) return null;
      const W = 200;
      const H = 150;
      const P = 24;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      const corners = [
        [4, 4],
        [W - P - 4, 4],
        [4, H - P - 4],
        [W - P - 4, H - P - 4],
      ];
      const series: number[][] = [[], [], [], []];
      for (let f = 0; f < frames; f += 1) {
        try {
          ctx.drawImage(video, 0, 0, W, H);
        } catch {
          return -1; // frame not drawable yet
        }
        corners.forEach(([x, y], i) => {
          const { data } = ctx.getImageData(x, y, P, P);
          let sum = 0;
          for (let k = 0; k < data.length; k += 4) sum += data[k] + data[k + 1] + data[k + 2];
          series[i].push(sum / (data.length / 4));
        });
        await new Promise((r) => {
          setTimeout(r, 90);
        });
      }
      const varianceOf = (arr: number[]) => {
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        return arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length;
      };
      return (varianceOf(series[0]) + varianceOf(series[1]) + varianceOf(series[2]) + varianceOf(series[3])) / 4;
    },
    { selector, frames },
  );
}

// Center-patch stats of the tile over the sampling window: mean brightness (0-255) of
// the center patch, and frameDelta = the number of new decoded/rendered frames the
// video element produced across the window (via getVideoPlaybackQuality, with a
// webkitDecodedFrameCount fallback). Pairs with cornerVariance to fully characterize
// the tile - corners static (background present) + center bright (not black) + frames
// advancing (not frozen) == genuine live VB composite. Frame production, not pixel
// motion, is what distinguishes live from frozen here (see the constants above).
// Returns brightness -1 / frameDelta -1 when the frame is not drawable yet, so both
// floors fail on a dead tile.
async function centerStats(
  page: Page['page'],
  selector: string,
  frames = 6,
): Promise<{ brightness: number; frameDelta: number } | null> {
  return page.evaluate(
    async ({ selector, frames }) => {
      const video = document.querySelector(selector) as HTMLVideoElement | null;
      if (!video || !video.srcObject) return null;
      const W = 200;
      const H = 150;
      const P = 60;
      const cx = Math.round((W - P) / 2);
      const cy = Math.round((H - P) / 2);
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      const decodedFrames = () =>
        typeof video.getVideoPlaybackQuality === 'function'
          ? video.getVideoPlaybackQuality().totalVideoFrames
          : // @ts-ignore non-standard fallback
            (video.webkitDecodedFrameCount ?? 0);
      const framesAtStart = decodedFrames();
      const brightnessSamples: number[] = [];
      for (let f = 0; f < frames; f += 1) {
        try {
          ctx.drawImage(video, 0, 0, W, H);
        } catch {
          return { brightness: -1, frameDelta: -1 }; // frame not drawable yet
        }
        const { data } = ctx.getImageData(cx, cy, P, P);
        let sum = 0;
        for (let k = 0; k < data.length; k += 4) sum += (data[k] + data[k + 1] + data[k + 2]) / 3;
        brightnessSamples.push(sum / (data.length / 4));
        await new Promise((r) => {
          setTimeout(r, 90);
        });
      }
      const brightness = brightnessSamples.reduce((a, b) => a + b, 0) / brightnessSamples.length;
      // New frames presented across the sampling window: a live stream keeps decoding/
      // rendering (even with static picture content), a frozen tile does not advance.
      const frameDelta = decodedFrames() - framesAtStart;
      return { brightness, frameDelta };
    },
    { selector, frames },
  );
}

// Poll one perspective until the background-applied state is observed, or a deadline
// expires. publish-then-swap (component.tsx: republish raw, swap the effect in when the
// model is ready) makes a drawable-but-raw tile a legitimate TRANSIENT state, not a
// terminal one. Breaking on the first raw (high-variance) sample would be a false red
// if a sample lands in that window (cold WASM cache, slow box, model re-fetch). Instead
// we keep sampling until the tile is a live composite with the background applied -
// drawable AND frames advancing AND corners static - and return that variance as soon
// as we see it (fast green). If the deadline passes the tile never settled into the
// applied state, so we return the last corner variance (stays raw -> the caller reds).
async function pollUntilBackgroundApplied(
  page: Page['page'],
  selector: string,
  deadlineMs = 60000,
): Promise<number> {
  let last = -1;
  const start = Date.now();
  while (Date.now() - start < deadlineMs) {
    const cv = await cornerVariance(page, selector);
    // cv === -1: element exists but is not drawable yet; null: element not present.
    if (cv !== null && cv >= 0) {
      last = cv;
      if (cv < VB_CORNER_VARIANCE_MAX) {
        const stats = await centerStats(page, selector);
        if (stats != null && stats.frameDelta >= VB_MIN_FRAME_ADVANCE) return cv;
      }
    }
    await page.waitForTimeout(2000);
  }
  return last;
}

export class WebcamBackground extends MultiUsers {
  // Apply the default "Home" background through the preview and share the camera.
  // Mirrors webcam/webcam.ts applyBackground() UI steps (without its screenshot
  // assertion, which we deliberately do not use here).
  async shareWithHomeBackground() {
    await this.modPage.waitAndClick(e.joinVideo);
    await this.modPage.waitAndClick(e.backgroundSettingsTitle);
    await this.modPage.waitForSelector(e.noneBackgroundButton);
    await this.modPage.waitAndClick(`${e.selectDefaultBackground}[aria-label="Home"]`);
    await this.modPage.page.waitForTimeout(1000);
    await this.modPage.waitAndClick(e.startSharingWebcam);
    await this.modPage.waitForSelector(e.currentUserLocalStreamVideo, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.modPage.page.waitForTimeout(3000);
    await this.userPage.waitForSelector(`${e.webcamVideoItem} video`, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.userPage.page.waitForTimeout(2000);
  }

  // Wait until the sharer's camera peer has been rebuilt after the outage and its
  // self-view is flowing again, then return the local + viewer corner variances. Both
  // perspectives aggregate identically: poll until the background-applied state settles
  // (fast green) or the deadline expires (settled raw -> red). The applied variance is
  // what the caller asserts against; returning the settled value on both sides keeps
  // them consistent.
  private async waitForRepublishAndMeasure(): Promise<{ local: number; viewer: number }> {
    const local = await pollUntilBackgroundApplied(this.modPage.page, e.currentUserLocalStreamVideo);
    const viewer = await pollUntilBackgroundApplied(this.userPage.page, `${e.webcamVideoItem} video`);
    return { local, viewer };
  }

  async backgroundSurvivesReconnection() {
    await this.shareWithHomeBackground();

    // Pre-state: background is applied (corners static) on both perspectives, and the
    // tile is a live composite (bright, moving center), not a black/frozen frame.
    const preLocal = await cornerVariance(this.modPage.page, e.currentUserLocalStreamVideo);
    expect(preLocal, 'precondition: sharer self-view shows the background (static corners)').toBeLessThan(
      VB_CORNER_VARIANCE_MAX,
    );
    const preLocalStats = await centerStats(this.modPage.page, e.currentUserLocalStreamVideo);
    expect(
      preLocalStats?.brightness,
      'precondition: sharer self-view is a live tile (bright center), not black',
    ).toBeGreaterThan(VB_CENTER_BRIGHTNESS_MIN);
    expect(
      preLocalStats?.frameDelta,
      'precondition: sharer self-view is a live tile (frames advancing), not frozen',
    ).toBeGreaterThanOrEqual(VB_MIN_FRAME_ADVANCE);

    // Trigger a full connection loss long enough to tear the camera peer down.
    await severConnection(5);

    const { local, viewer } = await this.waitForRepublishAndMeasure();

    // The sentinel from waitForRepublishAndMeasure: -1 means the tile never became
    // drawable. Fail on it explicitly so it cannot pass the variance check silently
    // (expect(-1).toBeLessThan(VB_CORNER_VARIANCE_MAX) is otherwise true).
    expect(local, 'sharer self-view tile became drawable after reconnection').toBeGreaterThanOrEqual(0);
    expect(viewer, "viewer's received tile became drawable after reconnection").toBeGreaterThanOrEqual(0);

    // Brightness + frame-advance of the reconnected tiles, to reject a black tile
    // (fails brightness) or a frozen last frame (fails frame-advance) that would
    // otherwise pass the (static-corner) variance check as a false green.
    const localStats = await centerStats(this.modPage.page, e.currentUserLocalStreamVideo);
    const viewerStats = await centerStats(this.userPage.page, `${e.webcamVideoItem} video`);

    // After reconnection the background must STILL be applied on both the sharer
    // self-view and the viewer's received tile (the published track keeps the effect).
    // Each tile must clear all guards: static corners (background present) AND a bright
    // center (not black) AND advancing frames (live, not frozen) - only a genuine live
    // VB composite satisfies all.
    expect(local, 'sharer self-view background should survive reconnection (corners still static)').toBeLessThan(
      VB_CORNER_VARIANCE_MAX,
    );
    expect(
      localStats?.brightness,
      'sharer self-view must be a live tile after reconnection (bright center), not black',
    ).toBeGreaterThan(VB_CENTER_BRIGHTNESS_MIN);
    expect(
      localStats?.frameDelta,
      'sharer self-view must be a live tile after reconnection (frames advancing), not frozen',
    ).toBeGreaterThanOrEqual(VB_MIN_FRAME_ADVANCE);
    expect(
      viewer,
      "viewer's received tile background should survive reconnection (published track kept the effect)",
    ).toBeLessThan(VB_CORNER_VARIANCE_MAX);
    expect(
      viewerStats?.brightness,
      "viewer's received tile must be a live tile after reconnection (bright center), not black",
    ).toBeGreaterThan(VB_CENTER_BRIGHTNESS_MIN);
    expect(
      viewerStats?.frameDelta,
      "viewer's received tile must be a live tile after reconnection (frames advancing), not frozen",
    ).toBeGreaterThanOrEqual(VB_MIN_FRAME_ADVANCE);
  }
}
