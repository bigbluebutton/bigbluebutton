import { elements as e } from '../core/elements';
import { openSettings } from '../options/util';
import { MultiUsers } from '../user/multiusers';
import * as util from './util';

export class ChatNotifications extends MultiUsers {
  async publicChatNotification() {
    await openSettings(this.modPage);
    await util.enableChatPopup(this.modPage);
    await util.saveSettings(this.modPage);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.page.waitForTimeout(1000);
    await util.publicChatMessageToast(this.modPage, this.userPage);
    await this.modPage.waitAndClick(e.chatTitle);
    await this.modPage.hasElement(e.smallToastMsg, 'should appear the new toast message notification');
    await this.modPage.hasElement(
      e.hasUnreadMessages,
      'should appear the unread messages notification on the public chat button',
    );
    await util.checkNotificationText(this.modPage, e.publicChatToast);
  }

  async privateChatNotification() {
    await openSettings(this.modPage);
    await util.enableChatPopup(this.modPage);
    await util.saveSettings(this.modPage);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.page.waitForTimeout(2000);
    await util.privateChatMessageToast(this.userPage);
    await this.modPage.hasElement(
      e.smallToastMsg,
      'should the small toast message with the new text sent on the private chat',
    );
    await this.modPage.hasElement(
      e.hasUnreadMessages,
      'should the notification on the public chat button appear with a number of messages sent and not read',
    );
    await util.checkNotificationText(this.modPage, e.privateChatToast);
  }
}
