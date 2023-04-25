const Page = require('../core/page');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { connectMicrophone, isAudioItemSelected } = require('./util');

class Audio extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async joinAudio() {
    const { autoJoinAudioModal, listenOnlyCallTimeout } = this.settings;
    if (!autoJoinAudioModal) await this.waitAndClick(e.joinAudio);
    await this.waitAndClick(e.listenOnlyButton);
    await this.waitForSelector(e.establishingAudioLabel);
    await this.wasRemoved(e.establishingAudioLabel, ELEMENT_WAIT_LONGER_TIME);
    await this.waitForSelector(e.leaveListenOnly, listenOnlyCallTimeout);
    await this.waitAndClick(e.audioDropdownMenu);
    await this.hasElement(e.leaveAudio);
  }

  async joinMicrophone() {
    await connectMicrophone(this);
    await this.hasElement(e.muteMicButton);
    await this.waitAndClick(e.audioDropdownMenu);
    await this.hasElement(e.leaveAudio);
  }

  async muteYourselfByButton() {
    await connectMicrophone(this);
    await this.waitAndClick(e.muteMicButton);
    await this.wasRemoved(e.isTalking);
    await this.hasElement(e.wasTalking);
    await this.wasRemoved(e.muteMicButton);
    await this.hasElement(e.unmuteMicButton);
    await this.wasRemoved(e.talkingIndicator, ELEMENT_WAIT_LONGER_TIME);
  }

  async changeAudioInput() {
    await connectMicrophone(this);
    await this.waitAndClick(e.audioDropdownMenu);
    await isAudioItemSelected(this, e.defaultInputAudioDevice);
    await this.waitAndClick(e.secondInputAudioDevice);
    await this.hasElement(e.isTalking);
    await this.hasElement(e.muteMicButton);
    await this.waitAndClick(e.audioDropdownMenu);
    await isAudioItemSelected(this, e.secondInputAudioDevice);
  }

  async keepMuteStateOnRejoin() {
    await connectMicrophone(this);
    await this.waitAndClick(e.muteMicButton);
    await this.hasElement(e.wasTalking);
    await this.wasRemoved(e.muteMicButton);
    await this.hasElement(e.unmuteMicButton);
    await this.waitAndClick(e.audioDropdownMenu);
    await this.waitAndClick(e.leaveAudio);
    await this.waitAndClick(e.joinAudio);
    await this.waitAndClick(e.microphoneButton);
    await this.waitAndClick(e.joinEchoTestButton);
    await this.waitForSelector(e.establishingAudioLabel);
    await this.wasRemoved(e.establishingAudioLabel, ELEMENT_WAIT_LONGER_TIME);
    await this.hasElement(e.unmuteMicButton);
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
