const e = require('../core/elements');
const { VIDEO_LOADING_WAIT_TIME } = require('../core/constants');
const { checkElement } = require('../core/util');

async function startScreenshare(test) {
  await test.waitAndClick(e.startScreenSharing);
}

async function waitForScreenshareContainer(test) {
  await test.waitForSelector(e.screenshareConnecting);
  await test.waitForSelector(e.screenShareVideo, VIDEO_LOADING_WAIT_TIME);
}

async function getScreenShareBreakoutContainer(test) {
  await test.waitForSelector(e.screenshareConnecting, VIDEO_LOADING_WAIT_TIME);
  await test.waitForSelector(e.screenShareVideo, VIDEO_LOADING_WAIT_TIME);
  return test.evaluate(checkElement, e.screenShareVideo);
}

exports.getScreenShareBreakoutContainer = getScreenShareBreakoutContainer;
exports.startScreenshare = startScreenshare;
exports.waitForScreenshareContainer = waitForScreenshareContainer;
