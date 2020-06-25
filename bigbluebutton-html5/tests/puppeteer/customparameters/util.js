const path = require('path');

async function autoJoinTest(test) {
  const resp = await test.page.evaluate(async () => {
    const rep = await document.querySelectorAll('div[aria-label="Join audio modal"]').length === 0;
    return rep !== false;
  });
  return resp;
}

async function listenOnlyMode(test) {
  try {
    const resp = await test.page.evaluate(async () => {
      await document.querySelectorAll('div[class^="connecting--"]')[0];
      const audibleButton = await document.querySelectorAll('button[aria-label="Echo is audible"]').length !== 0;
      return audibleButton !== false;
    });
    return resp;
  } catch (e) {
    console.log(e);
  }
}

async function forceListenOnly(test) {
  try {
    const resp = await test.page.evaluate(async () => {
      await document.querySelectorAll('div[class^="connecting--"]')[0];
      if (await document.querySelectorAll('button[aria-label="Echo is audible"]').length > 0) {
        return false;
      }
      const audibleNotification = await document.querySelectorAll('div[class^="toastContainer--"]')[0].innerText === 'You have joined the audio conference';
      return audibleNotification !== false;
    });
    return resp;
  } catch (e) {
    console.log(e);
  }
}

async function skipCheck(test) {
  try {
    await test.waitForSelector('div[class^="toastContainer--"]');
    const resp1 = await test.page.evaluate(async () => await document.querySelectorAll('div[class^="toastContainer--"]').length !== 0);
    await test.waitForSelector('button[aria-label="Mute"]');
    const resp2 = await test.page.evaluate(async () => await document.querySelectorAll('button[aria-label="Mute"]').length !== 0);
    return resp1 === true && resp2 === true;
  } catch (e) {
    console.log(e);
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
    await test.page.evaluate(() => {
      setInterval(() => {
        document.querySelector('button[aria-label="Zoom in"]').scrollBy(0, 10);
      }, 100);
    });
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function zoomOut(test) {
  try {
    await test.page.evaluate(() => {
      setInterval(() => {
        document.querySelector('button[aria-label="Zoom in"]').scrollBy(10, 0);
      }, 100);
    }); return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function poll(test) {
  try {
    await test.page.evaluate(async () => await document.querySelectorAll('button[aria-label="Actions"]')[0].click());
    await test.waitForSelector('li[data-test="polling"]');
    await test.click('li[data-test="polling"]', true);
    await test.waitForSelector('button[aria-label="Yes / No"]');
    await test.click('button[aria-label="Yes / No"]', true);
    await test.waitForSelector('button[aria-label="Publish polling results"]');
    await test.click('button[aria-label="Publish polling results"]', true);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function previousSlide(test) {
  try {
    await test.page.evaluate(() => document.querySelectorAll('button[aria-describedby="prevSlideDesc"]')[0].click());
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function nextSlide(test) {
  try {
    await test.page.evaluate(() => document.querySelectorAll('button[aria-describedby="nextSlideDesc"]')[0].click());
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function annotation(test) {
  await test.waitForSelector('button[aria-label="Tools"]');
  await test.click('button[aria-label="Tools"]', true);
  await test.waitForSelector('button[aria-label="Pencil"]');
  await test.click('button[aria-label="Pencil"]', true);
  await test.click('svg[data-test="whiteboard"]', true);
  const annoted = await test.page.evaluate(async () => await document.querySelectorAll('[data-test="whiteboard"] > g > g')[1].innerHTML !== '');
  return annoted;
}

async function presetationUpload(test) {
  try {
    await test.waitForSelector('button[aria-label="Actions"]');
    await test.click('button[aria-label="Actions"]', true);
    await test.waitForSelector('li[data-test="uploadPresentation"]');
    await test.click('li[data-test="uploadPresentation"]', true);
    const elementHandle = await test.page.$('input[type=file]');
    await elementHandle.uploadFile(path.join(__dirname, '../media/DifferentSizes.pdf'));
    await test.click('button[aria-label="Confirm "]', true);
    return true;
  } catch (e) {
    console.log(e);
    return false;
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
