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

  async userJoinNotification(page) {
    await openSettings(page);
    await util.enableUserJoinPopup(page);
    await util.saveSettings(page);
  }

  async getUserJoinPopupResponse() {
    await this.userJoinNotification(this.modPage);
    await this.initUserPage();
    await this.modPage.waitForSelector(e.smallToastMsg, ELEMENT_WAIT_LONGER_TIME);
    await util.checkNotificationText(this.modPage, e.attendeeJoinedToast);
  }

  async audioNotification() {
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.joinMicrophone();
    await util.checkNotificationText(this.modPage, e.joinAudioToast);
  }
}

exports.Notifications = Notifications;
