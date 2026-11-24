import { expect, type Page as PlaywrightPage } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';
import { IDLE_CHECK_TIMEOUT } from './util';

// Polls in the page so an element that flashes in and out between two
// Playwright checks still counts as having appeared.
async function appearsWithin(page: PlaywrightPage, selector: string, durationMs: number): Promise<boolean> {
  return page.evaluate(
    async ({ sel, ms }) => {
      const deadline = Date.now() + ms;
      while (Date.now() < deadline) {
        const element = document.querySelector(sel);
        if (element?.checkVisibility()) return true;
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
      }
      return false;
    },
    { sel: selector, ms: durationMs },
  );
}

export class SmartTriggers extends MultiUsers {
  async mutedAlertStaysOffUntilUnmute() {
    await this.modPage.joinMicrophone();
    await this.modPage.waitAndClick(e.muteMicButton);
    await this.modPage.hasElement(e.unmuteMicButton, 'should display the unmute button after muting');
    await this.modPage.hasElement(
      e.mutedAlert,
      'should warn that the user is talking while muted',
      ELEMENT_WAIT_LONGER_TIME,
    );

    await this.modPage.waitAndClick(e.mutedAlert);
    await this.modPage.hasText(
      e.toastContainer,
      'Mute alerts disabled until unmute',
      'should confirm the muted alert is off until the next unmute',
    );
    await this.modPage.wasRemoved(e.mutedAlert, 'should hide the muted alert once clicked');
    expect(
      await appearsWithin(this.modPage.page, e.mutedAlert, ELEMENT_WAIT_LONGER_TIME),
      'should keep the muted alert off while the user keeps talking muted',
    ).toBe(false);

    await this.modPage.waitAndClick(e.unmuteMicButton);
    await this.modPage.hasElement(e.muteMicButton, 'should display the mute button after unmuting');
    await this.modPage.waitAndClick(e.muteMicButton);
    await this.modPage.hasElement(
      e.mutedAlert,
      'should warn again after the user unmuted and muted again',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  async handStillRaisedLowersHand() {
    await this.modPage.joinMicrophone({ shouldUnmute: false });
    await this.modPage.waitAndClick(e.raiseHandBtn);
    await this.modPage.hasElement(e.lowerHandBtn, 'should display the lower hand button after raising the hand');

    await this.modPage.waitAndClick(e.unmuteMicButton);
    await this.modPage.hasElement(e.muteMicButton, 'should display the mute button after unmuting');
    await this.modPage.checkUserTalkingIndicator();
    await this.modPage.waitAndClick(e.muteMicButton);
    await this.modPage.hasElement(e.unmuteMicButton, 'should display the unmute button after muting');

    await this.modPage.hasElement(
      e.smartTriggerLowerHand,
      'should suggest lowering the hand after speaking',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.waitAndClick(e.smartTriggerLowerHand);
    await this.modPage.hasElement(e.raiseHandBtn, 'should lower the hand from the hint');
    await this.modPage.wasRemoved(e.smartTriggerLowerHand, 'should remove the hint once the hand is lowered');
  }

  async noMicSignalOpensAudioSettings() {
    await this.modPage.joinMicrophone();
    await this.modPage.hasElement(
      e.smartTriggerChangeMic,
      'should warn that the microphone sends no signal',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.waitAndClick(e.smartTriggerChangeMic);
    await this.modPage.hasElement(e.audioSettingsModal, 'should open the audio settings from the hint');
  }

  async recordingWithNoSpeechPauses() {
    // joinMicrophone() would wait for the talking indicator, which a silent
    // microphone never shows
    await this.modPage.joinMicrophone({ shouldUnmute: false });
    await this.modPage.waitAndClick(e.unmuteMicButton);
    await this.modPage.hasElement(e.muteMicButton, 'should display the mute button after unmuting');
    const recordingIndicatorButton = this.modPage.page.locator(`${e.recordingIndicator} button`);
    await this.modPage.waitAndClick(e.recordingIndicator);
    await this.modPage.waitAndClick(e.confirmRecordingButton);
    await expect(recordingIndicatorButton, 'should start recording').toHaveCSS('border-top-style', 'solid');

    await this.modPage.hasElement(
      e.smartTriggerPauseRecording,
      'should warn the moderator that nobody talks in the recording',
      IDLE_CHECK_TIMEOUT,
    );
    await this.modPage.hasElement(
      e.smartTriggerCheckAudio,
      'should offer to check the audio of a moderator who is in audio',
    );
    await this.modPage.waitAndClick(e.smartTriggerPauseRecording);
    await expect(recordingIndicatorButton, 'should pause the recording from the hint').toHaveCSS(
      'border-top-style',
      'none',
    );
  }
}
