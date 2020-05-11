const ae = require('./elements');

async function joinAudio(test) {
  await test.waitForSelector(ae.joinAudio);
  await test.page.evaluate(clickTestElement, ae.joinAudio);
  await test.waitForSelector(ae.listen);
  await test.page.evaluate(clickTestElement, ae.listen);
  await test.waitForSelector(ae.connectingStatus);
  await test.elementRemoved(ae.connectingStatus);
  await test.waitForSelector(ae.leaveAudio);
  const resp = await test.page.evaluate(getTestElement, ae.leaveAudio);
  return resp;
}

async function joinMicrophone(test) {
  await test.waitForSelector(ae.joinAudio);
  await test.page.evaluate(clickTestElement, ae.joinAudio);
  await test.waitForSelector(ae.microphone);
  await test.page.evaluate(clickTestElement, ae.microphone);
  await test.waitForSelector(ae.connectingStatus);
  await test.elementRemoved(ae.connectingStatus);
  await test.waitForSelector(ae.audioAudible);
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
