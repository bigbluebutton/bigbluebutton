import { expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME, LOOP_INTERVAL } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';

export type VideoPixelFingerprint = [number, number, number][];

const FINGERPRINT_POINTS = [
  [0.15, 0.15],
  [0.5, 0.15],
  [0.85, 0.5],
  [0.15, 0.85],
  [0.85, 0.85],
];

export async function sampleVideoPixels(
  testPage: Page,
  selector: string,
  timeout = ELEMENT_WAIT_TIME,
): Promise<VideoPixelFingerprint> {
  const video = testPage.page.locator(selector).first();
  await expect(video, `video ${selector} should be visible before sampling`).toBeVisible();
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState >= 2 && element.videoWidth > 0), {
      message: `video ${selector} should have a decoded frame before sampling`,
      timeout,
    })
    .toBe(true);

  return video.evaluate((element: HTMLVideoElement, points) => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 24;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Could not create a canvas context for video sampling');
    context.drawImage(element, 0, 0, canvas.width, canvas.height);
    return points.map(([x, y]) => {
      const pixel = context.getImageData(
        Math.round(x * (canvas.width - 1)),
        Math.round(y * (canvas.height - 1)),
        1,
        1,
      ).data;
      return [pixel[0], pixel[1], pixel[2]] as [number, number, number];
    });
  }, FINGERPRINT_POINTS);
}

export function backgroundIsUnchanged(before: VideoPixelFingerprint, after: VideoPixelFingerprint, tolerance = 8) {
  return (
    before.length === after.length &&
    after.every((pixel, pointIndex) =>
      pixel.every((channel, channelIndex) => Math.abs(channel - before[pointIndex][channelIndex]) <= tolerance),
    )
  );
}

export function backgroundDiffersFromRaw(
  raw: VideoPixelFingerprint,
  background: VideoPixelFingerprint,
  minimumChannelDifference = 16,
) {
  if (raw.length !== background.length) return false;
  return background.some((pixel, pointIndex) =>
    pixel.some(
      (channel, channelIndex) => Math.abs(channel - raw[pointIndex][channelIndex]) >= minimumChannelDifference,
    ),
  );
}

export async function webcamContentCheck(testPage: Page) {
  // Verify the webcam stream is live by checking that the video's currentTime advances.
  await testPage.waitForSelector(e.webcamVideoItem);
  await testPage.wasRemoved(
    e.webcamConnecting,
    'should the connecting element be removed when start webcam sharing',
    ELEMENT_WAIT_LONGER_TIME,
  );

  const getVideoTime = () => {
    const video =
      document.querySelector<HTMLVideoElement>('video[data-local-stream="true"]') ||
      document.querySelector<HTMLVideoElement>('video');
    return video ? video.currentTime : -1;
  };

  const initialTime = await testPage.page.evaluate(getVideoTime);
  if (initialTime < 0) return false;

  await testPage.page.waitForTimeout(LOOP_INTERVAL * 2);

  const laterTime = await testPage.page.evaluate(getVideoTime);
  return laterTime > initialTime;
}

// NETWORK_MONITORING_INTERVAL_MS in BBB's connection-status/service.js is 2000ms.
// Sample across 4 intervals (~8s) and take the peak to get a stable reading
// once the stream has ramped up past its initial startup transient.
const SAMPLE_COUNT = 4;
const SAMPLE_INTERVAL_MS = 2000;

export async function checkVideoUploadData(testPage: Page, previousValue: number, timeout = ELEMENT_WAIT_TIME) {
  const locator = testPage.page.locator(e.videoUploadRateData);
  await expect(locator).not.toHaveText('0k ↑', { timeout });

  let peak = 0;
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const text = await locator.textContent();
    if (!text) throw new Error('Video upload rate data not found');
    const sample = Number(text.split('k')[0]);
    if (sample > peak) peak = sample;
    if (i < SAMPLE_COUNT - 1) await testPage.page.waitForTimeout(SAMPLE_INTERVAL_MS);
  }

  await expect(peak).toBeGreaterThan(previousValue);
  return peak;
}

/**
 * The background thumbnails are a responsive grid, so the column count follows the
 * container width. Regression guard for #25494, where fixed per-item margins made the
 * grid wrap a column early and leave a column's worth of empty space on the side.
 */
export async function checkBackgroundThumbnailColumns(testPage: Page, minColumns: number) {
  const columns = await testPage.page.locator(e.virtualBackgrounds).evaluate((wrapper) => {
    const positions = Array.from(wrapper.children)
      .map((child) => child.getBoundingClientRect())
      // Skip the screen-reader-only descriptions and the hidden file input
      .filter((rect) => rect.width > 40)
      .map((rect) => Math.round(rect.x));
    return new Set(positions).size;
  });
  await expect(
    columns,
    `should lay the background thumbnails out in at least ${minColumns} columns`,
  ).toBeGreaterThanOrEqual(minColumns);
}

const CUSTOM_BACKGROUND_PATH = resolve(__dirname, '../core/media/simpsons-background.png');

export async function uploadBackgroundVideoImage(testPage: Page) {
  const [fileChooser] = await Promise.all([
    testPage.page.waitForEvent('filechooser'),
    testPage.waitAndClick(e.inputBackgroundButton),
  ]);
  await fileChooser.setFiles(CUSTOM_BACKGROUND_PATH);
  const uploadedBackgroundLocator = testPage.page.locator(e.selectCustomBackground);
  // The thumbnail paints the picked file itself, inlined as a data URL. Asserting that
  // is what "the upload shows up as a thumbnail" actually means, and unlike comparing
  // pixels it does not tie the check to the thumbnail's rendered size. This also waits
  // out the asynchronous read of the file.
  await expect(
    uploadedBackgroundLocator,
    'should paint an uploaded image as the custom background thumbnail',
  ).toHaveCSS('background-image', /^url\("data:image\/png;base64,/);

  const expectedBackgroundImage = `url("data:image/png;base64,${readFileSync(CUSTOM_BACKGROUND_PATH).toString('base64')}")`;
  // Compared inside the page so a mismatch does not dump two ~275k-character data URLs
  // into the report.
  const showsUploadedFile = await uploadedBackgroundLocator.evaluate(
    (button, expected) => getComputedStyle(button).backgroundImage === expected,
    expectedBackgroundImage,
  );
  await expect(showsUploadedFile, 'the custom background thumbnail should show the file that was uploaded').toBe(true);
}
