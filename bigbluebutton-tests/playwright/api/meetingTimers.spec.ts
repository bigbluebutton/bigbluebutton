import { linkIssue } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { APIMeetingTimers } from './meetingTimers';

const TIMER_TEST_TIMEOUT = 6 * 60000;

test.describe.parallel('Meeting timers', { tag: '@nightly' }, () => {
  test.beforeEach(() => {
    test.setTimeout(TIMER_TEST_TIMEOUT);
  });

  test('A meeting nobody joins ends after meetingExpireIfNoUserJoinedInMinutes', async ({ request }) => {
    await APIMeetingTimers.testExpireIfNoUserJoined(request);
  });

  test('A meeting ends meetingExpireWhenLastUserLeftInMinutes after the last user left', async ({
    browser,
    context,
    page,
    request,
  }, testInfo) => {
    const timers = new APIMeetingTimers(browser, context);
    await timers.testExpireWhenLastUserLeft(page, testInfo, request);
  });

  test('A meeting ends as soon as the last user left with meetingExpireWhenLastUserLeftInMinutes=0', async ({
    browser,
    context,
    page,
    request,
  }, testInfo) => {
    linkIssue(26232);
    const timers = new APIMeetingTimers(browser, context);
    await timers.testExpireRightAfterLastUserLeft(page, testInfo, request);
  });

  test('A meeting ends endWhenNoModeratorDelayInMinutes after its last moderator left', async ({
    browser,
    context,
    page,
    request,
  }, testInfo) => {
    await APIMeetingTimers.testEndWhenNoModerator(browser, context, page, testInfo, request);
  });

  test('The learning dashboard data is removed learningDashboardCleanupDelayInMinutes after the meeting ended', async ({
    browser,
    context,
    page,
    request,
  }, testInfo) => {
    const timers = new APIMeetingTimers(browser, context);
    await timers.testLearningDashboardCleanup(page, testInfo, request);
  });
});
