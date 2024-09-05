const { MultiUsers } = require("../user/multiusers");
const util = require('./util');
const e = require('../core/elements');
const { openSettings } = require('../options/util');
const { sleep } = require("../core/helpers");

class ChatNotifications extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async publicChatNotification() {
    await openSettings(this.modPage);
    await util.enableChatPopup(this.modPage);
    await util.saveSettings(this.modPage);
    await util.waitAndClearNotification(this.modPage);
    await sleep(1000);
    await util.publicChatMessageToast(this.modPage, this.userPage);
    await this.modPage.waitAndClick(e.chatTitle);
    await this.modPage.hasElement(e.smallToastMsg, 'should appear the new toast message notification');
    await this.modPage.hasElement(e.hasUnreadMessages, 'should appear the unread messages notification on the public chat button');
    await util.checkNotificationText(this.modPage, e.publicChatToast);
  }

  async privateChatNotification() {
    await openSettings(this.modPage);
    await util.enableChatPopup(this.modPage);
    await util.saveSettings(this.modPage);
    await util.waitAndClearNotification(this.modPage);
    await sleep(2000);
    await util.privateChatMessageToast(this.userPage);
    await this.modPage.hasElement(e.smallToastMsg, 'should the small toast message with the new text sent on the private chat');
    await this.modPage.hasElement(e.hasUnreadMessages, 'should the notifcation on the public chat button appear with a number of messages sent and not read');
    await util.checkNotificationText(this.modPage, e.privateChatToast);
  }
}

exports.ChatNotifications = ChatNotifications;
