const e = require('../core/elements');
const { sleep } = require('../core/helper');
const { checkElement, checkElementLengthDifferentTo } = require('../core/util');
const {
  LOOP_INTERVAL,
  VIDEO_LOADING_WAIT_TIME,
  ELEMENT_WAIT_LONGER_TIME,
} = require('../core/constants');

async function enableWebcam(test, videoPreviewTimeout) {
  // Enabling webcam
  await test.waitAndClick(e.joinVideo);
  await test.waitForSelector(e.videoPreview, videoPreviewTimeout);
  await test.waitAndClick(e.startSharingWebcam);
  await test.waitForSelector(e.webcamConnecting);
  await test.waitForSelector(e.webcamVideo, VIDEO_LOADING_WAIT_TIME);
  await test.waitForSelector(e.leaveVideo, VIDEO_LOADING_WAIT_TIME);
  return test.page.evaluate(checkElementLengthDifferentTo, e.webcamVideo, 0);
}

async function evaluateCheck(test) {
  await test.waitForSelector(e.videoContainer);
  return test.page.evaluate(checkElement, e.presentationFullscreenButton, 1);
}

async function startAndCheckForWebcams(test) {
  await enableWebcam(test);
  const response = await evaluateCheck(test);
  return response;
}

async function webcamContentCheck(test) {
  await test.waitForSelector(e.videoContainer);
  await test.waitForElementHandleToBeRemoved(e.webcamConnecting, ELEMENT_WAIT_LONGER_TIME);
  const repeats = 5;
  let check;
  for (let i = repeats; i >= 1; i--) {
    test.logger(`loop ${i}`);
    const checkCameras = function (i) {
      const videos = document.querySelectorAll('video');
      const lastVideoColor = document.lastVideoColor || {};
      document.lastVideoColor = lastVideoColor;

      for (let v = 0; v < videos.length; v++) {
        const video = videos[v];
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const pixel = context.getImageData(0, 0, 1, 1).data;
        const pixelString = new Array(pixel).join(' ').toString();

        if (lastVideoColor[v]) {
          if (lastVideoColor[v] == pixelString) {
            return false;
          }
        }
        lastVideoColor[v] = pixelString;
        return true;
      }
    };

    check = await test.page.evaluate(checkCameras, i);
    if (!check) return false;
    await sleep(LOOP_INTERVAL);
  }
  return check === true;
}

exports.startAndCheckForWebcams = startAndCheckForWebcams;
exports.webcamContentCheck = webcamContentCheck;
exports.evaluateCheck = evaluateCheck;
exports.enableWebcam = enableWebcam;
