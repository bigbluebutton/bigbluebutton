const Page = require('../core/page');
const path = require('path');
const { ELEMENT_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const ne = require('../notifications/elements');
const pe = require('../presentation/elements');
const ce = require('../customparameters/elements');
const we = require('../whiteboard/elements');
const poe = require('../polling/elemens');
const e = require('../core/elements');

async function autoJoinTest(test) {
  try {
    const resp = await test.page.evaluate((audioDialogSelector) => {
      return document.querySelectorAll(audioDialogSelector).length === 0;
    }, e.audioDialog);
    return resp === true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function listenOnlyMode(test) {
  // maybe not used
  try {
    const resp = await test.page.evaluate(async (connectionSelector, echoYes) => {
      await document.querySelectorAll(connectionSelector)[0];
      return await document.querySelectorAll(echoYes).length !== 0;
    }, e.connectingStatus, e.echoYes);
    return resp === true;
  } catch (e) {
    console.log(e);
  }
}

async function forceListenOnly(test) {
  try {
    const resp = await test.page.evaluate((connecting, echoYes, toastSelector) => {
      document.querySelectorAll(connecting)[0];
      if (document.querySelectorAll(echoYes).length > 0) {
        return false;
      }
      return document.querySelectorAll(toastSelector)[0].innerText === 'You have joined the audio conference';
    }, e.connectingStatus, e.echoYes, ce.toastContainer);
    return resp === true;
  } catch (e) {
    console.log(e);
    return false
  }
}

async function skipCheck(test) {
  // maybe not used
  try {
    await test.waitForSelector(ce.toastContainer, ELEMENT_WAIT_TIME);
    const resp1 = await test.page.evaluate(countTestElements, e.toastContainer);
    await test.waitForSelector(ce.muteBtn, ELEMENT_WAIT_TIME);
    const resp2 = await test.page.evaluate(countTestElements, ce.muteBtn);
    return resp1 === true && resp2 === true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function countTestElements(element) {
  return document.querySelectorAll(element).length !== 0;
}

async function getTestElement(element) {
  return document.querySelectorAll(element).length === 0;
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
  } catch (e) {
    console.log(e);
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
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function poll(page1, page2) {
  try {
    await page1.page.waitForSelector(ce.whiteboard, { visible: true, timeout: ELEMENT_WAIT_LONGER_TIME });
    await page1.click(e.actions);
    await page1.waitForSelector(ne.polling, ELEMENT_WAIT_TIME);
    await page1.click(ne.polling, true);
    await page1.waitForSelector(ne.pollYesNoAbstentionBtn, ELEMENT_WAIT_TIME);
    await page1.click(ne.pollYesNoAbstentionBtn, true);
    await page1.waitForSelector(ne.startPoll, ELEMENT_WAIT_TIME);
    await page1.click(ne.startPoll, true);
    await page2.waitForSelector(poe.pollingContainer, ELEMENT_WAIT_TIME);
    await page2.waitForSelector(ne.yesBtn, ELEMENT_WAIT_TIME);
    await page2.click(ne.yesBtn, true);
    await page1.waitForSelector(ne.publishPollingResults, ELEMENT_WAIT_TIME);
    await page1.click(ne.publishPollingResults, true);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function previousSlide(test) {
  try {
    await test.waitForSelector(pe.prevSlide, ELEMENT_WAIT_TIME);
    await test.click(pe.prevSlide, true);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function nextSlide(test) {
  try {
    await test.waitForSelector(pe.nextSlide, ELEMENT_WAIT_TIME);
    await test.click(pe.nextSlide, true);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function annotation(test) {
  await test.waitForSelector(ce.tools, ELEMENT_WAIT_TIME);
  await test.click(ce.tools, true);
  await test.waitForSelector(we.pencil, ELEMENT_WAIT_TIME);
  await test.click(we.pencil, true);
  await test.click(ce.whiteboard, true);
  const annoted = await test.page.evaluate((whiteboard) => {
    return document.querySelectorAll(`${whiteboard} > g > g`)[1].innerHTML !== '';
  }, e.whiteboard);
  return annoted === true;
}

async function presetationUpload(test) {
  try {
    await test.waitForSelector(ce.actions, ELEMENT_WAIT_TIME);
    await test.click(ce.actions, true);
    await test.waitForSelector(pe.uploadPresentation, ELEMENT_WAIT_TIME);
    await test.click(pe.uploadPresentation, true);
    const elementHandle = await test.page.$(pe.fileUpload);
    await elementHandle.uploadFile(path.join(__dirname, '../media/DifferentSizes.pdf'));
    await test.click(ce.confirmBtn, true);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

function encodeCustomParams(param) {
  try {
    let splited = param.split('=');
    splited[1] = encodeURIComponent(splited[1]).replace(/%20/g, '+');
    return splited.join('=');
  } catch (e) {
    console.log(e);
  }
}

exports.zoomIn = zoomIn;
exports.zoomOut = zoomOut;
exports.poll = poll;
exports.previousSlide = previousSlide;
exports.nextSlide = nextSlide;
exports.annotation = annotation;
exports.presetationUpload = presetationUpload;
exports.hexToRgb = hexToRgb;
exports.getTestElement = getTestElement;
exports.countTestElements = countTestElements;
exports.autoJoinTest = autoJoinTest;
exports.listenOnlyMode = listenOnlyMode;
exports.forceListenOnly = forceListenOnly;
exports.skipCheck = skipCheck;
exports.encodeCustomParams = encodeCustomParams;
