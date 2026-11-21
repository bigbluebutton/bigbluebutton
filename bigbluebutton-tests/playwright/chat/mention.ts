import { expect } from '@playwright/test';

import { elements as e } from '../core/elements';
import { Chat } from './chat';
import { openPrivateChat, openPublicChat } from './util';

/** The display name initUserPage joins with, and the prefix that narrows the picker down to it. */
const MENTIONED_USER = 'Attendee';
const MENTION_SEARCH = 'Atten';

export class Mention extends Chat {
  async pickMentionFromPicker() {
    await openPublicChat(this.modPage);
    await openPublicChat(this.userPage);

    await this.modPage.type(e.chatBox, '@');
    await this.modPage.hasElement(e.chatMentionPicker, 'should open the mention picker on "@"');
    await this.modPage.hasElement(e.chatMentionFilterHint, 'should hint at filtering while no name has been typed');

    await this.modPage.type(e.chatBox, MENTION_SEARCH);
    await this.modPage.hasElementCount(
      e.chatMentionOption,
      1,
      'should narrow the picker down to the only matching participant',
    );

    await this.modPage.waitAndClick(e.chatMentionOption);
    await this.modPage.wasRemoved(e.chatMentionPicker, 'should close the picker once a name is picked');
    await this.modPage.hasValue(e.chatBox, `@${MENTIONED_USER} `, 'should complete the name the sender picked');

    await this.modPage.type(e.chatBox, 'hello');
    await this.modPage.waitAndClick(e.sendButton);

    await this.modPage.hasElement(
      e.chatMention,
      'should render the mention as a mention, not as plain text, for the sender',
    );
    await this.userPage.hasText(
      e.chatMention,
      `@${MENTIONED_USER}`,
      'should render the mention for the mentioned participant',
    );
  }

  async noPickerOnPrivateChat() {
    await openPrivateChat(this.modPage);
    await this.modPage.hasElement(
      e.hidePrivateChat,
      'should display the hide private chat element when opening a private chat',
    );

    await this.modPage.type(e.chatBox, '@');
    // A private chat has a single addressee, so there is nobody to disambiguate with a mention.
    await this.modPage.wasRemoved(e.chatMentionPicker, 'should not offer the mention picker on a private chat');

    await this.modPage.type(e.chatBox, MENTION_SEARCH);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.wasRemoved(e.chatMention, 'should not resolve a mention on a private chat');
  }

  async mentionSurvivesEdit() {
    await openPublicChat(this.modPage);
    await openPublicChat(this.userPage);

    await this.modPage.type(e.chatBox, '@');
    await this.modPage.type(e.chatBox, MENTION_SEARCH);
    await this.modPage.waitAndClick(e.chatMentionOption);
    await this.modPage.type(e.chatBox, 'before');
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasElement(e.chatMention, 'should render the mention on the message sent');

    const lastMessageItem = this.modPage.page.locator(e.chatMessageItem).last();
    await lastMessageItem.hover();
    await expect(
      lastMessageItem.locator(e.messageToolbar),
      'should display the message toolbar when hovering a message',
    ).toBeVisible();
    await this.modPage.waitAndClick(e.editMessageButton);
    await this.modPage.hasElement(
      e.chatEditingWarningContainer,
      'should display the message editing warning container',
    );

    // The mention text is left alone: editing around it must not downgrade it back to plain text.
    await this.modPage.fill(e.chatBox, `@${MENTIONED_USER} after`);
    await this.modPage.waitAndClick(e.sendButton);

    await this.modPage.hasElement(
      e.chatMessageEditedLabel,
      'should display the message edited label after editing a message',
    );
    await this.modPage.hasText(
      e.chatMention,
      `@${MENTIONED_USER}`,
      'should keep the mention after an edit that leaves its text alone',
    );
    await this.userPage.hasText(
      e.chatMention,
      `@${MENTIONED_USER}`,
      'should keep the mention for the mentioned participant after the edit',
    );
  }
}
