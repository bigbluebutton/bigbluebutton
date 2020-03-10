const we = require('./elements');

async function enableWebcam(test) {
  // Enabling webcam
  await test.waitForSelector(we.joinVideo);
  await test.click(we.joinVideo, true);
  await test.waitForSelector(we.videoPreview);
  await test.waitForSelector(we.startSharingWebcam);
  await test.click(we.startSharingWebcam, true);
}

async function getTestElement(element) {
  (await document.querySelectorAll(element)[0]) !== null;
}

async function evaluateCheck(test) {
  const videoContainer = await test.page.evaluate(getTestElement, we.presentationFullscreenButton);
  const response = videoContainer !== null;
  return response;
}

async function waitForWebcamsLoading(test) {
  await test.waitForSelector(we.videoContainer);
  await test.waitForSelector(we.webcamConnectingStatus);
  await test.waitForSelector(we.presentationFullscreenButton);
}

async function startAndCheckForWebcams(test) {
  await enableWebcam(test);
  await waitForWebcamsLoading(test);
  const response = await evaluateCheck(test);
  return response;
}

async function webcamContentCheck(test) {
  await waitForWebcamsLoading(test);
  const repeats = 5;
  let check;
  for (let i = repeats; i >= 0; i--) {
    const checkCameras = function (i) {
      const videos = document.querySelectorAll('video');
      const lastVideoColor = document.lastVideoColor || {};
      document.lastVideoColor = lastVideoColor;

      for (let v = 0; v < videos.length; v++) {
        const video = videos[v];
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const pixel = context.getImageData(50, 50, 1, 1).data;
        const pixelString = new Array(pixel).join(' ').toString();

        if (lastVideoColor[v]) {
          if (lastVideoColor[v] == pixelString) {
            return false;
          }
        }
        lastVideoColor[v] = pixelString;
      }
      return true;
    };
    return check = await test.page.evaluate(checkCameras, i);
  }
}

exports.startAndCheckForWebcams = startAndCheckForWebcams;
exports.waitForWebcamsLoading = waitForWebcamsLoading;
exports.webcamContentCheck = webcamContentCheck;
exports.evaluateCheck = evaluateCheck;
exports.getTestElement = getTestElement;
exports.enableWebcam = enableWebcam;
