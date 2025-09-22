const { test, expect } = require('@playwright/test');
const { uploadSinglePresentation } = require('../presentation/util');
const e = require('../core/elements.js');
const { getSettings } = require('../core/settings.js');
const path = require('path');
const { ELEMENT_WAIT_TIME } = require('../core/constants');

async function openPoll(testPage) {
  const { pollEnabled } = getSettings();
  test.fail(!pollEnabled, 'Polling is disabled');

  const isPollSidebarOpen = await testPage.checkElement(e.autoOptioningPollBtn);
  if (!isPollSidebarOpen) await testPage.waitAndClick(e.pollSidebarButton);
  await testPage.hasElement(e.minimizePolling, 'should display the minimize poll button when the poll sidebar is open');
  await testPage.waitAndClick(e.pollLetterAlternatives);
  await testPage.hasElementCount(e.pollOptionItem, 4, 'should display the poll options item for the poll answers');
}

async function startPoll(test, isAnonymous = false) {
  await openPoll(test);
  if (isAnonymous) await test.getLocator(e.anonymousPoll).setChecked();
  await test.waitAndClick(e.startPoll);
}

async function uploadSPresentationForTestingPolls(test, fileName) {
  await uploadSinglePresentation(test, fileName);
}

async function countingVotes(testPage, selector, count, textFilter) {
  const locator = await testPage.page.locator(selector, { hasText: textFilter });
  await expect(locator, 'should display the counting votes').toHaveCount(count, { timeout: ELEMENT_WAIT_TIME });
}

exports.openPoll = openPoll;
exports.startPoll = startPoll;
exports.uploadSPresentationForTestingPolls = uploadSPresentationForTestingPolls;
exports.countingVotes = countingVotes;
