import { expect } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';
import { dragAcrossWhiteboard, viewerDrawsTwoStrokesAndErasesOne } from '../whiteboard/util';
import { type GraphqlSockets, killConnection } from './util';

export const ANNOTATION_HISTORY_STREAM_FIELD = 'pres_annotation_history_curr_stream';

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

  // Regression: after a reconnection the annotation-history stream is subscribed
  // again from the point it was first started at, and the server replays the page
  // history since then. That replay reopened a presentation the presenter had hidden.
  async hiddenPresentationStaysHiddenAfterReconnection(graphqlSockets: GraphqlSockets) {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await viewerDrawsTwoStrokesAndErasesOne(this.modPage, this.userPage);

    await this.modPage.waitAndClick(e.minimizePresentation);
    await this.modPage.wasRemoved(e.presentationContainer, 'should hide the presentation');
    await this.modPage.hasElement(e.restorePresentation, 'should display the restore presentation button');

    const socketsBeforeDrop = graphqlSockets.opened();
    graphqlSockets.drop();
    await expect
      .poll(() => graphqlSockets.opened(), {
        message: 'the presenter should reconnect to graphql',
        timeout: 2 * ELEMENT_WAIT_EXTRA_LONG_TIME,
      })
      .toBeGreaterThan(socketsBeforeDrop);
    await expect
      .poll(() => graphqlSockets.receivedSinceDrop(ANNOTATION_HISTORY_STREAM_FIELD), {
        message: 'the server should replay the annotation history after the reconnection',
        timeout: ELEMENT_WAIT_EXTRA_LONG_TIME,
      })
      .toBe(true);

    // the reopen used to follow the replay at once: keep watching
    await this.modPage.page.waitForTimeout(ELEMENT_WAIT_TIME);
    await this.modPage.hasElement(
      e.restorePresentation,
      'the presentation should still be hidden after the reconnection',
    );
    await this.modPage.wasRemoved(
      e.presentationContainer,
      'should not display the presentation after the reconnection',
    );

    // what happens from here on is a new event and must still restore it;
    // the viewer follows the presenter's hidden presentation, so it restores its own first
    if (await this.userPage.checkElement(e.restorePresentation)) {
      await this.userPage.waitAndClick(e.restorePresentation);
    }
    await this.userPage.waitAndClick(e.wbPencilShape);
    await dragAcrossWhiteboard(this.userPage, 0.4, 0.5);
    await this.modPage.hasElement(
      e.presentationContainer,
      'a new annotation should restore the presentation after the reconnection',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }
}
