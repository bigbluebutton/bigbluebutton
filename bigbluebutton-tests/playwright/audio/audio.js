const Page = require('../core/page');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

class Audio extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async joinAudio() {
    await this.waitAndClick(e.listenOnlyButton);
    await this.wasRemoved(e.connectingStatus);
    const parsedSettings = await this.getSettingsYaml();
    const listenOnlyCallTimeout = parseInt(parsedSettings.public.media.listenOnlyCallTimeout);
    await this.waitForSelector(e.leaveAudio, listenOnlyCallTimeout);
    await this.waitForSelector(e.whiteboard);
    return this.hasElement(e.leaveAudio);
  }

  async joinMicrophone() {
    await this.waitAndClick(e.microphoneButton);
    await this.wasRemoved(e.connectingStatus, ELEMENT_WAIT_LONGER_TIME);
    const parsedSettings = await this.getSettingsYaml();
    const listenOnlyCallTimeout = parseInt(parsedSettings.public.media.listenOnlyCallTimeout);
    await this.waitAndClick(e.echoYesButton, listenOnlyCallTimeout);
    await this.waitForSelector(e.whiteboard);
    return this.hasElement(e.isTalking);
  }
}

exports.Audio = Audio;
