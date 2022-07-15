const Page = require('../core/page');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } = require('../core/constants');

class Audio extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async joinAudio() {
    const { autoJoinAudioModal, listenOnlyCallTimeout } = this.settings;
    if (!autoJoinAudioModal) await this.waitAndClick(e.joinAudio);
    await this.waitAndClick(e.listenOnlyButton);
    await this.wasRemoved(e.establishingAudioLabel);
    await this.waitForSelector(e.leaveListenOnly, listenOnlyCallTimeout);
    await this.waitAndClick(e.audioDropdownMenu);
    await this.hasElement(e.leaveAudio);
  }

  async joinMicrophone() {
    const {
      autoJoinAudioModal,
      skipEchoTest,
      skipEchoTestOnJoin,
    } = this.settings;

    if (!autoJoinAudioModal) await this.waitAndClick(e.joinAudio);
    await this.waitAndClick(e.microphoneButton);
    const shouldSkipEchoTest = skipEchoTest || skipEchoTestOnJoin;
    if (!shouldSkipEchoTest) {
      await this.waitForSelector(e.stopHearingButton);
      await this.waitAndClick(e.joinEchoTestButton);
      await this.waitForSelector(e.establishingAudioLabel);
      await this.wasRemoved(e.establishingAudioLabel, ELEMENT_WAIT_LONGER_TIME);
    }
    await this.hasElement(e.isTalking);
    await this.hasElement(e.muteMicButton);
    await this.waitAndClick(e.audioDropdownMenu);
    await this.hasElement(e.leaveAudio);
  }
}

exports.Audio = Audio;
