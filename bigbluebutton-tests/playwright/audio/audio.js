const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { connectMicrophone, isAudioItemSelected } = require('./util');
const { MultiUsers } = require('../user/multiusers');
const { generateSettingsData } = require('../core/settings');
const { expect } = require('@playwright/test');
const { sleep } = require('../core/helpers');


class Audio extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async muteButtonCooldown() {
    // cooldown based on the debounce time set in input-stream-live-selector/service.ts
    await sleep(500);
  }

  async joinAudio() {
    this.modPage.settings = await generateSettingsData(this.modPage);
    const { autoJoinAudioModal, listenOnlyCallTimeout } = this.modPage.settings;
    if (!autoJoinAudioModal) await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.waitAndClick(e.listenOnlyButton);
    await this.modPage.waitForSelector(e.establishingAudioLabel);
    await this.modPage.wasRemoved(e.establishingAudioLabel, 'should have audio established', ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElement(e.unmuteMicButton, 'should display the unmute button when user joins successfully in listen only mode', listenOnlyCallTimeout);
    await this.modPage.waitAndClick(e.unmuteMicButton);
    await this.modPage.hasElement(e.audioModal, 'should display the audio modal (echo test) when user clicks on the unmute button');
    await this.modPage.hasElement(e.joinEchoTestButton, 'should display the audio modal (echo test) join button');
    await this.modPage.hasElement(e.stopHearingButton, 'should display the audio modal (echo test) stop hearing button');
    await this.modPage.waitAndClick(e.closeModal);
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await this.modPage.waitAndClick(e.leaveAudio);
  }

  async joinMicrophone() {
    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
    await this.modPage.hasElement(e.unmuteMicButton, 'should join audio with microphone muted');
    await this.modPage.waitAndClick(e.unmuteMicButton);
    await this.modPage.hasElement(e.isTalking, 'should display the is talking element when user unmute the microphone');
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await this.modPage.hasElement(e.leaveAudio, 'should display the leave audio button in the audio dropdown menu');
    await this.modPage.waitAndClick(e.leaveAudio);
  }

  async muteYourselfByButton() {
    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
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
    await this.muteButtonCooldown();
    await this.modPage.waitAndClick(e.unmuteMicButton);
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await this.modPage.waitAndClick(e.leaveAudio);
  }

  async changeAudioInput() {
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
    await this.modPage.waitAndClick(e.leaveAudio);
  }

  async keepMuteStateOnRejoin() {
    const { listenOnlyMode } = this.modPage.settings;
    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
    const isMuted = await this.modPage.checkElement(e.unmuteMicButton);
    if (isMuted) await this.modPage.waitAndClick(e.unmuteMicButton);
    await this.modPage.hasElement(e.isTalking, 'should be talking');
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
    await this.modPage.waitForSelector(e.establishingAudioLabel);
    await this.modPage.wasRemoved(e.establishingAudioLabel, 'Audio should be established', ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElement(e.unmuteMicButton, 'should be muted');
    await this.modPage.waitAndClick(e.unmuteMicButton);
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await this.modPage.waitAndClick(e.leaveAudio);
  }

  async muteYourselfByTalkingIndicator() {
    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
    const isMuted = await this.modPage.checkElement(e.unmuteMicButton);
    if (isMuted) await this.modPage.waitAndClick(e.unmuteMicButton);
    await this.modPage.hasElement(e.isTalking, 'should be talking');
    await this.modPage.waitAndClick(e.talkingIndicator);
    await this.modPage.hasElement(e.wasTalking, 'should stops talking');
    await this.modPage.wasRemoved(e.muteMicButton, 'should be unmuted');
    await this.modPage.hasElement(e.unmuteMicButton, 'should be muted');
    await this.modPage.wasRemoved(e.isTalking,  'should stop talking');
    await this.modPage.wasRemoved(e.talkingIndicator, 'talking indicator should disappear', ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await this.modPage.waitAndClick(e.leaveAudio);
  }

  async muteAnotherUser() {
    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
    await this.modPage.hasElement(e.unmuteMicButton, 'should join audio with microphone muted');
    await this.userPage.waitAndClick(e.joinAudio);
    await this.userPage.joinMicrophone({ shouldUnmute: false });
    await this.userPage.hasElement(e.unmuteMicButton, 'should join audio with microphone muted');
    await this.userPage.waitAndClick(e.unmuteMicButton);
    await this.modPage.waitAndClick(e.isTalking);
    await this.userPage.hasElement(e.unmuteMicButton, 'attendee should be muted');

    const moderatorWasTalkingLocator = await this.modPage.getLocator(e.wasTalking).first();
    const userWasTalkingLocator = await this.userPage.getLocator(e.wasTalking).last();

    await expect(moderatorWasTalkingLocator).toBeVisible();
    await expect(userWasTalkingLocator, 'should stop displaying isTalking element and display the element with high opacity for the attendee').toBeVisible();
    await this.userPage.wasRemoved(e.talkingIndicator, 'attendee should be muted', ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.wasRemoved(e.talkingIndicator, 'moderator should be muted');
  }
}

exports.Audio = Audio;
