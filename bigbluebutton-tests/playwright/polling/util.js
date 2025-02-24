const { test } = require('@playwright/test');
const e = require('../core/elements.js');
const { getSettings } = require('../core/settings.js');
const path = require('path');

async function openPoll(testPage) {
  const { pollEnabled } = getSettings();
  test.fail(!pollEnabled, 'Polling is disabled');

  const isPollSidebarOpen = await testPage.checkElement(e.autoOptioningPollBtn);
  if (!isPollSidebarOpen) await testPage.waitAndClick(e.pollSidebarButton);
  await testPage.hasElement(e.minimizePolling, 'should display the minimize poll button when the poll sidebar is open');
  await testPage.waitAndClick(e.pollLetterAlternatives);
  await testPage.checkElementCount(e.pollOptionItem, 4, 'should display the poll options item for the poll answers');
}

async function startPoll(test, isAnonymous = false) {
  await openPoll(test);
  if (isAnonymous) await test.getLocator(e.anonymousPoll).setChecked();
  await test.waitAndClick(e.startPoll);
}

async function uploadSPresentationForTestingPolls(test, fileName) {
  await test.waitAndClick(e.mediaAreaButton);
  await test.waitAndClick(e.managePresentations);
  await test.hasElement(e.presentationFileUpload, 'should display the presentation file upload on the manage presentations modal');
  await test.page.setInputFiles(e.presentationFileUpload, path.join(__dirname, `../core/media/${fileName}`));
  await test.hasText('body', e.statingUploadPresentationToast, 'should display the presentation toast about the upload');
  await test.waitAndClick(e.confirmManagePresentation);
}

exports.openPoll = openPoll;
exports.startPoll = startPoll;
exports.uploadSPresentationForTestingPolls = uploadSPresentationForTestingPolls;
