import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { ClientSettingsOverrides, Page } from '../core/page';

// The yes/no echo test through the server, used when the local echo test is off
export const E2E_ECHO_TEST_SETTINGS_OVERRIDE: ClientSettingsOverrides = {
  public: { media: { localEchoTest: { enabled: false } } },
};

export async function connectMicrophone(testPage: Page) {
  if (!testPage.settings) throw new Error('testPage.settings is not defined');
  const { autoJoinAudioModal, skipEchoTest, skipEchoTestOnJoin, listenOnlyMode } = testPage.settings || {};

  if (!autoJoinAudioModal) await testPage.waitAndClick(e.joinAudio);
  if (listenOnlyMode) await testPage.clickMicrophoneButton();
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

export async function joinMutedMicrophone(testPage: Page) {
  await testPage.waitAndClick(e.joinAudio);
  await connectMicrophone(testPage);
  await testPage.hasElement(e.unmuteMicButton, 'should join audio with the microphone muted');
}

// Push-to-talk ignores the key while a text field has the keyboard focus.
export async function releaseKeyboardFocus(testPage: Page) {
  await testPage.page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
}

export async function ensureUnmuted(testPage: Page) {
  const isMuted = await testPage.checkElement(e.unmuteMicButton);
  if (isMuted) await testPage.waitAndClick(e.unmuteMicButton);
  await testPage.hasElement(e.isTalking, 'should be talking');
}

// Ids of the output devices each remote audio element plays on.
export async function getRemoteAudioSinkIds(testPage: Page): Promise<string[]> {
  return testPage.page.evaluate(() =>
    Array.from(document.querySelectorAll('audio'))
      .filter((audio) => audio.srcObject)
      .map((audio) => audio.sinkId),
  );
}
