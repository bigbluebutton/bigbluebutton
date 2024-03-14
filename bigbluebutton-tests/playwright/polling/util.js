const { test } = require('@playwright/test');
const e = require('../core/elements.js');
const { getSettings } = require('../core/settings.js');

async function openPoll(testPage) {
  const { pollEnabled } = getSettings();
  test.fail(!pollEnabled, 'Polling is disabled');

  await testPage.waitAndClick(e.actions);
  await testPage.waitAndClick(e.polling);
  await testPage.waitForSelector(e.hidePollDesc);
  await testPage.waitAndClick(e.pollLetterAlternatives);
  await testPage.waitForSelector(e.pollOptionItem);
}

async function startPoll(test, isAnonymous = false) {
  await openPoll(test);
  if (isAnonymous) await test.getLocator(e.anonymousPoll).setChecked();
  await test.waitAndClick(e.startPoll);
}

exports.openPoll = openPoll;
exports.startPoll = startPoll;
