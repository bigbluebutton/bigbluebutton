const { MultiUsers } = require('../user/multiusers');
const util = require('./util');
const utilPolling = require('../polling/util');
const utilScreenShare = require('../screenshare/util');
const utilPresentation = require('../presentation/util');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME, UPLOAD_PDF_WAIT_TIME } = require('../core/constants');

class Notifications extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  // Save Settings toast notification
  async saveSettingsNotification() {
    await util.popupMenu(this.modPage);
    await util.saveSettings(this.modPage);
    await util.checkNotificationText(this.modPage, e.savedSettingsToast);
  }

  // Public chat toast notification
  async publicChatNotification() {
    await util.popupMenu(this.modPage);
    await util.enableChatPopup(this.modPage);
    await util.saveSettings(this.modPage);
    await util.publicChatMessageToast(this.modPage, this.userPage);
    await this.modPage.waitAndClick(e.chatTitle);
    await this.modPage.waitForSelector(e.smallToastMsg);
    await this.modPage.waitForSelector(e.hasUnreadMessages);
    await util.checkNotificationText(this.modPage, e.publicChatToast);
  }

  // Private chat toast notification
  async privateChatNotification() {
    await util.popupMenu(this.modPage);
    await util.enableChatPopup(this.modPage);
    await util.saveSettings(this.modPage);
    await util.waitAndClearNotification(this.modPage);
    await util.privateChatMessageToast(this.userPage);
    await this.modPage.waitForSelector(e.smallToastMsg);
    await this.modPage.waitForSelector(e.hasUnreadMessages);
    await util.checkNotificationText(this.modPage, e.privateChatToast);
  }

  // User join toast notification
  async userJoinNotification(page) {
    await util.popupMenu(page);
    await util.enableUserJoinPopup(page);
    await util.saveSettings(page);
  }

  async getUserJoinPopupResponse() {
    await this.userJoinNotification(this.modPage);
    await this.initUserPage();
    await this.modPage.waitForSelector(e.smallToastMsg, ELEMENT_WAIT_LONGER_TIME);
    await util.checkNotificationText(this.modPage, 'Attendee joined the session');
  }

  // File upload notification
  async fileUploaderNotification() {
    await utilPresentation.uploadPresentation(this.modPage, e.pdfFileName, UPLOAD_PDF_WAIT_TIME);
  }

  // Publish Poll Results notification
  async publishPollResults() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await utilPolling.startPoll(this.modPage, true);
    await this.modPage.waitForSelector(e.smallToastMsg);
    await util.checkNotificationText(this.modPage, e.pollPublishedToast);
  }

  async screenshareToast() {
    await utilScreenShare.startScreenshare(this.modPage);
    await util.checkNotificationText(this.modPage, e.startScreenshareToast);
    await util.waitAndClearNotification(this.modPage);
    await this.modPage.waitAndClick(e.stopScreenSharing);
    await util.checkNotificationText(this.modPage, e.endScreenshareToast);
  }

  async audioNotification() {
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.joinMicrophone();
    await util.checkNotificationText(this.modPage, e.joinAudioToast);
  }
}

exports.Notifications = Notifications;
