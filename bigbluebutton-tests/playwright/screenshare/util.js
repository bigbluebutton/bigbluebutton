const e = require('../core/elements');
const { ELEMENT_WAIT_EXTRA_LONG_TIME } = require('../core/constants');

async function startScreenshare(test) {
  await test.waitAndClick(e.startScreenSharing);
  await test.hasElement(e.screenShareVideo, ELEMENT_WAIT_EXTRA_LONG_TIME);
  await test.hasElement(e.stopScreenSharing);
}

exports.startScreenshare = startScreenshare;
