import { expect, test } from '@playwright/test';

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

export async function openQuiz(testPage: Page) {
  const { quizEnabled } = testPage.settings || {};

  test.skip(!quizEnabled, 'Quiz mode is disabled');

  await openPoll(testPage);
  await testPage.waitAndClick(e.pollQuizTab);
  await testPage.hasElementCount(
    e.quizCorrectAnswerCheckbox,
    4,
    'should display a correct answer checkbox for each quiz option',
  );
}

export async function selectQuizCorrectAnswer(testPage: Page, optionIndex: number) {
  await testPage.getLocatorByIndex(e.quizCorrectAnswerCheckbox, optionIndex).check();
  await testPage.hasElementCount(e.correctAnswerLabel, 1, 'should label exactly one quiz option as the correct answer');
}

export async function answerPollOption(testPage: Page, optionLabel: string) {
  await testPage.hasElement(e.pollingContainer, 'should display the polling container to answer it');
  await testPage.page
    .locator(e.pollAnswerOptionBtn)
    .filter({ hasText: new RegExp(`^${optionLabel}$`) })
    .click();
}

export function liveResultRow(testPage: Page, userName: string) {
  return testPage.page.locator(e.pollLiveResultRow).filter({ has: testPage.page.locator(`td:text-is("${userName}")`) });
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
