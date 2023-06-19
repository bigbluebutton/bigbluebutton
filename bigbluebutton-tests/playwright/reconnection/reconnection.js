const { expect } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const { killConnection } = require('./util');
const { runScript } = require('../core/util');
const { ELEMENT_WAIT_TIME } = require('../core/constants');

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

    // chat disabled and notification bar displayed
    await Promise.all([
      expect(chatBoxLocator).toBeDisabled({ timeout: ELEMENT_WAIT_TIME }),
      this.modPage.hasElement(e.reconnectingBar),
    ]);

    // reconnected -> chat enabled
    await expect(chatBoxLocator).toBeEnabled();
    await this.modPage.wasRemoved(e.notificationBannerBar);
  }

  async microphone() {
    // join audio
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.joinMicrophone();

    // mute is available
    const muteMicButtonLocator = this.modPage.getLocator(e.muteMicButton);
    await expect(muteMicButtonLocator).toBeEnabled();

    killConnection();
    await this.modPage.hasElement(e.reconnectingBar);

    // reconnected
    await this.modPage.wasRemoved(e.notificationBannerBar);

    // audio connection should keep connected
    await this.modPage.hasElement(e.muteMicButton);
    await this.modPage.hasElement(e.isTalking);
  }

  async checkRootPermission() {
    const checkSudo = await runScript('timeout -k 1 1 sudo id', {
      handleOutput: (output) => output ? true : false
    })
    await expect(checkSudo, 'Sudo failed: need to run this test with root permission (can be fixed by running "sudo -v" and entering the password)').toBeTruthy();
  }
}

exports.Reconnection = Reconnection;
