const { expect } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const { killConnection } = require('./util');
const { ELEMENT_WAIT_TIME } = require('../core/constants');

class Reconnection extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async chat() {
    // chat enabled
    await this.modPage.waitForSelector(e.chatBox);
    const chatBoxLocator = this.modPage.getLocator(e.chatBox);
    await expect(chatBoxLocator, 'should the chat box be enabled as soon as the user join').toBeEnabled();

    killConnection();
    await this.modPage.hasElement(e.notificationBannerBar, 'should the notification bar be displayed after connection lost');

    // chat disabled and notification bar displayed
    await Promise.all([
      expect(chatBoxLocator, 'should the chat box be disabled when the connection lost').toBeDisabled({ timeout: ELEMENT_WAIT_TIME }),
      this.modPage.hasText(e.notificationBannerBar, 'Reconnection in progress'),
    ]);

    // reconnected -> chat enabled
    await expect(chatBoxLocator, 'chat box should be enabled again after reconnecting successfully').toBeEnabled();
    await this.modPage.wasRemoved(e.notificationBannerBar, 'notification bar should be removed after reconnecting successfully');
  }

  async microphone() {
    // join audio
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.joinMicrophone();

    // mute is available
    const muteMicButtonLocator = this.modPage.getLocator(e.muteMicButton);
    await expect(muteMicButtonLocator, 'mute button should be enabled as soon as the user join').toBeEnabled();

    killConnection();
    await this.modPage.hasElement(e.notificationBannerBar, 'should the notification bar be displayed after connection lost');
    await this.modPage.hasText(e.notificationBannerBar, 'Reconnection in progress'),

    // reconnected
    await this.modPage.wasRemoved(e.notificationBannerBar, 'notification bar should be removed after reconnecting successfully');

    // audio connection should keep connected
    await this.modPage.hasElement(e.muteMicButton, 'user audio should keep connected after reconnection');
    await this.modPage.hasElement(e.isTalking, 'user audio should be kept capturing after reconnection');
  }
}

exports.Reconnection = Reconnection;
