import { expect } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { expectAudioReceived } from '../core/rtcStatsProbe';
import { MultiUsers } from '../user/multiusers';
import { awayIndicatorLocator, hasUserListMicState, isTalkingLocator, setAway } from '../user/util';
import {
  areRemoteAudioElementsPlaying,
  connectMicrophone,
  ensureUnmuted,
  getRemoteAudioSinkIds,
  isAudioItemSelected,
  joinMutedMicrophone,
  releaseKeyboardFocus,
} from './util';

// Long enough for an unmute that should not happen to reach the server and show as talking.
const IGNORED_KEY_HOLD_TIME = 3000;

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

  async changeAudioOutput() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    // the attendee talks, so the moderator plays remote audio
    await this.userPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.userPage);
    await ensureUnmuted(this.userPage);
    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
    await expect
      .poll(() => getRemoteAudioSinkIds(this.modPage), { message: 'should play the attendee audio for the moderator' })
      .not.toHaveLength(0);

    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await isAudioItemSelected(this.modPage, e.defaultOutputAudioDevice);
    const secondOutputLabel = (await this.modPage.page.locator(e.secondOutputAudioDevice).innerText()).trim();
    const secondOutputDeviceId = await this.modPage.page.evaluate(
      async (label) =>
        (await navigator.mediaDevices.enumerateDevices()).find(
          (device) => device.kind === 'audiooutput' && device.label === label,
        )?.deviceId,
      secondOutputLabel,
    );
    expect(secondOutputDeviceId, `should find the "${secondOutputLabel}" output device`).toBeTruthy();
    await this.modPage.waitAndClick(e.secondOutputAudioDevice);
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await isAudioItemSelected(this.modPage, e.secondOutputAudioDevice);
    await expect
      .poll(() => getRemoteAudioSinkIds(this.modPage), {
        message: 'should play the remote audio on the chosen output device',
      })
      .toEqual(expect.arrayContaining([secondOutputDeviceId]));
    expect(
      new Set(await getRemoteAudioSinkIds(this.modPage)),
      'should play every remote audio element on the chosen output device',
    ).toEqual(new Set([secondOutputDeviceId]));
    await expect
      .poll(() => areRemoteAudioElementsPlaying(this.modPage), {
        message: 'should keep playing the remote audio after changing the output device',
      })
      .toBe(true);
    await this.modPage.hasElement(e.audioDropdownMenu, 'should stay connected to audio after changing the output');
  }

  async echoTestShowsVolume() {
    if (!this?.modPage) throw new Error('modPage not initialized');

    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.clickMicrophoneButton();
    await this.modPage.hasElement(e.audioSettingsModal, 'should open the echo test in the audio settings');
    await this.modPage.hasElement(e.stopHearingButton, 'should play the microphone back during the echo test');
    await this.modPage.hasElement(
      e.hasVolumeEchoTest,
      'should show the volume of the fake speech during the echo test',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.waitAndClick(e.joinEchoTestButton);
    await this.modPage.wasRemoved(e.audioSettingsModal, 'should close the echo test after joining');
    await this.modPage.hasElement(e.audioDropdownMenu, 'should join audio after the echo test');
  }

  async echoTestNotHeard() {
    if (!this?.modPage) throw new Error('modPage not initialized');

    await this.modPage.hasElement(e.audioModal, 'should open the audio modal on join', ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.modPage.clickMicrophoneButton();
    await this.modPage.hasElement(e.echoYesButton, 'should ask whether the echo is audible', ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.echoNoButton);
    await this.modPage.hasElement(e.audioSettingsModal, 'should open the audio settings when the echo is not heard');
    await this.modPage.hasElement(e.selectMicrophoneButton, 'should offer to change the microphone');
    await this.modPage.hasElement(e.selectSpeakerButton, 'should offer to change the speaker');
    await this.modPage.waitAndClick(e.joinEchoTestButton);
    await this.modPage.hasElement(e.echoYesButton, 'should run the echo test again', ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.echoYesButton);
    await this.modPage.wasRemoved(
      e.audioModal,
      'should close the audio modal once the echo is heard',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.hasElement(e.audioDropdownMenu, 'should join audio once the echo is heard');
    await this.modPage.hasElement(e.unmuteMicButton, 'should join audio with the microphone');
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
    if (listenOnlyMode) await this.modPage.clickMicrophoneButton();
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

  async listenerReceivesSpeech() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
    await this.userPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.userPage);
    await ensureUnmuted(this.modPage);
    await expectAudioReceived(this.userPage.page, 'the attendee should receive the moderator speech');
  }

  async pushToTalk() {
    if (!this?.modPage) throw new Error('modPage not initialized');

    await joinMutedMicrophone(this.modPage);
    await releaseKeyboardFocus(this.modPage);
    await this.modPage.down('m');
    await this.modPage.hasElement(e.muteMicButton, 'should unmute the microphone while M is held');
    await expect(
      isTalkingLocator(this.modPage, this.modPage.username),
      'should show the moderator talking while M is held',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await this.modPage.up('m');
    await this.modPage.hasElement(e.unmuteMicButton, 'should mute the microphone again when M is released');
    await expect(
      isTalkingLocator(this.modPage, this.modPage.username),
      'should stop showing the moderator talking once M is released',
    ).toBeHidden({ timeout: ELEMENT_WAIT_LONGER_TIME });
  }

  async pushToTalkIgnoredInChatInput() {
    if (!this?.modPage) throw new Error('modPage not initialized');

    await joinMutedMicrophone(this.modPage);
    const chatBox = this.modPage.page.locator(e.chatBox);
    await chatBox.focus();
    await this.modPage.down('m');
    await expect(chatBox, 'should type the M into the chat input').toHaveValue('m');
    await this.modPage.page.waitForTimeout(IGNORED_KEY_HOLD_TIME);
    await this.modPage.hasElement(e.unmuteMicButton, 'should keep the microphone muted while M is typed in the chat');
    await expect(
      isTalkingLocator(this.modPage, this.modPage.username),
      'should not show the moderator talking while M is typed in the chat',
    ).toBeHidden();
    await this.modPage.up('m');
    // The same key outside the chat input does unmute, so the hold above was ignored on purpose.
    await chatBox.fill('');
    await releaseKeyboardFocus(this.modPage);
    await this.modPage.down('m');
    await this.modPage.hasElement(e.muteMicButton, 'should unmute with M once the chat input has no focus');
    await this.modPage.up('m');
    await this.modPage.hasElement(e.unmuteMicButton, 'should mute the microphone again when M is released');
  }

  async setAwayWhileTalking() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    const { username } = this.userPage;
    await this.userPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.userPage);
    await ensureUnmuted(this.userPage);
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await setAway(this.userPage);
    await this.userPage.hasElement(e.unmuteMicButton, 'should mute the microphone of a user who goes away');
    await expect(
      this.userPage.page.locator(e.unmuteMicButton),
      'should offer the away user to unmute and become active again',
    ).toHaveAttribute('aria-label', 'Unmute and set yourself active');
    await expect(
      awayIndicatorLocator(this.modPage, username),
      'the moderator should see the attendee away',
    ).toBeVisible();
    await hasUserListMicState(this.modPage, username, 'muted', 'the moderator should see the away attendee muted');
  }

  async setAwayFromProfile() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.modPage.waitAndClick(e.profileSidebarButton);
    await this.modPage.waitAndClick(e.profileStatusDropdown);
    await this.modPage.page.locator(e.profileStatusOption, { hasText: 'Away' }).click();
    await expect(
      this.userPage.page.locator(e.userAwayStatusMessage).last(),
      'should display the away status message to the other participant',
    ).toContainText(`${this.modPage.username} is away`);
    await expect(
      this.modPage.page.locator(e.unmuteMicButton),
      'should be muted with the unmute and set active label while away',
    ).toHaveAttribute('aria-label', 'Unmute and set yourself active');
  }

  async holdPushToTalkKey() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    // push-to-talk ignores key presses while a text field has the focus
    await this.modPage.page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await this.modPage.page.keyboard.down('m');
  }

  async releasePushToTalkKey() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    await this.modPage.page.keyboard.up('m');
    await this.modPage.hasElement(e.unmuteMicButton, 'should be muted after releasing the push-to-talk key');
  }

  async pushToTalkClearsAway({ unmutedBeforeAway }: { unmutedBeforeAway: boolean }) {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
    if (unmutedBeforeAway) await ensureUnmuted(this.modPage);
    await this.setAwayFromProfile();
    const prevAwayMuted = () => this.modPage.page.evaluate(() => window.sessionStorage.getItem('BBB_prevAwayMuted'));
    if (unmutedBeforeAway) {
      expect(await prevAwayMuted(), 'going away should record that it muted the microphone').toBe('true');
    }

    await this.holdPushToTalkKey();
    await this.modPage.hasElement(e.isTalking, 'should open the microphone while the push-to-talk key is held');
    await expect(
      this.userPage.page.locator(e.userAwayStatusMessage).last(),
      'should display the available status message to the other participant while talking',
    ).toContainText(`${this.modPage.username} is available`);

    await this.releasePushToTalkKey();
    await expect(
      this.modPage.page.locator(e.unmuteMicButton),
      'should no longer offer to set the user active after push-to-talk',
    ).toHaveAttribute('aria-label', 'Unmute');
    // a stale flag would unmute the user on a later return from away
    expect(await prevAwayMuted(), 'should clear the flag of the microphone muted by away').not.toBe('true');
  }

  async pushToTalkWhileAvailable() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
    await this.modPage.hasElement(e.unmuteMicButton, 'should join audio with microphone muted');

    await this.holdPushToTalkKey();
    await this.modPage.hasElement(e.isTalking, 'should open the microphone while the push-to-talk key is held');
    await this.releasePushToTalkKey();
    await expect(this.modPage.page.locator(e.unmuteMicButton), 'should keep the regular unmute label').toHaveAttribute(
      'aria-label',
      'Unmute',
    );
    await this.userPage.hasHiddenElementCount(
      e.userAwayStatusMessage,
      0,
      'should not post any away status message when the user was not away',
    );
  }

  async unmuteClearsAway(unmuteFrom: 'button' | 'userList') {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
    await this.setAwayFromProfile();

    if (unmuteFrom === 'button') {
      await this.modPage.waitAndClick(e.unmuteMicButton);
    } else {
      await this.modPage.waitAndClick(e.usersListSidebarButton);
      await this.modPage.waitAndClick(e.currentUser);
      await this.modPage.waitAndClick(e.unmuteUser);
    }
    await this.modPage.hasElement(e.isTalking, 'should open the microphone');
    await expect(
      this.userPage.page.locator(e.userAwayStatusMessage).last(),
      'should display the available status message to the other participant',
    ).toContainText(`${this.modPage.username} is available`);
  }
}
