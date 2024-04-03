const { test } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const util = require('./util');
const { openSettings } = require('../options/util');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { getSettings } = require('../core/settings');
const { sleep } = require('../core/helpers');

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
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await this.modPage.waitAndClick(e.leaveAudio);
    await util.waitAndClearNotification(this.modPage);
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.waitAndClick(e.listenOnlyButton);
    await this.modPage.wasRemoved(e.establishingAudioLabel);
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
    const { reactionsButton } = getSettings();
    if (!reactionsButton) {
      await this.modPage.waitForSelector(e.whiteboard);
      await this.modPage.hasElement(e.joinAudio);
      await this.modPage.wasRemoved(e.reactionsButton);
      return
    }

    await util.waitAndClearDefaultPresentationNotification(this.modPage);
    await this.modPage.waitAndClick(e.reactionsButton);
    await this.modPage.waitAndClick(e.raiseHandBtn);
    await sleep(1000);
    await this.modPage.waitAndClick(e.reactionsButton);
    await this.modPage.waitAndClick(e.lowerHandBtn);
    await this.modPage.wasRemoved(e.raiseHandRejection);
    await util.checkNotificationText(this.modPage, e.raisingHandToast);
    await this.modPage.hasText(`${e.smallToastMsg}>>nth=0`, e.raisingHandToast);
    await this.modPage.hasText(`${e.smallToastMsg}>>nth=1`, e.loweringHandToast);
  }

  async userJoinNotification(page) {
    await openSettings(page);
    await util.enableUserJoinPopup(page);
    await util.saveSettings(page);
  }
}

exports.Notifications = Notifications;
