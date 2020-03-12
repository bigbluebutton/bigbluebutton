const e = require('../core/elements');

async function startScreenshare(test) {
  await test.waitForSelector(e.screenShare);
  await test.click(e.screenShare, true);
}

async function getTestElement(element) {
  (await document.querySelectorAll(element)[0]) !== null;
}

async function getScreenShareContainer(test) {
  await test.waitForSelector(e.screenShareVideo);
  const screenShareContainer = await test.evaluate(getTestElement, e.screenshareVideo);
  const response = screenShareContainer !== null;
  return response;
}

exports.getScreenShareContainer = getScreenShareContainer;
exports.getTestElement = getTestElement;
exports.startScreenshare = startScreenshare;
