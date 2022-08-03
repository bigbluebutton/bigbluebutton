const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

async function connectMicrophone(testPage) {
  const {
    autoJoinAudioModal,
    skipEchoTest,
    skipEchoTestOnJoin,
  } = testPage.settings;

  if (!autoJoinAudioModal) await testPage.waitAndClick(e.joinAudio);
  await testPage.waitAndClick(e.microphoneButton);
  const shouldSkipEchoTest = skipEchoTest || skipEchoTestOnJoin;
  if (!shouldSkipEchoTest) {
    await testPage.waitForSelector(e.stopHearingButton);
    await testPage.waitAndClick(e.joinEchoTestButton);
    await testPage.waitForSelector(e.establishingAudioLabel);
    await testPage.wasRemoved(e.establishingAudioLabel, ELEMENT_WAIT_LONGER_TIME);
  }
  await testPage.hasElement(e.isTalking);
}

async function isAudioItemSelected(testPage, audioSelector) {
  await testPage.waitForSelector(audioSelector);
  const isSelected = await testPage.page.evaluate(([selector, icon]) => {
    return !!document.querySelector(selector).firstChild.querySelector(icon);
  }, [audioSelector, e.checkedIcon]);
  await expect(isSelected).toBeTruthy();
}

exports.connectMicrophone = connectMicrophone;
exports.isAudioItemSelected = isAudioItemSelected;
