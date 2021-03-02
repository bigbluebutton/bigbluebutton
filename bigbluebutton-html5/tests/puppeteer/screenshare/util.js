const { ELEMENT_WAIT_TIME, VIDEO_LOADING_WAIT_TIME } = require('../core/constants');
const e = require('../core/elements');

async function startScreenshare(test) {
  await test.waitForSelector(e.screenShare, ELEMENT_WAIT_TIME);
  await test.click(e.screenShare, true);
}

async function getTestElement(element) {
  (await document.querySelectorAll(element)[0]) !== null;
}

async function getScreenShareContainer(test) {
  await test.waitForSelector(e.screenShareVideo, VIDEO_LOADING_WAIT_TIME);
  const screenShareContainer = await test.page.evaluate(getTestElement, e.screenShareVideo);
  const response = screenShareContainer !== null;
  return response;
}
async function getScreenShareBreakoutContainer(test) {
  await test.waitForSelector(e.screenshareConnecting, { timeout: VIDEO_LOADING_WAIT_TIME });
  await test.waitForSelector(e.screenShareVideo, { timeout: VIDEO_LOADING_WAIT_TIME });
  const screenShareContainer = await test.evaluate(getTestElement, e.screenShareVideo);
  const response = screenShareContainer !== null;
  return response;
}

exports.getScreenShareBreakoutContainer = getScreenShareBreakoutContainer;
exports.getScreenShareContainer = getScreenShareContainer;
exports.getTestElement = getTestElement;
exports.startScreenshare = startScreenshare;
