const Page = require('../core/page');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { connectMicrophone, isAudioItemSelected } = require('./util');
const { MultiUsers } = require('../user/multiusers');
const { getSettings, generateSettingsData } = require('../core/settings');


class Audio extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async joinAudio() {
    this.modPage.settings = await generateSettingsData(this.modPage);
    const { autoJoinAudioModal, listenOnlyCallTimeout } = this.modPage.settings;
    if (!autoJoinAudioModal) await this.waitAndClick(e.joinAudio);
    await this.modPage.waitAndClick(e.listenOnlyButton);
    await this.modPage.waitForSelector(e.establishingAudioLabel);
    await this.modPage.wasRemoved(e.establishingAudioLabel, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitForSelector(e.leaveListenOnly, listenOnlyCallTimeout);
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await this.modPage.hasElement(e.leaveAudio);
    await this.modPage.waitAndClick(e.leaveAudio);
  }

  async joinMicrophone() {
    await this.modPage.waitAndClick(e.joinAudio)
    await connectMicrophone(this.modPage);
    await this.modPage.hasElement(e.muteMicButton);
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await this.modPage.hasElement(e.leaveAudio);
    await this.modPage.waitAndClick(e.leaveAudio);
  }

  async muteYourselfByButton() {
    try {
      await connectMicrophone(this.modPage);
    } catch {
      await this.modPage.waitAndClick(e.joinAudio);
      await connectMicrophone(this.modPage);
    }
    
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
    try {
      await connectMicrophone(this.modPage);
    } catch {
      await this.modPage.waitAndClick(e.joinAudio);
      await connectMicrophone(this.modPage);
    }
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
    try {
      await connectMicrophone(this.modPage);
    } catch {
      await this.modPage.waitAndClick(e.joinAudio);
      await connectMicrophone(this.modPage);
    }
    
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
  }

  async muteYourselfByTalkingIndicator() {
    await connectMicrophone(this);
    await this.waitAndClick(e.talkingIndicator);
    await this.hasElement(e.wasTalking);
    await this.wasRemoved(e.muteMicButton);
    await this.hasElement(e.unmuteMicButton);
    await this.wasRemoved(e.isTalking);
    await this.wasRemoved(e.talkingIndicator, ELEMENT_WAIT_LONGER_TIME);
  }
}

exports.Audio = Audio;
