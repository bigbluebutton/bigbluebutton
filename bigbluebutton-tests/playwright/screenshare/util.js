const e = require('../core/elements');
const { VIDEO_LOADING_WAIT_TIME, ELEMENT_WAIT_TIME } = require('../core/constants');
const Page = require('../core/page');

async function startScreenshare(test) {
  await test.waitAndClick(e.startScreenSharing);
  await test.waitForSelector(e.screenshareConnecting, VIDEO_LOADING_WAIT_TIME);
  await test.hasElement(e.screenShareVideo, VIDEO_LOADING_WAIT_TIME);
}

async function getFrame(test, frameSelector) {
  await test.waitForSelector(frameSelector);
  const iframeElement = await test.getLocator('iframe').elementHandle();
  const frame = await iframeElement.contentFrame();
  await frame.waitForURL(/youtube/, { timeout: ELEMENT_WAIT_TIME });
  const ytFrame = new Page(test.browser, frame);
  return ytFrame;
}

exports.startScreenshare = startScreenshare;
exports.getFrame = getFrame;