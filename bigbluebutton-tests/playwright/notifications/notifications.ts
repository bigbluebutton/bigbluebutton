import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { isLiveKit } from '../core/livekit';
import { MultiUsers } from '../user/multiusers';
import * as util from './util';

export class Notifications extends MultiUsers {
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
      this.modPage.page.locator(e.connectionStatusBtn),
      'should not complain about loss in connection when joining audio',
    ).not.toHaveAttribute('color', 'danger');
    await this.modPage.hasElementCount(e.smallToastMsg, 1, 'should have only one notification displayed');
    await this.modPage.closeAllToastNotifications();
    await this.modPage.waitAndClick(e.audioDropdownMenu);
    await this.modPage.waitAndClick(e.leaveAudio);
    // LiveKit has no dedicated listen-only mode; skip that path there.
    if (!isLiveKit) {
      await this.modPage.closeAllToastNotifications();
      await this.modPage.waitAndClick(e.joinAudio);
      await this.modPage.waitAndClick(e.listenOnlyButton);
      await this.modPage.wasRemoved(
        e.establishingAudioLabel,
        'should remove establish audio element after joining successfully',
      );
      await util.checkNotificationText(this.modPage, e.joinAudioToast);
      await util.checkNotificationIcon(this.modPage, e.listenOnlyIcon);
    }
  }

  async getUserJoinPopupResponse() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userJoinNotification();
    // close all notifications before checking the join notification
    await this.modPage.closeAllToastNotifications();
    await this.initUserPage();
    await this.modPage.waitForSelector(e.smallToastMsg, ELEMENT_WAIT_LONGER_TIME);
    await util.checkNotificationText(this.modPage, e.attendeeJoinedToast);
  }

  async raiseAndLowerHandNotification() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.waitAndClick(e.raiseHandBtn);
    await this.modPage.page.waitForTimeout(1000);
    await this.modPage.hasElement(
      e.lowerHandUserItem,
      'should display raise hand rejection button on toast notification',
    );
    await util.checkNotificationText(this.modPage, e.raisingHandToast);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.waitAndClick(e.lowerHandBtn);
    await this.modPage.wasRemoved(
      e.lowerHandUserItem,
      'should remove the toast notification with the raise hand rejection button',
    );
    await util.checkNotificationText(this.modPage, e.loweringHandToast);
  }

  async userJoinNotification() {
    await this.modPage.waitAndClick(e.settingsSidebarButton);
    await util.enableUserJoinPopup(this.modPage);
    await this.modPage.waitAndClick(e.saveSettingsButton);
  }

  async userLeaveNotifications() {
    await this.modPage.closeAllToastNotifications();
    // User leaves
    await this.modPage.waitAndClick(e.leaveMeetingDropdown, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElement(e.directLogoutButton, 'should display the leave session button');
    await this.modPage.waitAndClick(e.directLogoutButton, ELEMENT_WAIT_LONGER_TIME);

    // Verify leave notification
    await this.modPage.hasElement(
      e.meetingEndedModal,
      'should display the meeting ended modal',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.hasElement(e.redirectButton, 'should display the redirect button');
  }
}
