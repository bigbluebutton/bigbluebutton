import { expect, type Locator, type Page as PlaywrightPage } from '@playwright/test';

import { elements as e } from './elements';
import { Page } from './page';

// Parts of the client that differ between runs whatever the test does: the random meeting name in
// the navigation bar and the connection indicator, whose colour follows the measured round trip.
export function screenshotMask(page: PlaywrightPage): Locator[] {
  return [e.presentationTitle, e.connectionStatusBtn].map((selector) => page.locator(selector));
}

// Brings a page to a state a screenshot can reproduce: no toast, the pointer off the client (so no
// hover outline under it) and nothing focused (a focused button shows its tooltip). Returns a
// function that gives the focus back, so that the test carries on as before: the whiteboard's
// keyboard shortcuts only reach it while it is focused.
export async function prepareForScreenshot(testPage: Page): Promise<() => Promise<void>> {
  await testPage.closeAllToastNotifications();
  await testPage.page.mouse.move(0, 0);
  const focused = await testPage.page.evaluateHandle(() => document.activeElement);
  await focused.evaluate((element) => (element as HTMLElement | null)?.blur());
  await expect(testPage.page.locator('[data-tippy-root]'), 'should not display a tooltip').toHaveCount(0);
  return async () => {
    await focused.evaluate((element) => (element as HTMLElement | null)?.focus({ preventScroll: true }));
    await focused.dispose();
  };
}
