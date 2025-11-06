import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';
import { connectMicrophone, ensureUnmuted, isAudioItemSelected } from './util';

export class Audio extends MultiUsers {
  async muteButtonCooldown() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    // cooldown based on the debounce time set in input-stream-live-selector/service.ts
    await this.modPage.page.waitForTimeout(500);
  }

  async joinAudio() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    const { listenOnlyCallTimeout } = this.modPage.settings || {};

    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.waitAndClick(e.listenOnlyButton);
    await this.modPage.wasRemoved(e.establishingAudioLabel, 'should have audio established', ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElement(
      e.unmuteMicButton,
      'should display the unmute button when user joins successfully in listen only mode',
      listenOnlyCallTimeout || ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.waitAndClick(e.unmuteMicButton);
    await this.modPage.hasElement(
      e.audioModal,
      'should display the audio modal (echo test) when user clicks on the unmute button',
    );
    await this.modPage.hasElement(e.joinEchoTestButton, 'should display the audio modal (echo test) join button');
    await this.modPage.hasElement(
      e.stopHearingButton,
      'should display the audio modal (echo test) stop hearing button',
    );
  }

  async joinMicrophone() {
    if (!this?.modPage) throw new Error('modPage not initialized');

    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
    // unmute
    await this.modPage.hasElement(e.unmuteMicButton, 'should join audio with microphone muted');
    await this.modPage.waitAndClick(e.unmuteMicButton);
    await this.modPage.hasElement(e.isTalking, 'should display the is talking element when user unmute the microphone');
    // leave audio
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await this.modPage.hasElement(e.leaveAudio, 'should display the leave audio button in the audio dropdown menu');
    await this.modPage.waitAndClick(e.leaveAudio);
    await this.modPage.hasElement(e.joinAudio, 'should display the join audio button after leaving audio');
    await this.modPage.wasRemoved(
      e.audioDropdownMenu,
      'should not display the audio dropdown menu after leaving audio',
    );
  }

  async muteYourselfByButton() {
    if (!this?.modPage) throw new Error('modPage not initialized');

    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
    // unmute
    await this.modPage.hasElement(e.unmuteMicButton, 'should join audio with microphone muted');
    await this.modPage.waitAndClick(e.unmuteMicButton);
    await this.modPage.hasElement(e.isTalking, 'moderator should be talking');
    await this.muteButtonCooldown();
    await this.modPage.waitAndClick(e.muteMicButton);
    await this.modPage.wasRemoved(e.isTalking, 'moderator should stop talking.');
    await this.modPage.hasElement(e.wasTalking, 'should stop talking');
    await this.modPage.wasRemoved(e.muteMicButton, 'should be muted');
    await this.modPage.hasElement(e.unmuteMicButton, 'should have the unmute mic button');
    await this.modPage.wasRemoved(e.talkingIndicator, 'talking indicator should disappear', ELEMENT_WAIT_LONGER_TIME);
  }

  async changeAudioInput() {
    if (!this?.modPage) throw new Error('modPage not initialized');

    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
    await this.modPage.hasElement(e.unmuteMicButton, 'should join audio with microphone muted');
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await isAudioItemSelected(this.modPage, e.defaultInputAudioDevice);
    await this.modPage.waitAndClick(e.secondInputAudioDevice);
    await this.modPage.waitAndClick(e.unmuteMicButton);
    await this.modPage.hasElement(e.isTalking, 'should be talking');
    await this.modPage.hasElement(e.muteMicButton, 'should have the mute microphone button displayed');
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await isAudioItemSelected(this.modPage, e.secondInputAudioDevice);
  }

  async keepMuteStateOnRejoin() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    const { listenOnlyMode } = this.modPage.settings || {};

    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
    await ensureUnmuted(this.modPage);
    await this.muteButtonCooldown();
    await this.modPage.waitAndClick(e.muteMicButton);
    await this.modPage.hasElement(e.wasTalking, 'should stopped talking');
    await this.modPage.wasRemoved(e.muteMicButton, 'should be muted');
    await this.modPage.hasElement(e.unmuteMicButton, 'should be muted');
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await this.modPage.waitAndClick(e.leaveAudio);
    await this.modPage.waitAndClick(e.joinAudio);
    if (listenOnlyMode) await this.modPage.waitAndClick(e.microphoneButton);
    await this.modPage.waitAndClick(e.joinEchoTestButton);
    await this.modPage.wasRemoved(e.establishingAudioLabel, 'Audio should be established', ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElement(e.unmuteMicButton, 'should be muted');
  }

  async muteYourselfByTalkingIndicator() {
    if (!this?.modPage) throw new Error('modPage not initialized');

    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
    await ensureUnmuted(this.modPage);
    await this.modPage.waitAndClick(e.talkingIndicator);
    await this.modPage.hasElement(e.wasTalking, 'should stops talking');
    await this.modPage.wasRemoved(e.muteMicButton, 'should be unmuted');
    await this.modPage.hasElement(e.unmuteMicButton, 'should be muted');
    await this.modPage.wasRemoved(e.isTalking, 'should stop talking');
    await this.modPage.wasRemoved(e.talkingIndicator, 'talking indicator should disappear', ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await this.modPage.waitAndClick(e.leaveAudio);
  }

  async muteAnotherUser() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
    await this.modPage.hasElement(e.unmuteMicButton, 'should join audio with microphone muted');
    await this.userPage.waitAndClick(e.joinAudio);
    await this.userPage.joinMicrophone({ shouldUnmute: false });
    await this.userPage.hasElement(e.unmuteMicButton, 'should join audio with microphone muted');
    await this.userPage.waitAndClick(e.unmuteMicButton);
    await this.modPage.waitAndClick(e.isTalking);
    await this.userPage.hasElement(e.unmuteMicButton, 'attendee should be muted');

    const moderatorWasTalkingLocator = this.modPage.page.locator(e.wasTalking).first();
    const userWasTalkingLocator = this.userPage.page.locator(e.wasTalking).last();

    await expect(moderatorWasTalkingLocator).toBeVisible();
    await expect(
      userWasTalkingLocator,
      'should stop displaying isTalking element and display the element with high opacity for the attendee',
    ).toBeVisible();
    await this.userPage.wasRemoved(e.talkingIndicator, 'attendee should be muted', ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.wasRemoved(e.talkingIndicator, 'moderator should be muted');
  }
}
