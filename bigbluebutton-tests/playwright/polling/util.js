const { test } = require('@playwright/test');
const e = require('../core/elements.js');
const { getSettings } = require('../core/settings.js');
const path = require('path');

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

async function uploadSPresentationForTestingPolls(test, fileName) {
  await test.waitAndClick(e.actions);
  await test.waitAndClick(e.managePresentations);
  await test.waitForSelector(e.presentationFileUpload);

  await test.page.setInputFiles(e.presentationFileUpload, path.join(__dirname, `../core/media/${fileName}`));
  await test.hasText('body', e.statingUploadPresentationToast);

  await test.waitAndClick(e.confirmManagePresentation);
}

exports.openPoll = openPoll;
exports.startPoll = startPoll;
exports.uploadSPresentationForTestingPolls = uploadSPresentationForTestingPolls;
