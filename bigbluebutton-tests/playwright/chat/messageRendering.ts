import { expect, test } from '@playwright/test';

import { elements as e } from '../core/elements';
import { Chat } from './chat';
import { checkLastMessageSent, openPublicChat } from './util';

export class MessageRendering extends Chat {
  async markdownFormatting() {
    await openPublicChat(this.modPage);
    await this.modPage.fill(e.chatBox, e.markdownMessage);
    await this.modPage.waitAndClick(e.sendButton);

    const receivedMessage = this.userPage.page.locator(e.chatUserMessageText).last();
    await expect(receivedMessage.locator(e.chatMessageBold), 'should render the bold text for the attendee').toHaveText(
      'bold text',
    );
    await expect(
      receivedMessage.locator(e.chatMessageItalic),
      'should render the italic text for the attendee',
    ).toHaveText('italic text');
    await expect(
      receivedMessage.locator(e.chatMessageCode),
      'should render the inline code for the attendee',
    ).toHaveText('inline code');
    await expect(receivedMessage, 'should not display the markdown syntax for the attendee').not.toContainText(/[*_`]/);

    const link = receivedMessage.locator(`${e.chatMessageLink}[href="${e.markdownLinkUrl}"]`);
    await expect(link, 'should turn the url into a link for the attendee').toHaveText(e.markdownLinkUrl);
    await expect(link, 'should open the link in a new tab').toHaveAttribute('target', '_blank');
    await expect(link, 'should not give the opened tab access to the meeting page').toHaveAttribute(
      'rel',
      /\bnoopener\b/,
    );
  }

  async htmlPayloadsRenderAsText() {
    const dialogs: string[] = [];
    this.userPage.page.on('dialog', async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.dismiss();
    });

    await openPublicChat(this.modPage);
    for (const [index, payload] of e.htmlPayloadMessages.entries()) {
      await this.modPage.fill(e.chatBox, payload);
      await this.modPage.waitAndClick(e.sendButton);
      await this.userPage.hasElementCount(
        e.chatUserMessageText,
        index + 1,
        'should display each message sent by the moderator for the attendee',
      );
    }
    // an edited message is converted again on the server
    await this.modPage.fill(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await checkLastMessageSent(this.userPage, e.message);
    const lastMessageItem = this.modPage.page.locator(e.chatMessageItem).last();
    await lastMessageItem.hover();
    await lastMessageItem.locator(e.editMessageButton).click();
    await this.modPage.fill(e.chatBox, e.htmlPayloadEditedMessage);
    await this.modPage.waitAndClick(e.sendButton);
    await checkLastMessageSent(this.userPage, e.htmlPayloadEditedMessage);

    const receivedMessages = this.userPage.page.locator(e.chatUserMessageText);
    // the raw HTML payloads are displayed as the text that was typed
    for (const payload of e.htmlPayloadMessages.filter((message) => message.startsWith('<'))) {
      await expect(
        receivedMessages.filter({ hasText: payload }),
        `should display the HTML payload "${payload}" as text for the attendee`,
      ).toHaveCount(1);
    }
    for (const message of await receivedMessages.all()) {
      await message.hover();
    }
    await expect(
      this.userPage.page.locator(e.chatUserMessageText).locator(e.chatMessageInjectedElements),
      'should not create any element from the HTML payloads for the attendee',
    ).toHaveCount(0);

    // the markdown links are kept, without the script urls
    const links = receivedMessages.locator(e.chatMessageLink);
    await expect(links, 'should render only the markdown links for the attendee').toHaveCount(3);
    for (const href of await links.evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href')))) {
      expect(href ?? '', 'should not render a link to a non-http url for the attendee').toMatch(/^(https?:\/\/.*)?$/);
    }

    const payloadRan = await this.userPage.page.evaluate(
      () => (window as unknown as { chatPayloadRan?: number }).chatPayloadRan,
    );
    expect(payloadRan, 'should not run any script from the messages for the attendee').toBeUndefined();
    expect(dialogs, 'should not open any dialog from the messages for the attendee').toHaveLength(0);
  }

  async imageMarkdownNotRendered() {
    const { markdownImageAllowed } = this.modPage.settings || {};
    test.skip(!!markdownImageAllowed, 'chat.markdownImageAllowed is enabled');

    const imageRequests: string[] = [];
    this.userPage.page.on('request', (request) => {
      if (request.url().includes('diagram.png')) imageRequests.push(request.url());
    });

    await openPublicChat(this.modPage);
    await this.modPage.fill(e.chatBox, e.imageMarkdownMessage);
    await this.modPage.waitAndClick(e.sendButton);

    const receivedMessage = this.userPage.page.locator(e.chatUserMessageText).last();
    await expect(receivedMessage, 'should display the text around the image for the attendee').toContainText(
      /look\s+here/,
    );
    await expect(
      this.userPage.page.locator(e.chatMessages).locator(e.chatMessageImage),
      'should not render the image for the attendee',
    ).toHaveCount(0);
    expect(imageRequests, 'should not load the image for the attendee').toHaveLength(0);
  }
}
