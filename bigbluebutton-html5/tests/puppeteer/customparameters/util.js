async function autoJoinTest(test) {
  const resp = await test.page.evaluate(async () => await document.querySelectorAll('div[aria-label="Join audio modal"]').length === 0) !== false;
  return resp;
}

async function listenOnlyMode(test) {
  try {
    const resp = await test.page.evaluate(async () => {
      await document.querySelectorAll('div[class^="connecting--"]')[0];
      const audibleButton = await document.querySelectorAll('button[aria-label="Echo is audible"]').length !== 0;
      return audibleButton !== false;
    });
    console.log('after check for listen only');
    return resp;
  } catch (e) {
    console.log(e);
  }
}

async function forceListenOnly(test) {
  try {
    const resp = await test.page.evaluate(async () => {
      await document.querySelectorAll('div[class^="connecting--"]')[0];
      if (await test.page.$('button[aria-label="Echo is audible"]')) {
        return false;
      }
      const audibleNotification = await document.querySelectorAll('div[class^="toastContainer--"]')[0].innerText === 'You have joined the audio conference';
      return audibleNotification !== false;
    });
    console.log('after check for listen only');
    return resp;
  } catch (e) {
    console.log(e);
  }
}

async function skipCheck(test) {
  try {
    console.log('before toastContainer');
    await test.waitForSelector('div[class^="toastContainer--"]');
    const resp1 = await test.page.evaluate(async () => await document.querySelectorAll('div[class^="toastContainer--"]').length !== 0);
    console.log('after toastContainer');
    await test.waitForSelector('button[aria-label="Mute"]');
    const resp2 = await test.page.evaluate(async () => await document.querySelectorAll('button[aria-label="Mute"]').length !== 0);
    console.log({ resp1, resp2 });
    return resp1;
  } catch (e) {
    console.log(e);
  }
}

async function countTestElements(element) {
  return document.querySelectorAll(element).length !== 0;
}

exports.countTestElements = countTestElements;
exports.autoJoinTest = autoJoinTest;
exports.listenOnlyMode = listenOnlyMode;
exports.forceListenOnly = forceListenOnly;
exports.skipCheck = skipCheck;
