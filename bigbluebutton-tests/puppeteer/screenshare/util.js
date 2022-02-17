const e = require('../core/elements');
const { VIDEO_LOADING_WAIT_TIME } = require('../core/constants');

async function startScreenshare(test) {
  await test.waitAndClick(e.startScreenSharing);
  await test.waitForSelector(e.screenshareConnecting);
  await test.waitForSelector(e.screenShareVideo, VIDEO_LOADING_WAIT_TIME);
}

async function getScreenShareBreakoutContainer(test) {
  await test.waitForSelector(e.screenshareConnecting, VIDEO_LOADING_WAIT_TIME);
  return test.hasElement(e.screenShareVideo, true, VIDEO_LOADING_WAIT_TIME);
}

exports.getScreenShareBreakoutContainer = getScreenShareBreakoutContainer;
exports.startScreenshare = startScreenshare;