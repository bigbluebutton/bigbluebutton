const { default: test } = require('@playwright/test');
const e = require('../core/elements.js');
const { getSettings } = require('../core/settings.js');

async function openPoll(test) {
  const { pollEnabled } = getSettings();
  test.fail(!pollEnabled, 'Polling is disabled');

  await test.waitAndClick(e.actions);
  await test.waitAndClick(e.polling);
  await test.waitForSelector(e.hidePollDesc);
  await test.waitAndClick(e.pollLetterAlternatives);
  await test.waitForSelector(e.pollOptionItem);
}

async function startPoll(test, shouldPublishPoll = false, isAnonymous = false) {
  await openPoll(test);
  if (isAnonymous) await test.waitAndClickElement(e.anonymousPoll);
  await test.waitAndClick(e.startPoll);
  if (shouldPublishPoll) await test.waitAndClick(e.publishPollingLabel);
}

exports.openPoll = openPoll;
exports.startPoll = startPoll;
