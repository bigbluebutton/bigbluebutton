const { ELEMENT_WAIT_TIME, VIDEO_LOADING_WAIT_TIME } = require('../core/constants');
const e = require('../core/elements');
const { checkElement } = require('../core/util');

async function startScreenshare(test) {
  await test.waitForSelector(e.screenShare, ELEMENT_WAIT_TIME);
  await test.click(e.screenShare, true);
}

async function waitForScreenshareContainer(test) {
  await test.waitForSelector(e.screenshareConnecting, ELEMENT_WAIT_TIME);
  await test.waitForSelector(e.screenShareVideo, VIDEO_LOADING_WAIT_TIME);
}

async function getScreenShareContainer(test) {
  await test.waitForSelector(e.screenShareVideo, VIDEO_LOADING_WAIT_TIME);
  return test.page.evaluate(checkElement, e.screenShareVideo);
}

async function getScreenShareBreakoutContainer(test) {
  await test.waitForSelector(e.screenshareConnecting, { timeout: VIDEO_LOADING_WAIT_TIME });
  await test.waitForSelector(e.screenShareVideo, { timeout: VIDEO_LOADING_WAIT_TIME });
  return test.evaluate(checkElement, e.screenShareVideo);
}

exports.getScreenShareBreakoutContainer = getScreenShareBreakoutContainer;
exports.getScreenShareContainer = getScreenShareContainer;
exports.startScreenshare = startScreenshare;
exports.waitForScreenshareContainer = waitForScreenshareContainer;
