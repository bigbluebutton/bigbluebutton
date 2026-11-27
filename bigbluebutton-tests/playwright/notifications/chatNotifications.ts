import { expect } from '@playwright/test';

import { elements as e } from '../core/elements';
import { getDefaultLocaleValue } from '../core/util';
import { MultiUsers } from '../user/multiusers';
import * as util from './util';

export class ChatNotifications extends MultiUsers {
  async publicChatNotification() {
    await this.modPage.closeAllToastNotifications();
    await this.userPage.closeAllToastNotifications();
    await this.modPage.waitAndClick(e.settingsSidebarButton);
    await util.enableChatPopup(this.modPage);
    await this.modPage.waitAndClick(e.saveSettingsButton);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.page.waitForTimeout(1000);
    await util.publicChatMessageToast(this.modPage, this.userPage);
    await this.modPage.waitAndClick(e.chatTitle);
    await this.modPage.hasNotificationIcon(
      e.publicChatButton,
      'should display the notification icon on the public messages button',
    );
    await util.checkNotificationText(this.modPage, e.publicChatToast);
  }

  async privateChatNotification() {
    await this.modPage.closeAllToastNotifications();
    await this.userPage.closeAllToastNotifications();
    await this.modPage.waitAndClick(e.settingsSidebarButton);
    await util.enableChatPopup(this.modPage);
    await this.modPage.waitAndClick(e.saveSettingsButton);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.page.waitForTimeout(2000);
    await util.privateChatMessageToast(this.userPage);
    await this.modPage.hasElement(
      e.smallToastMsg,
      'should the small toast message with the new text sent on the private chat',
    );
    await this.modPage.hasNotificationIcon(
      e.privateChatButton,
      'should display the notification icon on the private messages button',
    );
    await util.checkNotificationText(this.modPage, e.privateChatToast);

    // the "@" badge on the sidebar button is drawn with CSS, so its state has to be in the name
    const messagesLabel = getDefaultLocaleValue('app.userList.messagesTitle');
    const messagesSidebarButton = this.modPage.page.locator(e.messagesSidebarButton);
    await expect(
      messagesSidebarButton,
      'should announce the unread private message in the messages sidebar button name',
    ).toHaveAttribute(
      'aria-label',
      getDefaultLocaleValue('app.sidebarNavigation.button.ariaLabelWithState')
        .replace('{label}', messagesLabel)
        .replace('{state}', getDefaultLocaleValue('app.sidebarNavigation.button.unreadPrivateMessage')),
    );
    await this.modPage.waitAndClick(e.privateChatButton);
    await this.modPage.waitAndClick(e.privateChatItem);
    await expect(
      messagesSidebarButton,
      'should drop the notification state from the messages sidebar button name once the private chat is read',
    ).toHaveAttribute('aria-label', messagesLabel);
  }
}
