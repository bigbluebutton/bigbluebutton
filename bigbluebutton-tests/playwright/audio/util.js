const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

async function connectMicrophone(testPage) {
  const {
    autoJoinAudioModal,
    skipEchoTest,
    skipEchoTestOnJoin,
    listenOnlyMode,
  } = testPage.settings;

  if (!autoJoinAudioModal) await testPage.waitAndClick(e.joinAudio);
  if (listenOnlyMode) await testPage.waitAndClick(e.microphoneButton);
  const shouldSkipEchoTest = skipEchoTest || skipEchoTestOnJoin;
  if (!shouldSkipEchoTest) {
    await testPage.waitForSelector(e.stopHearingButton);
    await testPage.waitAndClick(e.joinEchoTestButton);
    await testPage.waitForSelector(e.establishingAudioLabel);
    await testPage.wasRemoved(e.establishingAudioLabel, ELEMENT_WAIT_LONGER_TIME);
  }
  await testPage.wasRemoved(e.joinAudio);
  await testPage.hasElement(e.audioDropdownMenu);
}

async function isAudioItemSelected(testPage, audioSelector) {
  await testPage.waitForSelector(audioSelector);
  const isSelected = await testPage.page.evaluate(([selector, icon]) => {
    return !!document.querySelector(selector).firstChild.querySelector(icon);
  }, [audioSelector, e.checkedIcon]);
  await expect(isSelected).toBeTruthy();
}

async function ensureUnmuted(testPage) {
  const isMuted = await testPage.checkElement(e.unmuteMicButton);
  if (isMuted) await testPage.waitAndClick(e.unmuteMicButton);
  await testPage.hasElement(e.isTalking, 'should be talking');
}

exports.connectMicrophone = connectMicrophone;
exports.isAudioItemSelected = isAudioItemSelected;
exports.ensureUnmuted = ensureUnmuted;
