const e = require('../core/elements');
const { clickElement, getElementLength } = require('../core/util');
const { ELEMENT_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

async function joinAudio(test) {
  await test.waitForSelector(e.joinAudio, ELEMENT_WAIT_TIME);
  await test.page.evaluate(clickElement, e.joinAudio);
  await test.waitForSelector(e.listenOnlyButton, ELEMENT_WAIT_TIME);
  await test.page.evaluate(clickElement, e.listenOnlyButton);
  await test.waitForSelector(e.connectingStatus, ELEMENT_WAIT_TIME);
  await test.waitForElementHandleToBeRemoved(e.connectingStatus, ELEMENT_WAIT_LONGER_TIME);
  const parsedSettings = await test.getSettingsYaml();
  const listenOnlyCallTimeout = parseInt(parsedSettings.public.media.listenOnlyCallTimeout);
  await test.waitForSelector(e.leaveAudio, listenOnlyCallTimeout);
  await test.waitForSelector(e.whiteboard, ELEMENT_WAIT_TIME);
  const resp = await test.page.evaluate(getElementLength, e.leaveAudio) >= 1;
  return resp;
}

async function joinMicrophone(test) {
  await test.waitForSelector(e.joinAudio, ELEMENT_WAIT_TIME);
  await test.page.evaluate(clickElement, e.joinAudio);
  await test.waitForSelector(e.microphoneButton, ELEMENT_WAIT_TIME);
  await test.page.evaluate(clickElement, e.microphoneButton);
  await test.waitForSelector(e.connectingStatus, ELEMENT_WAIT_TIME);
  await test.waitForElementHandleToBeRemoved(e.connectingStatus, ELEMENT_WAIT_LONGER_TIME);
  const parsedSettings = await test.getSettingsYaml();
  const listenOnlyCallTimeout = parseInt(parsedSettings.public.media.listenOnlyCallTimeout);
  await test.waitForSelector(e.echoYesButton, listenOnlyCallTimeout);
  await test.click(e.echoYesButton, true);
  await test.waitForSelector(e.whiteboard, ELEMENT_WAIT_TIME);
  const resp = await test.page.evaluate(getElementLength, e.echoYesButton) >= 1;
  return resp;
}

exports.joinAudio = joinAudio;
exports.joinMicrophone = joinMicrophone;
