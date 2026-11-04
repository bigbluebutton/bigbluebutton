import { test } from '../core/setup/fixtures';
import { APIEndMeetingWhenNoMoreAuthedUsers } from './endMeetingWhenNoMoreAuthedUsers';

const TIMER_TEST_TIMEOUT = 6 * 60000;

// apps.endMeetingWhenNoMoreAuthedUsers is a bbb-apps-akka setting (off by default), so these tests need a server
// whose /etc/bigbluebutton/bbb-apps-akka.conf sets it, with apps.endMeetingWhenNoMoreAuthedUsersAfterMinutes = 1.
// The @setting-required tag keeps them out of the gates; the nightly workflow runs them on such a server.
test.describe.parallel(
  'End the meeting once no authenticated user is left',
  { tag: '@setting-required:endMeetingWhenNoMoreAuthedUsers' },
  () => {
    test.beforeEach(() => {
      test.setTimeout(TIMER_TEST_TIMEOUT);
    });

    test('A meeting left to guests ends endMeetingWhenNoMoreAuthedUsersAfterMinutes after its last authenticated user left', async ({
      browser,
      context,
      page,
      request,
    }, testInfo) => {
      await APIEndMeetingWhenNoMoreAuthedUsers.testEndsAfterLastAuthedUserLeft(
        browser,
        context,
        page,
        testInfo,
        request,
      );
    });

    test('An authenticated user who returns in time restarts endMeetingWhenNoMoreAuthedUsersAfterMinutes', async ({
      browser,
      context,
      page,
      request,
    }, testInfo) => {
      const meeting = new APIEndMeetingWhenNoMoreAuthedUsers(browser, context);
      await meeting.testAuthedUserReturningRestartsTheTimer(page, testInfo, request);
    });
  },
);
