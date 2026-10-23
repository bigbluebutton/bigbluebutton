import { test } from '../core/setup/fixtures';
import {
  LOGOUT_URL_CREATE_PARAMETER,
  MeetingEnded,
  routeLogoutUrl,
  SHORT_REDIRECT_SETTINGS_OVERRIDE,
} from './meetingEnded';

test.describe.parallel('Meeting ended', { tag: '@ci' }, () => {
  test('Attendee is told which moderator ended the meeting', async ({ browser, context, page }, testInfo) => {
    const meetingEnded = new MeetingEnded(browser, context);
    await meetingEnded.initPages(page, testInfo);
    await meetingEnded.endedByModeratorReason();
  });

  test('Redirect to the logout URL carries the reason and its code', async ({ browser, context, page }, testInfo) => {
    await routeLogoutUrl(context);
    const meetingEnded = new MeetingEnded(browser, context);
    await meetingEnded.initModPage(page, { createParameter: LOGOUT_URL_CREATE_PARAMETER, testInfo });
    await meetingEnded.initUserPage(context, { testInfo });
    await meetingEnded.redirectCarriesTheReason();
  });

  test('Redirects to the logout URL on its own after the configured delay', async ({
    browser,
    context,
    page,
    request,
  }, testInfo) => {
    await routeLogoutUrl(context);
    const meetingEnded = new MeetingEnded(browser, context);
    await meetingEnded.initModPage(page, { createParameter: LOGOUT_URL_CREATE_PARAMETER, testInfo });
    await meetingEnded.initUserPage(context, { testInfo, clientSettingsOverrides: SHORT_REDIRECT_SETTINGS_OVERRIDE });
    await meetingEnded.redirectsAutomatically(request);
  });
});

test.describe.parallel('Session link', { tag: '@ci' }, () => {
  test('Reopened after logging out shows the logout reason', async ({ browser, context, page }, testInfo) => {
    const meetingEnded = new MeetingEnded(browser, context);
    await meetingEnded.initPages(page, testInfo);
    await meetingEnded.reopenedLinkAfterLogout();
  });

  test('Reopened after the meeting ended shows the end reason', async ({
    browser,
    context,
    page,
    request,
  }, testInfo) => {
    const meetingEnded = new MeetingEnded(browser, context);
    await meetingEnded.initPages(page, testInfo);
    await meetingEnded.reopenedLinkAfterMeetingEnd(request);
  });

  test('Opened in a second page joins as the same participant', async ({ browser, context, page }, testInfo) => {
    const meetingEnded = new MeetingEnded(browser, context);
    await meetingEnded.initPages(page, testInfo);
    await meetingEnded.secondPageJoinsAsTheSameUser();
  });

  // both pages stay in: the first silently loses its media connection to the second
  // ("Connection issue detected. Restoring your audio and video...") instead of being told why
  test(
    'Opened in a second page tells the first page why',
    { tag: '@known-issue' },
    async ({ browser, context, page }, testInfo) => {
      const meetingEnded = new MeetingEnded(browser, context);
      await meetingEnded.initPages(page, testInfo);
      await meetingEnded.firstPageIsToldAboutTheSecondOne();
    },
  );
});
