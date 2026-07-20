import { expect, TestInfo } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';
import { openPrivateChat } from './util';

// Hold back the per-item chat_message_private frames long enough to be deterministic.
const PREVIEW_FRAME_DELAY = ELEMENT_WAIT_TIME;
// The preview must appear well before the delayed per-item frame would arrive.
const PREVIEW_ASSERT_TIMEOUT = Math.floor(ELEMENT_WAIT_TIME * 0.3);

export class PrivateChatListPreview extends MultiUsers {
  // Regression test for issue 25416: the private chats list rendered each item header
  // immediately but gated the message preview behind a separate per-item subscription
  // (chat_message_private). When that subscription resolved a moment later the preview
  // mounted and the item grew, making the list jump.
  //
  // The fix brings the last message into the chats subscription itself (v_chat.lastMessage
  // via a LATERAL join), so the preview is available with the item on the first paint and
  // the per-item subscription is gone.
  //
  // The attendee page routes the graphql WebSocket and delays only the chat_message_private
  // frames. On the pre-fix client the preview is gated by those (now delayed) frames, so the
  // preview text is absent at first paint and this test fails. On the fixed client the preview
  // arrives with the chats subscription (not delayed), so it is present from the first paint.
  async initUserPageWithDelayedPreview(testInfo: TestInfo) {
    const rawPage = await this.context.newPage();
    await rawPage.routeWebSocket(/\/graphql/, (ws) => {
      const server = ws.connectToServer();
      ws.onMessage((message) => server.send(message));
      server.onMessage((message) => {
        const asText = typeof message === 'string' ? message : '';
        if (asText.includes('chat_message_private')) {
          setTimeout(() => ws.send(message), PREVIEW_FRAME_DELAY);
        } else {
          ws.send(message);
        }
      });
    });
    this.userPage = new Page(this.browser, rawPage, testInfo);
    await this.userPage.init(false, { fullName: 'Attendee', meetingId: this.modPage.meetingId });
  }

  async previewRendersAtFirstPaint() {
    // Moderator opens a private chat with the attendee and sends one message.
    await openPrivateChat(this.modPage);
    await this.modPage.hasElement(
      e.hidePrivateChat,
      'should display the hide private chat element when the moderator opens a private chat',
    );
    // prevent a race condition when running on a deployed server
    await this.modPage.page.waitForTimeout(500);
    await this.modPage.fill(e.chatBox, e.message1);
    await this.modPage.waitAndClick(e.sendButton);

    // Attendee opens the private chats list. The item appears from the chats subscription,
    // which (unlike the delayed per-item frames) is not held back.
    await this.userPage.waitAndClick(e.privateChatButton);
    await this.userPage.hasElement(
      e.privateChatItem,
      'should display the private chat item when the attendee receives a private message',
    );

    const chatItem = this.userPage.page.locator(e.privateChatItem).first();

    // The preview text must be present essentially immediately, well before the delayed
    // per-item frame would arrive. On the pre-fix client this window elapses with no preview.
    await expect(
      chatItem.locator(e.privateChatListContent),
      'should render the last message preview at first paint, without waiting for a per-item subscription',
    ).toContainText(e.message1, { timeout: PREVIEW_ASSERT_TIMEOUT });

    // No loading placeholder is rendered: the preview is real from the first paint.
    await expect(
      chatItem.locator('.react-loading-skeleton'),
      'should not render a loading skeleton placeholder in the preview slot',
    ).toHaveCount(0);
  }

  async deletedLastMessageRendersDeletedLabel() {
    // Moderator opens a private chat with the attendee and sends one message.
    await openPrivateChat(this.modPage);
    await this.modPage.hasElement(
      e.hidePrivateChat,
      'should display the hide private chat element when the moderator opens a private chat',
    );
    await this.modPage.page.waitForTimeout(500);
    await this.modPage.fill(e.chatBox, e.message1);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasText(
      e.chatUserMessageText,
      e.message1,
      'should display the message sent by the moderator inside the private chat',
    );

    // Soft-delete the last message (message row is kept with message=NULL and deletedByUserId set).
    const lastMessageItem = this.modPage.page.locator(e.chatMessageItem).last();
    await lastMessageItem.hover();
    await this.modPage.waitAndClick(e.deleteMessageButton);
    await this.modPage.hasElement(e.simpleModal, 'should display the delete message confirmation modal');
    await this.modPage.waitAndClick(e.confirmDeleteChatMessageButton);
    await expect(
      lastMessageItem,
      'should display the deleted label inside the private chat after deleting the last message',
    ).toContainText(`This message has been deleted by ${this.modPage.username}`);

    // Back on the private chats list, the preview slot must show the same deleted label
    // (lastMessage is NULL but lastMessageAt is set), not an empty preview.
    await this.modPage.waitAndClick(e.privateChatBackButton);
    await this.modPage.hasElement(
      e.privateChatItem,
      'should display the private chat item again on the private chats list',
    );
    const chatItem = this.modPage.page.locator(e.privateChatItem).first();
    await expect(
      chatItem.locator(e.privateChatListContent),
      'should render the deleted-message label in the private chat preview slot',
    ).toContainText(`This message has been deleted by ${this.modPage.username}`, { timeout: ELEMENT_WAIT_LONGER_TIME });
  }
}
