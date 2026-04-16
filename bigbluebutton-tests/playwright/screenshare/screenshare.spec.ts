import { linkIssue } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { ScreenShare } from './screenshare';

test.describe.parallel('Screenshare', { tag: '@ci' }, () => {
  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#sharing-screen-in-full-screen-mode-automated
  test('Start and Stop Share screen', async ({ browser, context, browserName, page }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not able in Firefox browser without desktop');
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.startSharing();
    await screenshare.stopSharing();
  });

  test('Start screenshare stops external video', { tag: '@flaky' }, async ({ browser, context, page }, testInfo) => {
    // requiring logged user to start external video on CI environment
    linkIssue(21589);
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.screenshareStopsExternalVideo();
  });

  test('Two users can share screen simultaneously', async ({ browser, context, browserName, page }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not able in Firefox browser without desktop');
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.initUserPage(context, { testInfo });
    await screenshare.twoUsersShareSimultaneously();
  });

  test('Stopping one screenshare keeps the other active', async ({ browser, context, browserName, page }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not able in Firefox browser without desktop');
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.initUserPage(context, { testInfo });
    await screenshare.stoppingOneShareKeepsOtherActive();
  });

  test('Multiple users can view an active screenshare', async ({ browser, context, browserName, page }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not able in Firefox browser without desktop');
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.initUserPage(context, { testInfo });
    await screenshare.multipleUsersViewScreenshare();
  });

  test('Screenshare survives presenter change', async ({ browser, context, browserName, page }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not able in Firefox browser without desktop');
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.initUserPage(context, { testInfo });
    await screenshare.screenshareSurvivesPresenterChange();
  });

  test('Attendee sees multiple simultaneous screenshares', async ({
    browser,
    context,
    browserName,
    page,
  }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not able in Firefox browser without desktop');
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.initUserPage(context, { testInfo });
    await screenshare.attendeeSeesMultipleShares();
  });

  test('Screenshare coexists with meeting UI', async ({ browser, context, browserName, page }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not able in Firefox browser without desktop');
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.screenshareCoexistsWithMeetingUI();
  });
});
