import { expect } from '@playwright/test';
import { resolve } from 'path';

import { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME, LOOP_INTERVAL } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';


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

export async function uploadBackgroundVideoImage(testPage: Page) {
  const [fileChooser] = await Promise.all([
    testPage.page.waitForEvent('filechooser'),
    testPage.waitAndClick(e.inputBackgroundButton),
  ]);
  await fileChooser.setFiles(resolve(__dirname, '../core/media/simpsons-background.png'));
  const uploadedBackgroundLocator = testPage.page.locator(e.selectCustomBackground);
  await expect(uploadedBackgroundLocator).toHaveScreenshot('custom-background-item.png');
}
