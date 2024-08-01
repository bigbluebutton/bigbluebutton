const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { connectMicrophone, isAudioItemSelected } = require('./util');
const { MultiUsers } = require('../user/multiusers');
const { generateSettingsData } = require('../core/settings');
const { expect } = require('@playwright/test');


class Audio extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async joinAudio() {
    this.modPage.settings = await generateSettingsData(this.modPage);
    const { autoJoinAudioModal, listenOnlyCallTimeout } = this.modPage.settings;
    if (!autoJoinAudioModal) await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.waitAndClick(e.listenOnlyButton);
    await this.modPage.waitForSelector(e.establishingAudioLabel);
    await this.modPage.wasRemoved(e.establishingAudioLabel, 'Should have audio established.', ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitForSelector(e.leaveListenOnly, listenOnlyCallTimeout);
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await this.modPage.hasElement(e.leaveAudio, 'Should have the microphone connected.');
    await this.modPage.waitAndClick(e.leaveAudio);
  }

  async joinMicrophone() {
    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);

    await this.modPage.hasElement(e.muteMicButton, 'Should have the microphone connected.');
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await this.modPage.hasElement(e.leaveAudio, 'Should have the microphone connected.');
    await this.modPage.waitAndClick(e.leaveAudio);
  }

  async muteYourselfByButton() {
    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
    
    await this.modPage.hasElement(e.isTalking, 'Moderator should be talking.');
    await this.modPage.waitAndClick(e.muteMicButton);
    await this.modPage.wasRemoved(e.isTalking, 'Moderator should stop talking.');
    await this.modPage.hasElement(e.wasTalking, 'Should stop talking.');
    await this.modPage.wasRemoved(e.muteMicButton, 'Should be muted.');
    await this.modPage.hasElement(e.unmuteMicButton, 'Should have the unmute mic button.');
    await this.modPage.wasRemoved(e.talkingIndicator, 'Talking indicator should disappear', ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.unmuteMicButton);
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await this.modPage.waitAndClick(e.leaveAudio);
  }

  async changeAudioInput() {
    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);

    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await isAudioItemSelected(this.modPage, e.defaultInputAudioDevice);
    await this.modPage.waitAndClick(e.secondInputAudioDevice);
    await this.modPage.hasElement(e.isTalking, 'should be talking.');
    await this.modPage.hasElement(e.muteMicButton, 'should have the mute microphone button displayed.');
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await isAudioItemSelected(this.modPage, e.secondInputAudioDevice);
    await this.modPage.waitAndClick(e.leaveAudio);
  }

  async keepMuteStateOnRejoin() {
    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);

    const isMuted = await this.modPage.checkElement(e.unmuteMicButton);
    if (isMuted) {
      await this.modPage.waitAndClick(e.unmuteMicButton);
      await this.modPage.hasElement(e.isTalking, 'should be talking.');
    }
    await this.modPage.hasElement(e.isTalking, 'should be talking');
    await this.modPage.waitAndClick(e.muteMicButton);
    await this.modPage.hasElement(e.wasTalking, 'should stopped talking');
    await this.modPage.wasRemoved(e.muteMicButton, 'should be muted');
    await this.modPage.hasElement(e.unmuteMicButton, 'should be muted.');
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await this.modPage.waitAndClick(e.leaveAudio);
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.waitAndClick(e.microphoneButton);
    await this.modPage.waitAndClick(e.joinEchoTestButton);
    await this.modPage.waitForSelector(e.establishingAudioLabel);
    await this.modPage.wasRemoved(e.establishingAudioLabel, 'Audio should be established.', ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElement(e.unmuteMicButton, 'should be muted');
    await this.modPage.waitAndClick(e.unmuteMicButton);
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await this.modPage.waitAndClick(e.leaveAudio);
  }

  async muteYourselfByTalkingIndicator() {
    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);

    const isMuted = await this.modPage.checkElement(e.unmuteMicButton);
    if (isMuted) {
      await this.modPage.waitAndClick(e.unmuteMicButton);
      await this.modPage.hasElement(e.isTalking, 'Should be talking');
    }
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
    // tirar o audio do moderator!!!!!
    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
    await this.userPage.waitAndClick(e.joinAudio);
    await this.userPage.joinMicrophone();

    await this.userPage.waitAndClick(e.muteMicButton);
    await this.modPage.waitAndClick(e.isTalking);
    await this.userPage.hasElement(e.unmuteMicButton, 'attendee should be muted');

    const moderatorWasTalkingLocator = await this.modPage.getLocator(e.wasTalking).first();
    const userWasTalkingLocator = await this.userPage.getLocator(e.wasTalking).last();

    await expect(moderatorWasTalkingLocator).toBeVisible();
    await expect(userWasTalkingLocator, 'should stop displaying isTalking element and display the element with high opacity for the attende').toBeVisible();
    await this.userPage.wasRemoved(e.talkingIndicator, 'attende should be muted', ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.wasRemoved(e.talkingIndicator, 'moderator should be muted');
  }
}

exports.Audio = Audio;
