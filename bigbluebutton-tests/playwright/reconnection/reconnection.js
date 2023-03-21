const { expect } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const { ELEMENT_WAIT_TIME } = require('../core/constants');
const { killConnection } = require('./util');

class Reconnection extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async chat() {
    // chat enabled
    await this.modPage.waitForSelector(e.chatBox);
    const chatBoxLocator = this.modPage.getLocator(e.chatBox);
    await expect(chatBoxLocator).toBeEnabled();

    killConnection();

    // chat disabled
    await expect(chatBoxLocator).toBeDisabled();

    // reconnected -> chat enabled
    await this.modPage.wasRemoved('//div[@data-test="notificationBannerBar" and contains(text(), "Connecting ...")]');
    await expect(chatBoxLocator).toBeEnabled();
  }

  async mute() {
    // join audio
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.joinMicrophone();

    // mute is available
    const muteMicButtonLocator = this.modPage.getLocator(e.muteMicButton);
    await expect(muteMicButtonLocator).toBeEnabled();

    killConnection();

    // mute button is removed
    await this.modPage.wasRemoved(e.muteMicButton);

    // join audio appears disabled
    const joinAudioLocator = this.modPage.getLocator(e.joinAudio);
    await expect(joinAudioLocator).toBeDisabled();

    // toast notification
    await this.modPage.hasElement('//div[@data-test="toastSmallMsg"]/span[contains(text(), "You have left the audio conference")]');

    // reconnected -> join audio button enabled
    await this.modPage.wasRemoved('//div[@data-test="notificationBannerBar" and contains(text(), "Connecting ...")]');
    await expect(joinAudioLocator).toBeEnabled();
  }
}

exports.Reconnection = Reconnection;
