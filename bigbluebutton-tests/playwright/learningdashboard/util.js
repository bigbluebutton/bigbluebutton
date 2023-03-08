const { test } = require('@playwright/test');
const e = require('../core/elements.js');
const { getSettings } = require('../core/settings.js');

async function openPoll(testPage) {
  const { pollEnabled } = getSettings();
  test.fail(!pollEnabled, 'Polling is disabled');
  
  await testPage.waitAndClick(e.actions);
  await testPage.waitAndClick(e.polling);
}

exports.openPoll = openPoll;