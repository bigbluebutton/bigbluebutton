import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';

export async function startScreenshare(testPage: Page) {
  await testPage.waitAndClick(e.startScreenSharing, ELEMENT_WAIT_EXTRA_LONG_TIME);
  await testPage.hasElement(
    e.screenShareVideo,
    'should display the screen share video when start sharing',
    ELEMENT_WAIT_EXTRA_LONG_TIME,
  );
  await testPage.hasElement(e.stopScreenSharing, 'should display the stop screen sharing button when start sharing');
}

export async function getScreenshareVideoCount(testPage: Page): Promise<number> {
  return testPage.page.locator(e.screenShareVideo).count();
}

export async function waitForScreenshareCount(
  testPage: Page,
  expectedCount: number,
  timeout = ELEMENT_WAIT_LONGER_TIME,
): Promise<void> {
  await testPage.page.waitForFunction(
    ({ selector, count }) => document.querySelectorAll(selector).length === count,
    { selector: 'video[id^="screenshareVideo"]', count: expectedCount },
    { timeout },
  );
}
