import { expect } from '@playwright/test';
import { elements as e } from '../core/elements.ts';
import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants.ts';

export async function connectMicrophone(testPage) {
  const { autoJoinAudioModal, skipEchoTest, skipEchoTestOnJoin, listenOnlyMode } = testPage.settings;

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

export async function isAudioItemSelected(testPage, audioSelector) {
  await testPage.waitForSelector(audioSelector);
  const isSelected = await testPage.page.evaluate(
    ([selector, icon]) => !!document.querySelector(selector).firstChild.querySelector(icon),
    [audioSelector, e.checkedIcon]
  );
  await expect(isSelected).toBeTruthy();
}

export async function ensureUnmuted(testPage) {
  const isMuted = await testPage.checkElement(e.unmuteMicButton);
  if (isMuted) await testPage.waitAndClick(e.unmuteMicButton);
  await testPage.hasElement(e.isTalking, 'should be talking');
}
