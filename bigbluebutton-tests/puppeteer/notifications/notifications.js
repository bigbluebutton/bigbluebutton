const path = require('path');
const MultiUsers = require('../user/multiusers');
const Page = require('../core/page');
const util = require('./util');
const utilPolling = require('../polling/util');
const utilScreenShare = require('../screenshare/util');
const utilPresentation = require('../presentation/util');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME, UPLOAD_PDF_WAIT_TIME, ELEMENT_WAIT_TIME } = require('../core/constants');
const { checkElementTextIncludes } = require('../core/util');

class Notifications extends MultiUsers {
  constructor() {
    super();
    this.page1 = new Page();
    this.page2 = new Page();
    this.page3 = new Page();
    this.page4 = new Page();
  }

  async init(meetingId, testName) {
    await this.page1.init(true, true, testName, 'User1', meetingId);
    await this.page2.init(true, true, testName, 'User2', this.page1.meetingId);
  }

  async initUser3(shouldCloseAudioModal, testFolderName) {
    await this.page3.init(true, shouldCloseAudioModal, testFolderName, 'User3');
  }

  async initUser4(testFolderName) {
    await this.page4.init(true, true, testFolderName, 'User', this.page3.meetingId);
  }

  // Save Settings toast notification
  async saveSettingsNotification(testName) {
    try {
      await this.init(undefined, testName);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-page01-initialized-${testName}`);
      await util.popupMenu(this.page1);
      await this.page1.screenshot(`${testName}`, `02-page01-popupMenu-${testName}`);
      await util.saveSettings(this.page1);
      await this.page1.screenshot(`${testName}`, `03-page01-save-settings-${testName}`);
      const resp = await util.getLastToastValue(this.page1) === e.savedSettingsToast;
      await this.page1.screenshot(`${testName}`, `04-page01-saved-Settings-toast-${testName}`);
      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  // Public chat toast notification
  async publicChatNotification(testName) {
    try {
      await this.init(undefined, testName);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-page01-initialized-${testName}`);
      await util.popupMenu(this.page1);
      await this.page1.screenshot(`${testName}`, `02-page01-popup-menu-${testName}`);
      await util.enableChatPopup(this.page1);
      await this.page1.screenshot(`${testName}`, `03-page01-setting-popup-option-${testName}`);
      await util.saveSettings(this.page1);
      await this.page1.screenshot(`${testName}`, `04-page01-applied-settings-${testName}`);
      const expectedToastValue = await util.publicChatMessageToast(this.page1, this.page2);
      await this.page1.screenshot(`${testName}`, `05-page01-public-chat-message-sent-${testName}`);
      await this.page1.waitAndClick(e.chatTitle);
      await this.page1.waitForSelector(e.smallToastMsg);
      await this.page1.waitForSelector(e.hasUnreadMessages);
      const lastToast = await util.getLastToastValue(this.page1);
      await this.page1.screenshot(`${testName}`, `06-page01-public-chat-toast-${testName}`);
      return expectedToastValue === lastToast;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  // Private chat toast notification
  async privateChatNotification(testName) {
    try {
      await this.init(undefined, testName);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-page01-initialized-${testName}`);
      await util.popupMenu(this.page1);
      await this.page1.screenshot(`${testName}`, `02-page01-popup-menu-${testName}`);
      await util.enableChatPopup(this.page1);
      await this.page1.screenshot(`${testName}`, `03-page01-setting-popup-option-${testName}`);
      await util.saveSettings(this.page1);
      await this.page1.screenshot(`${testName}`, `04-page01-applied-settings-${testName}`);
      const expectedToastValue = await util.privateChatMessageToast(this.page2);
      await this.page1.screenshot(`${testName}`, `05-page01-private-chat-message-sent-${testName}`);
      await this.page1.waitForSelector(e.smallToastMsg);
      await this.page1.waitForSelector(e.hasUnreadMessages);
      const lastToast = await util.getLastToastValue(this.page1);
      await this.page1.screenshot(`${testName}`, `06-page01-public-chat-toast-${testName}`);
      return expectedToastValue === lastToast;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  // User join toast notification
  async userJoinNotification(page) {
    try {
      await util.popupMenu(page);
      await util.enableUserJoinPopup(page);
      await util.saveSettings(page);
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async getUserJoinPopupResponse(testName) {
    try {
      await this.initUser3(true, testName);
      await this.page3.startRecording(testName);
      await this.page3.screenshot(`${testName}`, `01-page03-audio-modal-closed-${testName}`);
      await this.userJoinNotification(this.page3);
      await this.page3.screenshot(`${testName}`, `02-page03-after-user-join-notification-activation-${testName}`);
      await this.initUser4(testName);
      await this.page3.waitForSelector(e.smallToastMsg, ELEMENT_WAIT_LONGER_TIME);
      await this.page3.page.waitForFunction(checkElementTextIncludes,
        { timeout: ELEMENT_WAIT_TIME },
        'body', 'User joined the session'
      );
      await this.page3.screenshot(`${testName}`, `03-page03-user-join-toast-${testName}`);
      return true;
    } catch (err) {
      await this.page3.logger(err);
      return false;
    }
  }

  // File upload notification
  async fileUploaderNotification(testName) {
    try {
      await this.initUser3(true, testName);
      await this.page3.startRecording(testName);
      await this.page3.screenshot(testName, '01-page03-audio-modal-closed');
      await utilPresentation.uploadPresentation(this.page3, e.pdfFileName, UPLOAD_PDF_WAIT_TIME);
      await this.page3.screenshot(testName, '02-page03-presentation-change-toast');

      return true;
    } catch (err) {
      await this.page3.logger(err);
      return false;
    }
  }

  // Publish Poll Results notification
  async publishPollResults(testName) {
    try {
      await this.page3.screenshot(`${testName}`, `01-page03-audio-modal-closed-${testName}`);
      await this.page3.waitForSelector(e.whiteboard);
      await utilPolling.startPoll(this.page3, true);
      await this.page3.screenshot(`${testName}`, `02-page03-started-poll-${testName}`);
      await this.page3.waitForSelector(e.smallToastMsg);
      const resp = await util.getLastToastValue(this.page3);
      await this.page3.screenshot(`${testName}`, `03-page03-poll-toast-${testName}`);
      return resp;
    } catch (err) {
      await this.page3.logger(err);
      return false;
    }
  }

  async audioNotification(testName) {
    try {
      await this.initUser3(false, testName);
      await this.page3.startRecording(testName);
      await this.page3.screenshot(`${testName}`, `01-page03-initialized-${testName}`);
      await this.page3.joinMicrophone();
      await this.page3.screenshot(`${testName}`, `02-page03-joined-microphone-${testName}`);
      const resp = await util.getLastToastValue(this.page3) === e.joinAudioToast;
      await this.page3.screenshot(`${testName}`, `03-page03-audio-toast-${testName}`);
      return resp;
    } catch (err) {
      await this.page3.logger(err);
      return false;
    }
  }

  async screenshareToast(testName) {
    try {
      await this.initUser3(true, testName);
      await this.page3.startRecording(testName);
      await this.page3.screenshot(`${testName}`, `01-page03-audio-modal-closed-${testName}`);
      await utilScreenShare.startScreenshare(this.page3);
      await this.page3.screenshot(`${testName}`, `02-page03-screenshare-started-${testName}`);
      const response = await util.getLastToastValue(this.page3);
      await this.page3.screenshot(`${testName}`, `03-page03-screenshare-toast-${testName}`);
      return response;
    } catch (err) {
      await this.page3.logger(err);
      return false;
    }
  }
}

module.exports = exports = Notifications;