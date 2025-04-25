const { MultiUsers } = require("../user/multiusers");
const util = require('./util');
const e = require('../core/elements');
const { sleep } = require("../core/helpers");
const { expect } = require("playwright/test");

class ChatNotifications extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async publicChatNotification() {
    await this.modPage.closeAllToastNotifications();
    await this.userPage.closeAllToastNotifications();
    await this.modPage.waitAndClick(e.settingsSidebarButton);
    await util.enableChatPopup(this.modPage);
    await this.modPage.waitAndClick(e.saveSettingsButton);
    await this.modPage.closeAllToastNotifications();
    await sleep(1000);
    await util.publicChatMessageToast(this.modPage, this.userPage);
    await this.modPage.waitAndClick(e.chatTitle);
    await this.modPage.hasNotificationIcon(e.messagesSidebarButton, 'should display the notification icon on the messages button');
    await util.checkNotificationText(this.modPage, e.publicChatToast);
  }

  async privateChatNotification() {
    await this.modPage.closeAllToastNotifications();
    await this.userPage.closeAllToastNotifications();
    await this.modPage.waitAndClick(e.settingsSidebarButton);
    await util.enableChatPopup(this.modPage);
    await this.modPage.waitAndClick(e.saveSettingsButton);
    await this.modPage.closeAllToastNotifications();
    await sleep(2000);
    await util.privateChatMessageToast(this.userPage);
    await this.modPage.hasElement(e.smallToastMsg, 'should the small toast message with the new text sent on the private chat');
    await this.modPage.hasNotificationIcon(e.messagesSidebarButton, 'should display the notification icon on the messages button');
    await util.checkNotificationText(this.modPage, e.privateChatToast);
  }
}

exports.ChatNotifications = ChatNotifications;
