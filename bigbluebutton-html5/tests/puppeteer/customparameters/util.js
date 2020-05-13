async function autoJoinTest(test) {
  const resp = await test.page.evaluate(async () => await document.querySelectorAll('div[aria-label="Join audio modal"]').length === 0) !== false;
  return resp;
}

async function listenOnlyMode(test) {
  try {
    const resp = await test.page.evaluate(async () => {
      await document.querySelectorAll('div[class^="connecting--"]')[0];
      const audible = await document.querySelectorAll('button[aria-label="Echo is audible"]').length !== 0;
      return audible !== false;
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
      const audible = await document.querySelectorAll('div[class^="toastContainer--"]')[0].innerText === 'You have joined the audio conference';
      return audible !== false;
    });
    console.log('after check for listen only');
    return resp;
  } catch (e) {
    console.log(e);
  }
}

exports.forceListenOnly = forceListenOnly;
exports.autoJoinTest = autoJoinTest;
exports.listenOnlyMode = listenOnlyMode;
