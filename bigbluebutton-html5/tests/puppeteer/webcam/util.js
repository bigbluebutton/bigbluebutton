const we = require('./elements');

async function enableWebcam(test) {
  // Enabling webcam
  await test.waitForSelector(we.joinVideo);
  await test.page.evaluate(clickTestElement, we.joinVideo);
  await test.waitForSelector(we.videoPreview);
  await test.waitForSelector(we.startSharingWebcam);
  await test.page.evaluate(clickTestElement, we.startSharingWebcam);
}

async function getFullScreenWebcamButton(element) {
  return await document.querySelectorAll(element)[1] !== null;
}

async function evaluateCheck(test) {
  await test.waitForSelector(we.videoContainer);
  const videoContainer = await test.page.evaluate(getFullScreenWebcamButton, we.presentationFullscreenButton);
  const response = videoContainer !== false;
  return response;
}

async function startAndCheckForWebcams(test) {
  await enableWebcam(test);
  const response = await evaluateCheck(test);
  return response;
}

async function webcamContentCheck(test) {
  await test.waitForSelector(we.videoContainer);
  await test.elementRemoved(we.webcamConnecting);
  const repeats = 5;
  let check;
  for (let i = repeats; i >= 1; i--) {
    console.log(`loop ${i}`);
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
        return true;
      }
    };

    check = await test.page.evaluate(checkCameras, i);
    await test.page.waitFor(parseInt(process.env.LOOP_INTERVAL));
  }
  return check === true;
}

async function clickTestElement(element) {
  document.querySelectorAll(element)[0].click();
}

exports.startAndCheckForWebcams = startAndCheckForWebcams;
exports.webcamContentCheck = webcamContentCheck;
exports.evaluateCheck = evaluateCheck;
exports.getFullScreenWebcamButton = getFullScreenWebcamButton;
exports.enableWebcam = enableWebcam;
