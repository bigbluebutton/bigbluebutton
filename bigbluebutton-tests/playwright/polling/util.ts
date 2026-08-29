import { expect, test } from '@playwright/test';
import path from 'path';

import { ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';

export async function openPoll(testPage: Page) {
  const { pollEnabled } = testPage.settings || {};

  test.skip(!pollEnabled, 'Polling is disabled');

  await testPage.waitAndClick(e.actions);
  await testPage.waitAndClick(e.polling);
  await testPage.hasElement(e.hidePollDesc, 'should display the hide poll description when creating a new poll');
  await testPage.waitAndClick(e.pollLetterAlternatives);
  await testPage.hasElementCount(e.pollOptionItem, 4, 'should display the poll options item for the poll answers');
}

export async function startPoll(testPage: Page, isAnonymous = false) {
  await openPoll(testPage);
  if (isAnonymous) await testPage.page.locator(e.anonymousPoll).setChecked(true, { force: true });
  await testPage.waitAndClick(e.startPoll);
}

export async function uploadSPresentationForTestingPolls(testPage: Page, fileName: string) {
  await testPage.waitAndClick(e.actions);
  await testPage.waitAndClick(e.managePresentations);
  await testPage.hasElement(
    e.presentationFileUpload,
    'should display the presentation file upload on the manage presentations modal',
  );

  await testPage.page.setInputFiles(e.presentationFileUpload, path.join(__dirname, `../core/media/${fileName}`));
  await testPage.hasText(
    'body',
    e.statingUploadPresentationToast,
    'should display the presentation toast about the upload',
  );

  await testPage.waitAndClick(e.confirmManagePresentation);
}

export async function countingVotes(testPage: Page, selector: string, count: number, textFilter: string) {
  const locator = await testPage.page.locator(selector, { hasText: textFilter });
  await expect(locator, 'should display the counting votes').toHaveCount(count, { timeout: ELEMENT_WAIT_TIME });
}
