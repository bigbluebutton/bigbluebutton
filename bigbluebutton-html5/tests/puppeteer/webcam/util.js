const we = require('./elements');

async function enableWebcam(test) {
  // Enabling webcam
  await test.waitForSelector(we.joinVideo);
  await test.click(we.joinVideo);
  await test.waitForSelector(we.videoPreview);
  await test.waitForSelector(we.startSharingWebcam);
  await test.click(we.startSharingWebcam);
}

async function getTestElement(element) {
  (await document.querySelectorAll(element)[0]) !== null;
}

async function evaluateCheck(test) {
  await test.waitForSelector(we.videoContainer);
  const videoContainer = await test.evaluate(getTestElement, we.presentationFullscreenButton);
  const response = videoContainer !== null;
  return response;
}

async function startAndCheckForWebcams(test) {
  await enableWebcam(test);
  const response = await evaluateCheck(test);
  return response;
}

async function webcamContentCheck(test) {
  await test.waitForSelector(we.videoContainer);
  await test.waitForFunction(() => !document.querySelector('[data-test="webcamConnecting"]'));

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

    check = await test.evaluate(checkCameras, i);
    await test.waitFor(parseInt(process.env.LOOP_INTERVAL));
  }
  return check === true;
}

exports.startAndCheckForWebcams = startAndCheckForWebcams;
exports.webcamContentCheck = webcamContentCheck;
exports.evaluateCheck = evaluateCheck;
exports.getTestElement = getTestElement;
exports.enableWebcam = enableWebcam;
