const { test } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const util = require('./util');
const { openSettings } = require('../settings/util');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { getSettings } = require('../core/settings');

class Notifications extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async saveSettingsNotification() {
    await util.waitAndClearDefaultPresentationNotification(this.modPage);
    await openSettings(this.modPage);
    await util.saveSettings(this.modPage);
    await util.checkNotificationText(this.modPage, e.savedSettingsToast);
  }

  async audioNotification() {
    await util.waitAndClearDefaultPresentationNotification(this.modPage);
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.joinMicrophone();
    await util.checkNotificationText(this.modPage, e.joinAudioToast);
    await util.checkNotificationIcon(this.modPage, e.unmuteIcon);
    await util.waitAndClearNotification(this.modPage);
    await this.modPage.waitAndClick(e.leaveAudio);
    await util.waitAndClearNotification(this.modPage);
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.waitAndClick(e.listenOnlyButton);
    await this.modPage.wasRemoved(e.connecting);
    await util.checkNotificationText(this.modPage, e.joinAudioToast);
    await util.checkNotificationIcon(this.modPage, e.listenOnlyIcon);
  }

  async getUserJoinPopupResponse() {
    await util.waitAndClearDefaultPresentationNotification(this.modPage);
    await this.userJoinNotification(this.modPage);
    await util.waitAndClearNotification(this.modPage);
    await this.initUserPage();
    await this.modPage.waitForSelector(e.smallToastMsg, ELEMENT_WAIT_LONGER_TIME);
    await util.checkNotificationText(this.modPage, e.attendeeJoinedToast);
  }

  async raiseAndLowerHandNotification() {
    const { raiseHandButton } = getSettings();
    test.fail(!raiseHandButton, 'Raise/lower hand button is disabled');

    await util.waitAndClearDefaultPresentationNotification(this.modPage);
    await this.modPage.waitAndClick(e.raiseHandBtn);
    await this.modPage.waitForSelector(e.smallToastMsg);
    await util.checkNotificationText(this.modPage, e.raisingHandToast);
    await util.waitAndClearNotification(this.modPage);
    await this.modPage.waitAndClick(e.lowerHandBtn);
    await util.checkNotificationText(this.modPage, e.loweringHandToast);
  }

  async userJoinNotification(page) {
    await openSettings(page);
    await util.enableUserJoinPopup(page);
    await util.saveSettings(page);
  }
}

exports.Notifications = Notifications;
