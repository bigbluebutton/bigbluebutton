import { test } from '../core/setup/fixtures';
import { API } from './api';
import { APIBreakout } from './breakout';

test.describe.parallel('API', () => {
  // fixme: getMeetingInfo fails if executed sequentially with getMeetings.
  test.fixme('getMeetings', async ({ browser, context, page }, testInfo) => {
    const api = new API(browser, context);
    await api.testGetMeetings(page, testInfo);
  });

  test.fixme('getMeetingInfo', async ({ browser, context, page }, testInfo) => {
    const api = new API(browser, context);
    await api.testGetMeetingInfo(page, testInfo);
  });

  test('breakoutWithoutParent', async () => {
    await APIBreakout.testBreakoutWithoutParent();
  });

  test('breakoutWithoutSequenceNumber', async ({ browser, context, page }) => {
    const api = new APIBreakout(browser, context);
    await api.initModPage(page);
    await api.testBreakoutWithoutSequenceNumber();
  });

  test('breakoutWithNonexistentParent', async () => {
    await APIBreakout.testBreakoutWithNonexistentParent();
  });

  test.fixme('breakoutMeetingInfo', async ({ browser, context, page }, testInfo) => {
    const api = new APIBreakout(browser, context);
    await api.initPages(page, testInfo);
    await api.create();
    await api.testBreakoutMeetingInfoNoJoins();
    await api.joinRoom();
    await api.testBreakoutMeetingInfoOneJoin();
  });
});
