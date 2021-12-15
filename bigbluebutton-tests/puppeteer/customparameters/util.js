const path = require('path');
const e = require('../core/elements');
const c = require('./constants');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { checkElementLengthEqualTo, checkElementLengthDifferentTo, checkElementText, checkElement } = require('../core/util');

async function autoJoinTest(test) {
  try {
    const resp = await test.page.evaluate(checkElementLengthEqualTo, e.audioModal, 0);
    return resp === true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function listenOnlyMode(test) {
  // maybe not used
  try {
    const resp = await test.page.evaluate(async (connectionSelector, echoYesButton) => {
      await document.querySelectorAll(connectionSelector)[0];
      return document.querySelectorAll(echoYesButton).length !== 0;
    }, e.connectingStatus, e.echoYesButton);
    return resp === true;
  } catch (err) {
    console.log(err);
  }
}

async function forceListenOnly(test) {
  try {
    const checkEchoYes = await test.page.evaluate(checkElementLengthEqualTo, e.echoYesButton, 0);
    if (!checkEchoYes) return false;
    const resp = await test.page.evaluate(checkElementText, e.toastContainer, 'You have joined the audio conference');

    return resp === true;
  } catch (err) {
    console.log(err);
    return false
  }
}

async function skipCheck(test) {
  // maybe not used
  try {
    await test.waitForSelector(e.toastContainer);
    const resp1 = await test.page.evaluate(checkElementLengthDifferentTo, e.toastContainer, 0);
    await test.waitForSelector(e.muteMicrophoneBtn);
    const resp2 = await test.page.evaluate(checkElementLengthDifferentTo, e.muteMicrophoneBtn, 0);
    return resp1 === true && resp2 === true;
  } catch (err) {
    console.log(err);
    return false;
  }
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
    await test.page.evaluate((zoomIn) => {
      setInterval(() => {
        document.querySelector(zoomIn).scrollBy(0, 10);
      }, 100);
    }, e.zoomIn);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function zoomOut(test) {
  try {
    await test.page.evaluate((zoomIn) => {
      setInterval(() => {
        document.querySelector(zoomIn).scrollBy(10, 0);
      }, 100);
    }, e.zoomIn);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function poll(page1, page2) {
  try {
    await page1.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await page1.waitAndClick(e.actions);
    await page1.waitAndClick(e.polling);
    await page1.waitAndClick(e.pollYesNoAbstentionBtn);
    await page1.waitAndClick(e.startPoll);
    await page2.waitForSelector(e.pollingContainer);
    await page2.waitAndClick(e.yesBtn);
    await page1.waitAndClick(e.publishPollingLabel);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function previousSlide(test) {
  try {
    await test.waitAndClick(e.prevSlide);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function nextSlide(test) {
  try {
    await test.waitAndClick(e.nextSlide);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function annotation(test) {
  await test.waitAndClick(e.tools);
  await test.waitAndClick(e.pencil);
  await test.waitAndClick(e.whiteboard);
  const annoted = await test.page.evaluate((whiteboard) => {
    return document.querySelectorAll(`${whiteboard} > g > g`)[1].innerHTML !== '';
  }, e.whiteboard);
  return annoted === true;
}

async function presetationUpload(test) {
  try {
    await test.waitAndClick(e.actions);
    await test.waitAndClick(e.uploadPresentation);
    const elementHandle = await test.page.$(e.fileUpload);
    await elementHandle.uploadFile(path.join(__dirname, `../media/${e.pdfFileName}.pdf`));
    await test.waitAndClick(e.confirmBtn);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

function encodeCustomParams(param) {
  try {
    let splited = param.split('=');
    splited[1] = encodeURIComponent(splited[1]).replace(/%20/g, '+');
    return splited.join('=');
  } catch (err) {
    console.log(err);
  }
}

function getAllShortcutParams() {
  const getParams = (shortcutArray) => {
    return Object.values(shortcutArray.map(e => `"${e.param}"`));
  }
  return c.shortcuts.replace('$', [...getParams(c.initialShortcuts), ...getParams(c.laterShortcuts)]);
}

async function checkAccesskey(test, key) {
  return test.page.evaluate(checkElement, `[accesskey="${key}"]`);
}

async function checkShortcutsArray(test, shortcut) {
  for (const { param, key } of shortcut) {
    const resp = await checkAccesskey(test, key);
    if (!resp) {
      await test.logger(`${param} shortcut failed`)
      return false;
    }
  }
  return true;
}

exports.zoomIn = zoomIn;
exports.zoomOut = zoomOut;
exports.poll = poll;
exports.previousSlide = previousSlide;
exports.nextSlide = nextSlide;
exports.annotation = annotation;
exports.presetationUpload = presetationUpload;
exports.hexToRgb = hexToRgb;
exports.autoJoinTest = autoJoinTest;
exports.listenOnlyMode = listenOnlyMode;
exports.forceListenOnly = forceListenOnly;
exports.skipCheck = skipCheck;
exports.encodeCustomParams = encodeCustomParams;
exports.getAllShortcutParams = getAllShortcutParams;
exports.checkAccesskey = checkAccesskey;
exports.checkShortcutsArray = checkShortcutsArray;
