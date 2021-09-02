const path = require('path');
const ne = require('../notifications/elements');
const pe = require('../presentation/elements');
const ce = require('../customparameters/elements');
const we = require('../whiteboard/elements');
const poe = require('../polling/elemens');
const e = require('../core/elements');
const { ELEMENT_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { checkElementLengthEqualTo, checkElementLengthDifferentTo, checkElementText } = require('../core/util');

async function autoJoinTest(test) {
  try {
    const resp = await test.page.evaluate(checkElementLengthEqualTo, e.audioDialog, 0);
    return resp === true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function listenOnlyMode(test) {
  // maybe not used
  try {
    const resp = await test.page.evaluate(async (connectionSelector, echoYes) => {
      await document.querySelectorAll(connectionSelector)[0];
      return document.querySelectorAll(echoYes).length !== 0;
    }, e.connectingStatus, e.echoYes);
    return resp === true;
  } catch (err) {
    console.log(err);
  }
}

async function forceListenOnly(test) {
  try {
    const checkEchoYes = await test.page.evaluate(checkElementLengthEqualTo, e.echoYes, 0);
    if (!checkEchoYes) return false;
    const resp = await test.page.evaluate(checkElementText, ce.toastContainer, 'You have joined the audio conference');

    return resp === true;
  } catch (err) {
    console.log(err);
    return false
  }
}

async function skipCheck(test) {
  // maybe not used
  try {
    await test.waitForSelector(ce.toastContainer, ELEMENT_WAIT_TIME);
    const resp1 = await test.page.evaluate(checkElementLengthDifferentTo, e.toastContainer, 0);
    await test.waitForSelector(ce.muteBtn, ELEMENT_WAIT_TIME);
    const resp2 = await test.page.evaluate(checkElementLengthDifferentTo, ce.muteBtn, 0);
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
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function previousSlide(test) {
  try {
    await test.waitForSelector(pe.prevSlide, ELEMENT_WAIT_TIME);
    await test.click(pe.prevSlide, true);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function nextSlide(test) {
  try {
    await test.waitForSelector(pe.nextSlide, ELEMENT_WAIT_TIME);
    await test.click(pe.nextSlide, true);
    return true;
  } catch (err) {
    console.log(err);
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
    await elementHandle.uploadFile(path.join(__dirname, `../media/${e.pdfFileName}.pdf`));
    await test.click(ce.confirmBtn, true);
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
