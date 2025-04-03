const e = require('../core/elements');
const { sleep } = require('../core/helpers');
const { LOOP_INTERVAL, ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } = require('../core/constants');
const { expect } = require('@playwright/test');
const { resolve } = require('path');

// loop 5 times, every LOOP_INTERVAL milliseconds, and check that all
// videos displayed are changing by comparing a hash of their
// displayed contents

async function webcamContentCheck(test) {
  await test.waitForSelector(e.webcamVideoItem);
  await test.wasRemoved(e.webcamConnecting, ELEMENT_WAIT_LONGER_TIME);
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
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const pixel = context.getImageData(0, 0, video.videoWidth, video.videoHeight).data;
        const pixelHash = await window.crypto.subtle.digest('SHA-1', pixel);

        if (lastVideoHash[v]) {
          if (lastVideoHash[v] == pixelHash) {
            return false;
          }
        }
        lastVideoHash[v] = pixelHash;
      }
      return true;
    };

    check = await test.page.evaluate(checkCameras);
    if (!check) return false;
    await sleep(LOOP_INTERVAL);
  }
  return check === true;
}

async function checkVideoUploadData(testPage, previousValue, timeout = ELEMENT_WAIT_TIME) {
  const locator = testPage.getLocator(e.videoUploadRateData);
  await expect(locator).not.toHaveText('0k ↑', { timeout });
  const currentValue = await Number((await locator.textContent()).split('k')[0]);
  await expect(currentValue).toBeGreaterThan(previousValue);
  return currentValue;
}

async function uploadBackgroundVideoImage(testPage) {
  const [fileChooser] = await Promise.all([
    testPage.page.waitForEvent('filechooser'),
    testPage.waitAndClick(e.inputBackgroundButton),
  ]);
  await fileChooser.setFiles(resolve(__dirname, '../core/media/simpsons-background.png'));
  const uploadedBackgroundLocator = testPage.getLocator(e.selectCustomBackground);
  await sleep(1000); // give some time for the background to apply
  await expect(uploadedBackgroundLocator).toHaveScreenshot('custom-background-item.png');
}

exports.webcamContentCheck = webcamContentCheck;
exports.checkVideoUploadData = checkVideoUploadData;
exports.uploadBackgroundVideoImage = uploadBackgroundVideoImage;
