const path = require('path');
const MultiUsers = require('../user/multiusers');
const Page = require('../core/page');
const params = require('../params');
const util = require('./util');
const utilScreenShare = require('../screenshare/util'); // utils imported from screenshare folder
const ne = require('./elements');
const pe = require('../presentation/elements');
const we = require('../whiteboard/elements');

class Notifications extends MultiUsers {
  constructor() {
    super('notifications');
    this.page1 = new Page();
    this.page2 = new Page();
    this.page3 = new Page();
    this.page4 = new Page();
  }

  async init(meetingId) {
    await this.page1.init(Page.getArgs(), meetingId, { ...params, fullName: 'User1' });
    await this.page1.closeAudioModal();
    await this.page2.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'User2' });
    await this.page2.closeAudioModal();
  }

  async initUser3(arg, meetingId) {
    await this.page3.init(arg, meetingId, { ...params, fullName: 'User3' });
  }

  async initUser4() {
    await this.page4.init(Page.getArgs(), this.page3.meetingId, { ...params, fullName: 'User' }, undefined, undefined);
  }

  // Save Settings toast notification
  async saveSettingsNotification(testName) {
    await this.init(undefined);
    await this.page1.screenshot(`${testName}`, `01-page01-initialized-${testName}`);
    await util.popupMenu(this.page1);
    await this.page1.screenshot(`${testName}`, `02-page01-popupMenu-${testName}`);
    await util.saveSettings(this.page1);
    await this.page1.screenshot(`${testName}`, `03-page01-save-settings-${testName}`);
    const resp = await util.getLastToastValue(this.page1) === ne.savedSettingsToast;
    await this.page1.screenshot(`${testName}`, `04-page01-saved-Settings-toast-${testName}`);
    return resp === true;
  }

  // Public chat toast notification
  async publicChatNotification(testName) {
    await this.init(undefined);
    await this.page1.screenshot(`${testName}`, `01-page01-initialized-${testName}`);
    await util.popupMenu(this.page1);
    await this.page1.screenshot(`${testName}`, `02-page01-popup-menu-${testName}`);
    await util.enableChatPopup(this.page1);
    await this.page1.screenshot(`${testName}`, `03-page01-setting-popup-option-${testName}`);
    await util.saveSettings(this.page1);
    await this.page1.screenshot(`${testName}`, `04-page01-applied-settings-${testName}`);
    const expectedToastValue = await util.publicChatMessageToast(this.page1, this.page2);
    await this.page1.screenshot(`${testName}`, `05-page01-public-chat-message-sent-${testName}`);
    await this.page1.waitForSelector(ne.smallToastMsg);
    await this.page1.waitForSelector(ne.hasUnreadMessages);
    const lastToast = await util.getOtherToastValue(this.page1);
    await this.page1.screenshot(`${testName}`, `06-page01-public-chat-toast-${testName}`);
    return expectedToastValue === lastToast;
  }

  // Private chat toast notification
  async privateChatNotification(testName) {
    await this.init(undefined);
    await this.page1.screenshot(`${testName}`, `01-page01-initialized-${testName}`);
    await util.popupMenu(this.page1);
    await this.page1.screenshot(`${testName}`, `02-page01-popup-menu-${testName}`);
    await util.enableChatPopup(this.page1);
    await this.page1.screenshot(`${testName}`, `03-page01-setting-popup-option-${testName}`);
    await util.saveSettings(this.page1);
    await this.page1.screenshot(`${testName}`, `04-page01-applied-settings-${testName}`);
    const expectedToastValue = await util.privateChatMessageToast(this.page2);
    await this.page1.screenshot(`${testName}`, `05-page01-private-chat-message-sent-${testName}`);
    await this.page1.waitForSelector(ne.smallToastMsg);
    await this.page1.waitForSelector(ne.hasUnreadMessages);
    const lastToast = await util.getOtherToastValue(this.page1);
    await this.page1.screenshot(`${testName}`, `06-page01-public-chat-toast-${testName}`);
    return expectedToastValue === lastToast;
  }

  // User join toast notification
  async userJoinNotification(page) {
    await util.popupMenu(page);
    await util.enableUserJoinPopup(page);
    await util.saveSettings(page);
  }

  async getUserJoinPopupResponse(testName) {
    await this.initUser3(Page.getArgs(), undefined);
    await this.page3.screenshot(`${testName}`, `01-page03-initialized-${testName}`);
    await this.page3.closeAudioModal();
    await this.page3.screenshot(`${testName}`, `02-page03-audio-modal-closed-${testName}`);
    await this.userJoinNotification(this.page3);
    await this.page3.screenshot(`${testName}`, `03-page03-after-user-join-notification-activation-${testName}`);
    await this.initUser4();
    await this.page4.closeAudioModal();
    await this.page3.waitForSelector(ne.smallToastMsg);
    try {
      await this.page3.page.waitForFunction(
        'document.querySelector("body").innerText.includes("User joined the session")',
      );
      await this.page3.screenshot(`${testName}`, `04-page03-user-join-toast-${testName}`);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  // File upload notification
  async fileUploaderNotification(testName) {
    await this.initUser3(Page.getArgs(), undefined);
    await this.page3.screenshot(`${testName}`, `01-page03-initialized-${testName}`);
    await this.page3.closeAudioModal();
    await this.page3.screenshot(`${testName}`, `02-page03-audio-modal-closed-${testName}`);
    await util.uploadFileMenu(this.page3);
    await this.page3.screenshot(`${testName}`, `03-page03-upload-file-menu-${testName}`);
    await this.page3.waitForSelector(pe.fileUpload);
    const fileUpload = await this.page3.page.$(pe.fileUpload);
    await fileUpload.uploadFile(path.join(__dirname, '../media/DifferentSizes.pdf'));
    await this.page3.page.waitForFunction(
      'document.querySelector("body").innerText.includes("To be uploaded ...")',
    );
    await this.page3.page.waitForSelector(pe.upload);
    await this.page3.page.click(pe.upload);
    await this.page3.page.waitForFunction(
      'document.querySelector("body").innerText.includes("Converting file")',
    );
    await this.page3.screenshot(`${testName}`, `04-page03-file-uploaded-and-ready-${testName}`);
    await this.page3.waitForSelector(ne.smallToastMsg);
    await this.page3.waitForSelector(we.whiteboard);
    await this.page3.screenshot(`${testName}`, `05-page03-presentation-changed-${testName}`);
    try {
      await this.page3.page.waitForFunction(
        'document.querySelector("body").innerText.includes("Current presentation")',
      );
      await this.page3.screenshot(`${testName}`, `06-page03-presentation-change-toast-${testName}`);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  // Publish Poll Results notification
  async publishPollResults(testName) {
    await this.initUser3(Page.getArgs(), undefined);
    await this.page3.screenshot(`${testName}`, `01-page03-initialized-${testName}`);
    await this.page3.closeAudioModal();
    await this.page3.screenshot(`${testName}`, `02-page03-audio-modal-closed-${testName}`);
    await this.page3.waitForSelector(we.whiteboard);
    await util.startPoll(this.page3);
    await this.page3.screenshot(`${testName}`, `03-page03-started-poll-${testName}`);
    await this.page3.waitForSelector(ne.smallToastMsg);
    const resp = await util.getLastToastValue(this.page3);
    await this.page3.screenshot(`${testName}`, `04-page03-poll-toast-${testName}`);
    return resp;
  }

  async audioNotification(testName) {
    await this.initUser3(Page.getArgsWithAudio(), undefined);
    await this.page3.screenshot(`${testName}`, `01-page03-initialized-${testName}`);
    await this.page3.joinMicrophone();
    await this.page3.screenshot(`${testName}`, `02-page03-joined-microphone-${testName}`);
    const resp = await util.getLastToastValue(this.page3) === ne.joinAudioToast;
    await this.page3.screenshot(`${testName}`, `03-page03-audio-toast-${testName}`);
    return resp === true;
  }

  async screenshareToast(testName) {
    await this.initUser3(Page.getArgs(), undefined);
    await this.page3.screenshot(`${testName}`, `01-page03-initialized-${testName}`);
    await this.page3.closeAudioModal();
    await this.page3.screenshot(`${testName}`, `02-page03-audio-modal-closed-${testName}`);
    await utilScreenShare.startScreenshare(this.page3);
    await this.page3.screenshot(`${testName}`, `03-page03-screenshare-started-${testName}`);
    const response = await util.getLastToastValue(this.page3);
    await this.page3.screenshot(`${testName}`, `04-page03-screenshare-toast-${testName}`);
    return response;
  }

  async closePages() {
    await this.page3.close();
    await this.page4.close();
  }
}

module.exports = exports = Notifications;
