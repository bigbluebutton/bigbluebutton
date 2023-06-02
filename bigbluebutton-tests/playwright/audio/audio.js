const Page = require('../core/page');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { connectMicrophone, isAudioItemSelected } = require('./util');
const { MultiUsers } = require('../user/multiusers');
const { getSettings, generateSettingsData } = require('../core/settings');
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
    await this.modPage.wasRemoved(e.establishingAudioLabel, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitForSelector(e.leaveListenOnly, listenOnlyCallTimeout);
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await this.modPage.hasElement(e.leaveAudio);
    await this.modPage.waitAndClick(e.leaveAudio);
  }

  async joinMicrophone() {
    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);

    await this.modPage.hasElement(e.muteMicButton);
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await this.modPage.hasElement(e.leaveAudio);
    await this.modPage.waitAndClick(e.leaveAudio);
  }

  async muteYourselfByButton() {
    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
    
    await this.modPage.waitAndClick(e.muteMicButton);
    await this.modPage.wasRemoved(e.isTalking);
    await this.modPage.hasElement(e.wasTalking);
    await this.modPage.wasRemoved(e.muteMicButton);
    await this.modPage.hasElement(e.unmuteMicButton);
    await this.modPage.wasRemoved(e.talkingIndicator, ELEMENT_WAIT_LONGER_TIME);
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
    await this.modPage.hasElement(e.isTalking);
    await this.modPage.hasElement(e.muteMicButton);
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await isAudioItemSelected(this.modPage, e.secondInputAudioDevice);
    await this.modPage.waitAndClick(e.leaveAudio);
  }

  async keepMuteStateOnRejoin() {
    await this.modPage.waitAndClick(e.joinAudio);
      await connectMicrophone(this.modPage);
    
    await this.modPage.waitAndClick(e.muteMicButton);
    await this.modPage.hasElement(e.wasTalking);
    await this.modPage.wasRemoved(e.muteMicButton);
    await this.modPage.hasElement(e.unmuteMicButton);
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await this.modPage.waitAndClick(e.leaveAudio);
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.waitAndClick(e.microphoneButton);
    await this.modPage.waitAndClick(e.joinEchoTestButton);
    await this.modPage.waitForSelector(e.establishingAudioLabel);
    await this.modPage.wasRemoved(e.establishingAudioLabel, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElement(e.unmuteMicButton);
    await this.modPage.waitAndClick(e.unmuteMicButton);
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await this.modPage.waitAndClick(e.leaveAudio);
  }

  async muteYourselfByTalkingIndicator() {
    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);

    await this.modPage.waitAndClick(e.talkingIndicator);
    await this.modPage.hasElement(e.wasTalking);
    await this.modPage.wasRemoved(e.muteMicButton);
    await this.modPage.hasElement(e.unmuteMicButton);
    await this.modPage.wasRemoved(e.isTalking);
    await this.modPage.wasRemoved(e.talkingIndicator, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await this.modPage.waitAndClick(e.leaveAudio);
  }

  async muteAnotherUser() {
    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
    await this.userPage.waitAndClick(e.joinAudio);
    await this.userPage.joinMicrophone();

    await this.userPage.waitAndClick(e.muteMicButton);
    await this.modPage.waitAndClick(e.isTalking);
    await this.userPage.hasElement(e.unmuteMicButton);

    const moderatorWasTalkingLocator = await this.modPage.getLocator(e.wasTalking).first();
    const userWasTalkingLocator = await this.userPage.getLocator(e.wasTalking).last();

    await expect(moderatorWasTalkingLocator).toBeVisible();
    await expect(userWasTalkingLocator).toBeVisible();
    await this.userPage.wasRemoved(e.talkingIndicator, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.wasRemoved(e.talkingIndicator);
  }
}

exports.Audio = Audio;
