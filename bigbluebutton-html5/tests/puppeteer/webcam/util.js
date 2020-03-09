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

exports.getTestElement = getTestElement;
exports.enableWebcam = enableWebcam;
