import { test, expect } from '@playwright/test';
import path from 'path';
import { elements as e } from '../core/elements.ts';
import { getSettings } from '../core/settings.ts';
import { ELEMENT_WAIT_TIME } from '../core/constants.ts';

export async function openPoll(testPage) {
  const { pollEnabled } = getSettings();
  test.fail(!pollEnabled, 'Polling is disabled');

  await testPage.waitAndClick(e.actions);
  await testPage.waitAndClick(e.polling);
  await testPage.hasElement(e.hidePollDesc, 'should display the hide poll description when creating a new poll');
  await testPage.waitAndClick(e.pollLetterAlternatives);
  await testPage.hasElementCount(e.pollOptionItem, 4, 'should display the poll options item for the poll answers');
}

export async function startPoll(testPage, isAnonymous = false) {
  await openPoll(testPage);
  if (isAnonymous) await testPage.page.locator(e.anonymousPoll).setChecked();
  await testPage.waitAndClick(e.startPoll);
}

export async function uploadSPresentationForTestingPolls(testPage, fileName) {
  await testPage.waitAndClick(e.actions);
  await testPage.waitAndClick(e.managePresentations);
  await testPage.hasElement(
    e.presentationFileUpload,
    'should display the presentation file upload on the manage presentations modal'
  );

  await test.page.setInputFiles(e.presentationFileUpload, path.join(__dirname, `../core/media/${fileName}`));
  await test.hasText(
    'body',
    e.statingUploadPresentationToast,
    'should display the presentation toast about the upload'
  );

  await test.waitAndClick(e.confirmManagePresentation);
}

export async function countingVotes(testPage, selector, count, textFilter) {
  const locator = await testPage.page.locator(selector, { hasText: textFilter });
  await expect(locator, 'should display the counting votes').toHaveCount(count, { timeout: ELEMENT_WAIT_TIME });
}
