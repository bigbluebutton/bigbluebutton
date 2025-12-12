import { expect, test } from '@playwright/test';
import path from 'path';

import { ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { uploadSinglePresentation } from '../presentation/util';

export async function openPoll(testPage: Page) {
  const { pollEnabled } = testPage.settings || {};

  test.skip(!pollEnabled, 'Polling is disabled');

  const isPollSidebarOpen = await testPage.checkElement(e.autoOptioningPollBtn);
  if (!isPollSidebarOpen) await testPage.waitAndClick(e.pollSidebarButton);
  await testPage.hasElement(e.minimizePolling, 'should display the minimize poll button when the poll sidebar is open');
  await testPage.waitAndClick(e.pollLetterAlternatives);
  await testPage.hasElementCount(e.pollOptionItem, 4, 'should display the poll options item for the poll answers');
}

export async function startPoll(testPage: Page, isAnonymous = false) {
  await openPoll(testPage);
  if (isAnonymous) await testPage.page.locator(e.anonymousPoll).setChecked(true, { force: true });
  await testPage.waitAndClick(e.startPoll);
}

export async function uploadSPresentationForTestingPolls(testPage: Page, fileName: string) {
  await uploadSinglePresentation(testPage, fileName);
}

export async function countingVotes(testPage: Page, selector: string, count: number, textFilter: string) {
  const locator = await testPage.page.locator(selector, { hasText: textFilter });
  await expect(locator, 'should display the counting votes').toHaveCount(count, { timeout: ELEMENT_WAIT_TIME });
}
