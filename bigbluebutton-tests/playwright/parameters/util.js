const { expect } = require('@playwright/test');
const e = require('../core/elements');
const c = require('./constants');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

async function forceListenOnly(test) {
  await test.wasRemoved(e.echoYesButton);
  await test.hasText(e.toastContainer, e.joiningMessageToast);
}

function hexToRgb(hex) {
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgb(${r}, ${g}, ${b})`;
}

async function zoomIn(test) {
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

async function zoomOut(test) {
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

async function poll(page1, page2) {
  await page1.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
  await page1.waitAndClick(e.actions);
  await page1.waitAndClick(e.polling);
  await page1.waitAndClick(e.pollYesNoAbstentionBtn);
  await page1.waitAndClick(e.startPoll);
  await page2.waitForSelector(e.pollingContainer);
  await page2.waitAndClickElement(e.pollAnswerOptionBtn);
  await page1.waitAndClick(e.publishPollingLabel);
}

async function previousSlide(test) {
  await test.waitAndClick(e.prevSlide);
}

async function nextSlide(test) {
  await test.waitAndClick(e.nextSlide);
}

async function annotation(test) {
  await test.waitAndClick(e.wbPencilShape);
  await test.waitAndClick(e.whiteboard);
  await test.hasElement(e.wbPencilShape, 'should the presentation displays the tool drawn line');
}

function encodeCustomParams(param) {
  try {
    let splitted = param.split('=');
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

function getAllShortcutParams() {
  const getParams = (shortcutArray) => {
    return Object.values(shortcutArray.map(elem => `"${elem.param}"`));
  }
  return c.shortcuts.replace('$', [...getParams(c.initialShortcuts), ...getParams(c.laterShortcuts)]);
}

async function checkAccesskey(test, key) {
  return test.checkElement(`[accesskey="${key}"]`);
}

async function checkShortcutsArray(test, shortcut) {
  for (const { key, param } of shortcut) {
    const resp = await checkAccesskey(test, key);
    await expect.soft(resp, `Shortcut to ${param} (key ${key}) failed`).toBeTruthy();
  }
}

exports.zoomIn = zoomIn;
exports.zoomOut = zoomOut;
exports.poll = poll;
exports.previousSlide = previousSlide;
exports.nextSlide = nextSlide;
exports.annotation = annotation;
exports.hexToRgb = hexToRgb;
exports.forceListenOnly = forceListenOnly;
exports.encodeCustomParams = encodeCustomParams;
exports.getAllShortcutParams = getAllShortcutParams;
exports.checkAccesskey = checkAccesskey;
exports.checkShortcutsArray = checkShortcutsArray;
