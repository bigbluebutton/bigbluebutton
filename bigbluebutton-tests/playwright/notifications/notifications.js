const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const util = require('./util');
const { openSettings } = require('../settings/util');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

class Notifications extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async saveSettingsNotification() {
    await openSettings(this.modPage);
    await util.saveSettings(this.modPage);
    await util.checkNotificationText(this.modPage, e.savedSettingsToast);
  }

  async saveConnectionStatusSettingsNotification() {
    await this.modPage.waitAndClick(e.connectionStatusBtn);
    await this.modPage.waitAndClickElement(e.dataSavingWebcams);
    await this.modPage.waitAndClick(e.closeConnectionStatusModal);
    await util.checkNotificationText(this.modPage, e.savedSettingsToast);
  }

  async audioNotification() {
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.joinMicrophone();
    await util.checkNotificationText(this.modPage, e.joinAudioToast);
    await util.checkNotificationIcon(this.modPage, e.unmuteIcon);
    await util.waitAndClearNotification(this.modPage);
    await this.modPage.waitAndClick(e.leaveAudio);
    await util.waitAndClearNotification(this.modPage);
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.waitAndClick(e.listenOnlyButton);
    await this.modPage.wasRemoved(e.connectingStatus);
    await util.checkNotificationText(this.modPage, e.joinAudioToast);
    await util.checkNotificationIcon(this.modPage, e.listenOnlyIcon);
  }

  async getUserJoinPopupResponse() {
    await this.userJoinNotification(this.modPage);
    await this.initUserPage();
    await this.modPage.waitForSelector(e.smallToastMsg, ELEMENT_WAIT_LONGER_TIME);
    await util.checkNotificationText(this.modPage, e.attendeeJoinedToast);
  }

  async raiseAndLowerHandNotification() {
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
