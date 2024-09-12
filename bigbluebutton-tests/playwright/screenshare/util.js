const e = require('../core/elements');
const { VIDEO_LOADING_WAIT_TIME } = require('../core/constants');

async function startScreenshare(test) {
  await test.waitAndClick(e.startScreenSharing);
  await test.hasElement(e.screenShareVideo, VIDEO_LOADING_WAIT_TIME);
  await test.hasElement(e.stopScreenSharing);
}

exports.startScreenshare = startScreenshare;
