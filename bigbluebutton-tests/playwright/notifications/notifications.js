const { expect } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const util = require('./util');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { sleep } = require('../core/helpers');

class Notifications extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async saveSettingsNotification() {
    await this.modPage.waitAndClick(e.settingsSidebarButton);
    await this.modPage.waitAndClick(e.saveSettingsButton);
    await util.checkNotificationText(this.modPage, e.savedSettingsToast);
  }

  async audioNotification() {
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.joinMicrophone();
    await util.checkNotificationText(this.modPage, e.joinAudioToast);
    await util.checkNotificationIcon(this.modPage, e.unmuteIcon);
    await expect(
      this.modPage.getLocator(e.connectionStatusBtn),
      'should not complain about loss in connection when joining audio'
    ).not.toHaveAttribute('color', 'danger');
    await this.modPage.checkElementCount(e.smallToastMsg, 1, 'should have only one notification displayed');
    await this.modPage.closeAllToastNotifications();
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await this.modPage.waitAndClick(e.leaveAudio);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.waitAndClick(e.listenOnlyButton);
    await this.modPage.wasRemoved(e.establishingAudioLabel, 'should remove establish audio element after joining successfully');
    await util.checkNotificationText(this.modPage, e.joinAudioToast);
    await util.checkNotificationIcon(this.modPage, e.listenOnlyIcon);
  }

  async getUserJoinPopupResponse() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userJoinNotification(this.modPage);
    // close all notifications before checking the join notification
    await this.modPage.closeAllToastNotifications();
    await this.initUserPage();
    await this.modPage.waitForSelector(e.smallToastMsg, ELEMENT_WAIT_LONGER_TIME);
    await util.checkNotificationText(this.modPage, e.attendeeJoinedToast);
  }

  async raiseAndLowerHandNotification() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.raiseHandBtn);
    await sleep(1000);
    await this.modPage.hasElement(e.raiseHandRejection, 'should display raise hand rejection button on toast notification');
    await util.checkNotificationText(this.modPage, e.raisingHandToast);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.waitAndClick(e.lowerHandBtn);
    await this.modPage.wasRemoved(e.raiseHandRejection, 'should remove the toast notification with the raise hand rejection button');
    await util.checkNotificationText(this.modPage, e.loweringHandToast);
  }

  async userJoinNotification(page) {
    await page.waitAndClick(e.settingsSidebarButton);
    await util.enableUserJoinPopup(page);
    await page.waitAndClick(e.saveSettingsButton);
  }
}

exports.Notifications = Notifications;
