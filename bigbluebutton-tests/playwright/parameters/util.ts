import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { constants as c } from './constants';

export function hexToRgb(hex: string) {
  // Remove # prefix if present and validate input
  const cleanHex = hex.replace('#', '');

  // Validate hex format (3 or 6 characters)
  if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    throw new Error('Invalid hex color format');
  }

  // Handle 3-character hex (e.g., "F53" -> "FF5533")
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split('')
          .map((char) => char + char)
          .join('')
      : cleanHex;

  const bigint = parseInt(fullHex, 16);
  // eslint-disable-next-line no-bitwise
  const r = (bigint >> 16) & 255;
  // eslint-disable-next-line no-bitwise
  const g = (bigint >> 8) & 255;
  // eslint-disable-next-line no-bitwise
  const b = bigint & 255;

  return `rgb(${r}, ${g}, ${b})`;
}

export async function poll(testPage: Page, testPage2: Page) {
  await testPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
  await testPage.waitAndClick(e.actions);
  await testPage.waitAndClick(e.polling);
  await testPage.waitAndClick(e.pollYesNoAbstentionBtn);
  await testPage.waitAndClick(e.startPoll);
  await testPage2.waitForSelector(e.pollingContainer);
  await testPage2.waitAndClickElement(e.pollAnswerOptionBtn);
  await testPage.waitAndClick(e.publishPollingLabel);
}

export async function previousSlide(testPage: Page) {
  await testPage.waitAndClick(e.prevSlide);
}

export async function nextSlide(testPage: Page) {
  await testPage.waitAndClick(e.nextSlide);
}

export async function annotation(testPage: Page) {
  await testPage.waitAndClick(e.wbPencilShape);
  await testPage.waitAndClick(e.whiteboard);
  await testPage.hasElement(e.wbPencilShape, 'should the presentation displays the tool drawn line');
}

export function encodeCustomParams(param: string): string {
  try {
    const splitted = param.split('=');
    if (!splitted[0] || !splitted[1]) throw new Error('Parameter must be in key=value format');

    if (splitted.length > 2) {
      const aux = splitted.shift();
      splitted[1] = splitted.join('=');
      splitted[0] = aux!;
    }
    splitted[1] = encodeURIComponent(splitted[1]);
    return splitted.join('=');
  } catch (err) {
    throw new Error(`Error encoding custom parameter: ${err}`);
  }
}

export function getAllShortcutParams() {
  const getParams = (shortcutArray: { key: string; param: string }[]) =>
    Object.values(shortcutArray.map((elem) => `"${elem.param}"`));
  return c.shortcuts.replace('$', [...getParams(c.initialShortcuts), ...getParams(c.laterShortcuts)].join(','));
}

export async function checkAccesskey(testPage: Page, key: string) {
  return testPage.checkElement(`[accesskey="${key}"]`);
}

export async function checkShortcutsArray(testPage: Page, shortcut: { key: string; param: string }[]) {
  for (const { key, param } of shortcut) {
    const resp = await checkAccesskey(testPage, key);
    await expect.soft(resp, `Shortcut to ${param} (key ${key}) failed`).toBeTruthy();
  }
}
