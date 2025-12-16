import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';

export async function connectMicrophone(testPage: Page) {
  if (!testPage.settings) throw new Error('testPage.settings is not defined');
  const { autoJoinAudioModal, skipEchoTest, skipEchoTestOnJoin, listenOnlyMode } = testPage.settings || {};

  if (!autoJoinAudioModal) await testPage.waitAndClick(e.joinAudio);
  if (listenOnlyMode) await testPage.waitAndClick(e.microphoneButton);
  const shouldSkipEchoTest = skipEchoTest || skipEchoTestOnJoin;
  if (!shouldSkipEchoTest) {
    await testPage.waitForSelector(e.stopHearingButton);
    await testPage.waitAndClick(e.joinEchoTestButton);
    await testPage.wasRemoved(
      e.establishingAudioLabel,
      'should the establishing audio label be removed after audio is established',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }
  await testPage.wasRemoved(
    e.joinAudio,
    'should not display the join audio button after joining audio',
    ELEMENT_WAIT_LONGER_TIME,
  );
  await testPage.hasElement(e.audioDropdownMenu, 'should display the audio dropdown menu after joining audio');
}

export async function isAudioItemSelected(testPage: Page, audioSelector: string) {
  await testPage.waitForSelector(audioSelector);
  const isSelected = await testPage.page.evaluate(
    ([selector, icon]) => {
      const element = document.querySelector(selector) as Element | null;
      const child = element?.firstElementChild as Element | null;
      return !!child?.querySelector(icon);
    },
    [audioSelector, e.checkedIcon],
  );
  expect(isSelected).toBeTruthy();
}

export async function ensureUnmuted(testPage: Page) {
  const isMuted = await testPage.checkElement(e.unmuteMicButton);
  if (isMuted) await testPage.waitAndClick(e.unmuteMicButton);
  await testPage.hasElement(e.isTalking, 'should be talking');
}
