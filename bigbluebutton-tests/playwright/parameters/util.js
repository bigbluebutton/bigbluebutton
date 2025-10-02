import { expect } from '@playwright/test';
import { elements as e } from '../core/elements.ts';
import { constants as c } from './constants';
import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants.ts';

export function hexToRgb(hex) {
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

export async function zoomIn(test) {
  try {
    await test.page.evaluate((selector) => {
      setInterval(() => {
        document.querySelector(selector).scrollBy(0, 10);
      }, 100);
    }, e.zoomInBtn);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

export async function zoomOut(test) {
  try {
    await test.page.evaluate((selector) => {
      setInterval(() => {
        document.querySelector(selector).scrollBy(10, 0);
      }, 100);
    }, e.zoomInBtn);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

export async function poll(page1, page2) {
  await page1.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
  await page1.waitAndClick(e.actions);
  await page1.waitAndClick(e.polling);
  await page1.waitAndClick(e.pollYesNoAbstentionBtn);
  await page1.waitAndClick(e.startPoll);
  await page2.waitForSelector(e.pollingContainer);
  await page2.waitAndClickElement(e.pollAnswerOptionBtn);
  await page1.waitAndClick(e.publishPollingLabel);
}

export async function previousSlide(test) {
  await test.waitAndClick(e.prevSlide);
}

export async function nextSlide(test) {
  await test.waitAndClick(e.nextSlide);
}

export async function annotation(test) {
  await test.waitAndClick(e.wbPencilShape);
  await test.waitAndClick(e.whiteboard);
  await test.hasElement(e.wbPencilShape, 'should the presentation displays the tool drawn line');
}

export function encodeCustomParams(param) {
  try {
    const splitted = param.split('=');
    if (splitted.length > 2) {
      const aux = splitted.shift();
      splitted[1] = splitted.join('=');
      splitted[0] = aux;
    }
    splitted[1] = encodeURIComponent(splitted[1]).replace();
    return splitted.join('=');
  } catch (err) {
    console.log(err);
  }
}

export function getAllShortcutParams() {
  const getParams = (shortcutArray) => Object.values(shortcutArray.map((elem) => `"${elem.param}"`));
  return c.shortcuts.replace('$', [...getParams(c.initialShortcuts), ...getParams(c.laterShortcuts)]);
}

export async function checkAccesskey(test, key) {
  return test.checkElement(`[accesskey="${key}"]`);
}

export async function checkShortcutsArray(test, shortcut) {
  for (const { key, param } of shortcut) {
    const resp = await checkAccesskey(test, key);
    await expect.soft(resp, `Shortcut to ${param} (key ${key}) failed`).toBeTruthy();
  }
}
