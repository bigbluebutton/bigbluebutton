import { expect } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';
import { killConnection } from './util';

export class Reconnection extends MultiUsers {
  async chat() {
    // chat enabled
    await this.modPage.waitForSelector(e.chatBox);
    const chatBoxLocator = this.modPage.page.locator(e.chatBox);
    await expect(chatBoxLocator, 'should the chat box be enabled as soon as the user join').toBeEnabled();

    await killConnection();
    await this.modPage.hasElement(
      e.notificationBannerBar,
      'should the notification bar be displayed after connection lost',
    );

    // chat disabled and notification bar displayed
    await Promise.all([
      expect(chatBoxLocator, 'should the chat box be disabled when the connection lost').toBeDisabled({
        timeout: ELEMENT_WAIT_TIME,
      }),
      this.modPage.hasText(
        e.notificationBannerBar,
        'Reconnection in progress',
        'should the notification bar be displayed with the reconnection message',
      ),
    ]);

    // reconnected -> chat enabled
    await this.modPage.wasRemoved(
      e.notificationBannerBar,
      'notification bar should be removed after reconnecting successfully',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await expect(chatBoxLocator, 'chat box should be enabled again after reconnecting successfully').toBeEnabled();
  }

  async microphone() {
    // join audio
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.joinMicrophone();

    // mute is available
    const muteMicButtonLocator = this.modPage.page.locator(e.muteMicButton);
    await expect(muteMicButtonLocator, 'mute button should be enabled as soon as the user join').toBeEnabled();

    await killConnection();
    await this.modPage.hasElement(
      e.notificationBannerBar,
      'should the notification bar be displayed after connection lost',
    );
    await this.modPage.hasText(
      e.notificationBannerBar,
      'Reconnection in progress',
      'should the notification bar be displayed with the reconnection message',
    );

    // reconnected
    await this.modPage.wasRemoved(
      e.notificationBannerBar,
      'notification bar should be removed after reconnecting successfully',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    // audio connection should keep connected
    await this.modPage.hasElement(e.muteMicButton, 'user audio should keep connected after reconnection');
    await this.modPage.hasElement(e.isTalking, 'user audio should be kept capturing after reconnection');
  }
}
