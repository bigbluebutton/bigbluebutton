const ae = require('./elements');
const { clickElement, getElementLength } = require('../core/util');
const { ELEMENT_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

async function joinAudio(test) {
  await test.waitForSelector(ae.joinAudio, ELEMENT_WAIT_TIME);
  await test.page.evaluate(clickElement, ae.joinAudio);
  await test.waitForSelector(ae.listen, ELEMENT_WAIT_TIME);
  await test.page.evaluate(clickElement, ae.listen);
  await test.waitForSelector(ae.connectingStatus, ELEMENT_WAIT_TIME);
  await test.waitForElementHandleToBeRemoved(ae.connectingStatus, ELEMENT_WAIT_LONGER_TIME);
  const parsedSettings = await test.getSettingsYaml();
  const listenOnlyCallTimeout = parseInt(parsedSettings.public.media.listenOnlyCallTimeout);
  await test.waitForSelector(ae.leaveAudio, listenOnlyCallTimeout);
  await test.waitForSelector(ae.whiteboard, ELEMENT_WAIT_TIME);
  const resp = await test.page.evaluate(getElementLength, ae.leaveAudio) >= 1;
  return resp;
}

async function joinMicrophone(test) {
  await test.waitForSelector(ae.joinAudio, ELEMENT_WAIT_TIME);
  await test.page.evaluate(clickElement, ae.joinAudio);
  await test.waitForSelector(ae.microphone, ELEMENT_WAIT_TIME);
  await test.page.evaluate(clickElement, ae.microphone);
  await test.waitForSelector(ae.connectingStatus, ELEMENT_WAIT_TIME);
  await test.waitForElementHandleToBeRemoved(ae.connectingStatus, ELEMENT_WAIT_LONGER_TIME);
  const parsedSettings = await test.getSettingsYaml();
  const listenOnlyCallTimeout = parseInt(parsedSettings.public.media.listenOnlyCallTimeout);
  await test.waitForSelector(ae.audioAudible, listenOnlyCallTimeout);
  await test.click(ae.audioAudible, true);
  await test.waitForSelector(ae.whiteboard, ELEMENT_WAIT_TIME);
  const resp = await test.page.evaluate(getElementLength, ae.audioAudible) >= 1;
  return resp;
}

exports.joinAudio = joinAudio;
exports.joinMicrophone = joinMicrophone;
