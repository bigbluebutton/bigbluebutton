import { expect } from '@playwright/test';

import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';
import { getLastMessageSent, openPublicChat } from './util';

// Body font-size in BBB's chat is 14px, jumbomoji applies font-size: 2.5em → 35px.
// Threshold of 24px sits comfortably between the two (regular ≤ 14, jumbo ≥ 35).
const JUMBO_MIN_PX = 24;

const JUMBO_CASES: ReadonlyArray<[label: string, text: string]> = [
  ['single emoji', '😀'],
  ['three emojis', '😀🎉🚀'],
  ['country flag (regional indicators)', '🇧🇷'],
  ['ZWJ family', '👨‍👩‍👧‍👦'],
  ['heart with VS16', '❤️'],
  ['keycap digit', '1️⃣'],
  ['rainbow flag (ZWJ)', '🏳️‍🌈'],
];

const REGULAR_CASES: ReadonlyArray<[label: string, text: string]> = [
  ['four emojis (above threshold)', '😀🎉🚀✨'],
  ['mixed text + emoji', 'oi 😀'],
  ['plain text', 'mensagem normal sem emoji'],
];

export class Jumbomoji extends MultiUsers {
  async sendAndMeasureFontSize(text: string): Promise<number> {
    await this.modPage.fill(e.chatBox, text);
    await this.modPage.waitAndClick(e.sendButton);
    const lastMessage = await getLastMessageSent(this.modPage);
    await expect(lastMessage, `last message should render text "${text}"`).toBeVisible();
    // The styled wrapper carrying the $jumbomoji prop is data-test="messageContent" (a div).
    // We read its computed font-size and let the inner <p> inherit.
    const container = lastMessage.locator('xpath=ancestor::div[@data-test="messageContent"][1]');
    const fontSize = await container.evaluate((el) => parseFloat(window.getComputedStyle(el).fontSize));
    return fontSize;
  }

  async verifyJumbomoji() {
    await openPublicChat(this.modPage);

    for (const [label, text] of JUMBO_CASES) {
      const px = await this.sendAndMeasureFontSize(text);
      expect(
        px,
        `"${label}" (${text}) should render jumbo (font-size > ${JUMBO_MIN_PX}px, got ${px}px)`,
      ).toBeGreaterThan(JUMBO_MIN_PX);
    }

    for (const [label, text] of REGULAR_CASES) {
      const px = await this.sendAndMeasureFontSize(text);
      expect(
        px,
        `"${label}" (${text}) should render regular (font-size ≤ ${JUMBO_MIN_PX}px, got ${px}px)`,
      ).toBeLessThanOrEqual(JUMBO_MIN_PX);
    }
  }
}
