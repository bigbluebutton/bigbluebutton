import { linkIssue } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { constants as c } from '../parameters/constants';
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

  // R1: Viewer (non-presenter) can start a screenshare without being promoted
  test('[R1] Viewer can start screenshare', async ({ browser, context, browserName, page }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not supported in Firefox without desktop');
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.initUserPage(context, { testInfo });
    await screenshare.viewerCanStartScreenshare();
  });

  // R3: lockSettingsDisableMultiScreenshare=true hides the start button for locked viewers
  test('[R3] Viewer screenshare button hidden when disableMultiScreenshare is active via API', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, {
      testInfo,
      createParameter: `${c.lockSettingsDisableMultiScreenshare}&lockOnJoin=true`,
    });
    await screenshare.initUserPage(context, { testInfo });
    await screenshare.viewerScreenshareLockedByApiParam();
  });

  // R14: Lock viewers dialog exposes the two new screenshare permission toggles
  test('[R14] Lock viewers UI has disableMultiScreenshare and hideViewersScreenshare toggles', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.lockViewersUiHasScreenshareToggles();
  });

  // R4: Enabling disableMultiScreenshare via lock-viewers UI forcibly stops active viewer shares
  // Actors: broadcaster_moderator (modPage), broadcaster_viewer (userPage),
  //         moderator_controller (modPage2)
  test('[R4] Enabling disableMultiScreenshare stops active viewer screenshare', async ({
    browser,
    context,
    browserName,
    page,
  }, testInfo) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not supported in Firefox without desktop');
    const screenshare = new ScreenShare(browser, context);
    await screenshare.initModPage(page, { testInfo });
    await screenshare.initUserPage(context, { testInfo });
    await screenshare.initModPage2(context, { testInfo });
    await screenshare.enableDisableMultiScreenshareStopsViewerShare();
  });
});
