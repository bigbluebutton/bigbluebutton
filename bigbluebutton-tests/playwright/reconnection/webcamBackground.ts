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
  // self-view is flowing again (works whether it comes back with or without the
  // background), then return the local + viewer corner variances.
  private async waitForRepublishAndMeasure(): Promise<{ local: number; viewer: number }> {
    let local = -1;
    for (let i = 0; i < 20; i += 1) {
      await this.modPage.page.waitForTimeout(2000);
      const present = await this.modPage.page.locator(e.currentUserLocalStreamVideo).count();
      if (present > 0) {
        const cv = await cornerVariance(this.modPage.page, e.currentUserLocalStreamVideo);
        // cv === -1 means the element exists but is not drawable yet (still frozen)
        if (cv !== null && cv >= 0) {
          local = cv;
          if (cv > VB_CORNER_VARIANCE_MAX) break; // raw feed already visible
        }
      }
    }
    let viewer = -1;
    for (let i = 0; i < 12; i += 1) {
      const vv = await cornerVariance(this.userPage.page, `${e.webcamVideoItem} video`);
      if (vv !== null && vv > viewer) viewer = vv;
      if (viewer > VB_CORNER_VARIANCE_MAX) break;
      await this.modPage.page.waitForTimeout(2000);
    }
    return { local, viewer };
  }

  async backgroundSurvivesReconnection() {
    await this.shareWithHomeBackground();

    // Pre-state: background is applied (corners static) on both perspectives.
    const preLocal = await cornerVariance(this.modPage.page, e.currentUserLocalStreamVideo);
    expect(preLocal, 'precondition: sharer self-view shows the background (static corners)').toBeLessThan(
      VB_CORNER_VARIANCE_MAX,
    );

    // Trigger a full connection loss long enough to tear the camera peer down.
    await severConnection(5);

    const { local, viewer } = await this.waitForRepublishAndMeasure();

    // After reconnection the background must STILL be applied. With the bug present
    // the camera auto-republishes raw, so these assertions FAIL (test.fail() marks
    // that as an expected failure); a fix flips this to an unexpected pass.
    expect(local, 'sharer self-view background should survive reconnection (corners still static)').toBeLessThan(
      VB_CORNER_VARIANCE_MAX,
    );
    expect(
      viewer,
      "viewer's received tile background should survive reconnection (published track kept the effect)",
    ).toBeLessThan(VB_CORNER_VARIANCE_MAX);
  }
}
