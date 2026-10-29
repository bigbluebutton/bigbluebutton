import { Locator, test } from '@playwright/test';

import { elements as e } from '../core/elements';
import { Page } from '../core/page';

// The dashboard data is published every 5 s and the page fetches it every 10 s
export const DASHBOARD_UPDATE_TIME = 20000;

export async function openPoll(testPage: Page) {
  const { pollEnabled } = testPage.settings || {};
  test.skip(!pollEnabled, 'Polling is disabled');

  await testPage.waitAndClick(e.pollSidebarButton)
}

export function timeInSeconds(timeTextContent: string) {
  const [hours, minutes, seconds] = timeTextContent.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

// A talk or webcam time cell, which stays empty until there is some time to show
export async function cellTimeInSeconds(cell: Locator) {
  const time = (await cell.textContent())?.match(/\d+:\d+:\d+/);
  return time ? timeInSeconds(time[0]) : 0;
}

export async function rowFilter(testPage: Page, role: string | RegExp, selector: string) {
  const locatorToFilter = testPage.page.locator('tr');
  return locatorToFilter.filter({ hasText: role }).locator(selector);
}
