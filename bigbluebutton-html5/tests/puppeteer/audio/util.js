const ae = require('./elements');
const { ELEMENT_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

async function joinAudio(test) {
  await test.waitForSelector(ae.joinAudio, ELEMENT_WAIT_TIME);
  await test.page.evaluate(clickTestElement, ae.joinAudio);
  await test.waitForSelector(ae.listen, ELEMENT_WAIT_TIME);
  await test.page.evaluate(clickTestElement, ae.listen);
  await test.waitForSelector(ae.connectingStatus, ELEMENT_WAIT_TIME);
  await test.waitForElementHandleToBeRemoved(ae.connectingStatus, ELEMENT_WAIT_LONGER_TIME);
  const parsedSettings = await test.getSettingsYaml();
  const listenOnlyCallTimeout = parseInt(parsedSettings.public.media.listenOnlyCallTimeout);
  await test.waitForSelector(ae.leaveAudio, listenOnlyCallTimeout);
  await test.waitForSelector(ae.whiteboard, ELEMENT_WAIT_TIME);
  const resp = await test.page.evaluate(getTestElement, ae.leaveAudio);
  return resp;
}

async function joinMicrophone(test) {
  await test.waitForSelector(ae.joinAudio, ELEMENT_WAIT_TIME);
  await test.page.evaluate(clickTestElement, ae.joinAudio);
  await test.waitForSelector(ae.microphone, ELEMENT_WAIT_TIME);
  await test.page.evaluate(clickTestElement, ae.microphone);
  await test.waitForSelector(ae.connectingStatus, ELEMENT_WAIT_TIME);
  await test.waitForElementHandleToBeRemoved(ae.connectingStatus, ELEMENT_WAIT_LONGER_TIME);
  const parsedSettings = await test.getSettingsYaml();
  const listenOnlyCallTimeout = parseInt(parsedSettings.public.media.listenOnlyCallTimeout);
  await test.waitForSelector(ae.audioAudible, listenOnlyCallTimeout);
  await test.click(ae.audioAudible, true);
  await test.waitForSelector(ae.whiteboard, ELEMENT_WAIT_TIME);
  const resp = await test.page.evaluate(getTestElement, ae.audioAudible);
  return resp;
}

async function clickTestElement(element) {
  document.querySelectorAll(element)[0].click();
}

async function getTestElement(element) {
  return document.querySelectorAll(element).length >= 1 === true;
}

exports.joinAudio = joinAudio;
exports.joinMicrophone = joinMicrophone;
