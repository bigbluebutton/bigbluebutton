import { expect } from '@playwright/test';
import { resolve } from 'path';

import { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME, LOOP_INTERVAL } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';

declare global {
  interface Document {
    lastVideoHash?: Record<number, ArrayBuffer>;
  }
}

export async function webcamContentCheck(testPage: Page) {
  // loop 5 times, every LOOP_INTERVAL milliseconds, and check that all
  // videos displayed are changing by comparing a hash of their
  // displayed contents
  await testPage.waitForSelector(e.webcamVideoItem);
  await testPage.wasRemoved(
    e.webcamConnecting,
    'should the connecting element be removed when start webcam sharing',
    ELEMENT_WAIT_LONGER_TIME,
  );
  const repeats = 5;
  let check;
  for (let i = repeats; i >= 1; i--) {
    console.log(`loop ${i}`);
    const checkCameras = async () => {
      const videos = document.querySelectorAll('video');
      const lastVideoHash = document.lastVideoHash || {};
      document.lastVideoHash = lastVideoHash;

      for (let v = 0; v < videos.length; v++) {
        const video = videos[v];
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const pixel = context?.getImageData(0, 0, video.videoWidth, video.videoHeight).data;
        if (!pixel) return false;
        const pixelHash = await window.crypto.subtle.digest('SHA-1', pixel);

        if (lastVideoHash[v]) {
          const lastHash = new Uint8Array(lastVideoHash[v]);
          const currentHash = new Uint8Array(pixelHash);
          const areEqual =
            lastHash.length === currentHash.length && lastHash.every((val, idx) => val === currentHash[idx]);
          if (areEqual) {
            return false;
          }
        }
        lastVideoHash[v] = pixelHash;
      }
      return true;
    };

    check = await testPage.page.evaluate(checkCameras);
    if (!check) return false;
    await testPage.page.waitForTimeout(LOOP_INTERVAL);
  }
  return check === true;
}

export async function checkVideoUploadData(testPage: Page, previousValue: number, timeout = ELEMENT_WAIT_TIME) {
  const locator = testPage.page.locator(e.videoUploadRateData);
  await expect(locator).not.toHaveText('0k ↑', { timeout });
  const text = await locator.textContent();
  if (!text) throw new Error('Video upload rate data not found');
  const currentValue = Number(text.split('k')[0]);
  await expect(currentValue).toBeGreaterThan(previousValue);
  return currentValue;
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
