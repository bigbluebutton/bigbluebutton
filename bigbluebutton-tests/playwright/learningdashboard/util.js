import { test } from '@playwright/test';

import { elements as e } from '../core/elements.ts';
import { getSettings } from '../core/settings.ts';

export async function openPoll(testPage) {
  const { pollEnabled } = getSettings();
  test.fail(!pollEnabled, 'Polling is disabled');

  await testPage.waitAndClick(e.actions);
  await testPage.waitAndClick(e.polling);
}

export function timeInSeconds(locator) {
  const [hours, minutes, seconds] = locator.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

export async function rowFilter(testPage, locator, role, selector) {
  const locatorToFilter = await testPage.page.locator(locator);
  return locatorToFilter.filter({ hasText: role }).locator(selector);
}
