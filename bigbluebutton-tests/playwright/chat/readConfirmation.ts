import { expect, Locator } from '@playwright/test';

import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';
import { openPrivateChat } from './util';

// Sub-pixel tolerance for rounding of fractional layout boxes.
const MAX_INTERSECTION_PX = 0.5;

async function hoverMessageText(message: Locator) {
  await message.locator(e.chatUserMessageText).hover();
}

async function intersection(a: Locator, b: Locator) {
  const boxA = await a.boundingBox();
  const boxB = await b.boundingBox();
  if (!boxA || !boxB) throw new Error('both elements should be rendered to measure their intersection');
  const width = Math.min(boxA.x + boxA.width, boxB.x + boxB.width) - Math.max(boxA.x, boxB.x);
  const height = Math.min(boxA.y + boxA.height, boxB.y + boxB.height) - Math.max(boxA.y, boxB.y);
  return { width: Math.max(0, width), height: Math.max(0, height) };
}

// Samples the lower half of the check (the side facing the hover footer) and
// returns the points where another element is painted on top of it.
async function coveredPointsOnLowerHalf(readCheck: Locator) {
  return readCheck.evaluate((check) => {
    const box = check.getBoundingClientRect();
    const covered: string[] = [];
    [0.2, 0.5, 0.8].forEach((fx) => {
      [0.6, 0.8, 0.95].forEach((fy) => {
        const x = box.x + box.width * fx;
        const y = box.y + box.height * fy;
        const top = document.elementFromPoint(x, y);
        if (!top || !check.contains(top)) {
          covered.push(`(${x.toFixed(1)}, ${y.toFixed(1)}) by <${top?.tagName.toLowerCase()}>`);
        }
      });
    });
    return covered;
  });
}

async function expectReadCheckClearOf(message: Locator, labelSelector: string, labelName: string) {
  const readCheck = message.locator(e.chatMessageReadConfirmation);
  const label = message.locator(labelSelector);
  await expect(label, `should display the message ${labelName} when hovering the message`).toBeVisible();
  const { width, height } = await intersection(readCheck, label);
  expect(
    Math.min(width, height),
    `read check and message ${labelName} should not overlap (got ${width.toFixed(2)}x${height.toFixed(2)}px)`,
  ).toBeLessThanOrEqual(MAX_INTERSECTION_PX);
  expect(await coveredPointsOnLowerHalf(readCheck), 'no element should be painted over the read check').toEqual([]);
}

export class ReadConfirmation extends MultiUsers {
  async verifyReadCheckDoesNotOverlapMessageTime() {
    await openPrivateChat(this.modPage);
    await this.modPage.hasElement(
      e.hidePrivateChat,
      'should display the hide private chat element when opening a private chat',
    );
    const messages = this.modPage.page
      .locator(e.chatMessageItem)
      .filter({ has: this.modPage.page.locator(e.chatMessageContent) });
    // two messages in a row: only the second one renders the hover footer with the time
    await this.modPage.fill(e.chatBox, e.message1);
    await this.modPage.waitAndClick(e.sendButton);
    await expect(messages.last(), 'should display the first message sent').toContainText(e.message1);
    await this.modPage.fill(e.chatBox, e.message2);
    await this.modPage.waitAndClick(e.sendButton);
    await expect(messages.last(), 'should display the second message sent').toContainText(e.message2);
    // the recipient opening the private chat marks the messages as read
    await this.userPage.waitAndClick(e.privateChatButton);
    await this.userPage.waitAndClick(e.privateChatItem);
    await this.userPage.hasElement(
      e.hidePrivateChat,
      'should display the hide private chat element when opening a private chat',
    );

    const firstMessage = messages.nth(0);
    const secondMessage = messages.nth(1);
    await expect(
      secondMessage.locator(e.chatMessageReadConfirmation),
      'should display the read check after the recipient reads the message',
    ).toBeVisible();

    // first message carries the time in its header: no hover footer to collide with
    await hoverMessageText(firstMessage);
    await expect(firstMessage.locator(e.chatMessageReadConfirmation)).toBeVisible();
    await expect(firstMessage.locator(e.chatMessageFooterTime)).toHaveCount(0);

    await hoverMessageText(secondMessage);
    await expectReadCheckClearOf(secondMessage, e.chatMessageFooterTime, 'time');

    // edited message: the footer grows with the "Edited" label
    await secondMessage.locator(e.editMessageButton).click();
    await this.modPage.hasElement(
      e.chatEditingWarningContainer,
      'should display the message editing warning container',
    );
    await this.modPage.fill(e.chatBox, e.message1);
    await this.modPage.waitAndClick(e.sendButton);
    await expect(secondMessage, 'should display the edited message').toContainText(e.message1);
    await expect(secondMessage.locator(e.chatMessageReadConfirmation)).toBeVisible();
    await hoverMessageText(secondMessage);
    await expectReadCheckClearOf(secondMessage, e.chatMessageFooterTime, 'time');
    await expectReadCheckClearOf(secondMessage, e.chatMessageFooterEditedLabel, 'edited label');
  }
}
