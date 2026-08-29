import { test } from '@playwright/test';

import { elements as e } from '../core/elements';
import { Page } from '../core/page';

export async function openPoll(testPage: Page) {
  const { pollEnabled } = testPage.settings || {};
  test.skip(!pollEnabled, 'Polling is disabled');

  await testPage.waitAndClick(e.actions);
  await testPage.waitAndClick(e.polling);
}

export function timeInSeconds(timeTextContent: string) {
  const [hours, minutes, seconds] = timeTextContent.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

export async function rowFilter(testPage: Page, role: string | RegExp, selector: string) {
  const locatorToFilter = testPage.page.locator('tr');
  return locatorToFilter.filter({ hasText: role }).locator(selector);
}
