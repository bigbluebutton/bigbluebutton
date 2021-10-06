const e = require('../core/elements');
const { getElementLength } = require('../core/util');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

async function joinAudio(test) {
  await test.waitAndClick(e.listenOnlyButton);
  await test.waitForElementHandleToBeRemoved(e.connectingStatus);
  const parsedSettings = await test.getSettingsYaml();
  const listenOnlyCallTimeout = parseInt(parsedSettings.public.media.listenOnlyCallTimeout);
  await test.waitForSelector(e.leaveAudio, listenOnlyCallTimeout);
  await test.waitForSelector(e.whiteboard);
  return test.hasElement(e.leaveAudio);
}

async function joinMicrophone(test) {
  await test.waitAndClick(e.microphoneButton);
  await test.waitForElementHandleToBeRemoved(e.connectingStatus, ELEMENT_WAIT_LONGER_TIME);
  const parsedSettings = await test.getSettingsYaml();
  const listenOnlyCallTimeout = parseInt(parsedSettings.public.media.listenOnlyCallTimeout);
  await test.waitAndClick(e.echoYesButton, listenOnlyCallTimeout);
  await test.waitForSelector(e.whiteboard);
  return test.hasElement(e.echoYesButton);
}

exports.joinAudio = joinAudio;
exports.joinMicrophone = joinMicrophone;
