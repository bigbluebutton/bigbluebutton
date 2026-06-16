import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../../core/constants';
import { elements as e } from '../../core/elements';
import { Page } from '../../core/page';

export async function startSharedNotes(testPage: Page) {
  await testPage.waitAndClick(e.sharedNotesSidebarButton);
  await testPage.waitForSelector(e.hideNotesLabel, ELEMENT_WAIT_LONGER_TIME);
  await testPage.hasElement(e.blockNoteEditor, 'should display the BlockNote editor', ELEMENT_WAIT_LONGER_TIME);
}

export function getNotesLocator(testPage: Page) {
  return testPage.page.locator(e.blockNoteEditor);
}

function checkUnreadNotesIndicator(testPage: Page) {
  return testPage.page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (!element) return false;
    const afterElement = getComputedStyle(element, 'after');
    return !!afterElement && afterElement.content !== 'none';
  }, e.sharedNotesSidebarButton);
}

export async function hasNoUnreadNotesIndicator(testPage: Page, description: string, timeout = ELEMENT_WAIT_TIME) {
  await expect(async () => {
    expect(await checkUnreadNotesIndicator(testPage)).toBeFalsy();
  }, description).toPass({ timeout });
}

// The indicator must not (re)appear: poll for the whole duration instead of
// passing on the first falsy check.
export async function unreadNotesIndicatorStaysHidden(testPage: Page, description: string, durationMs = 3000) {
  const deadline = Date.now() + durationMs;
  while (Date.now() < deadline) {
    expect(await checkUnreadNotesIndicator(testPage), description).toBeFalsy();
    await testPage.page.waitForTimeout(250);
  }
}
