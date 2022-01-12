const { test } = require('@playwright/test');
const { CustomParameters } = require('./customparameters');
const c = require('./constants');
const { encodeCustomParams, getAllShortcutParams, hexToRgb } = require('./util');

test.describe.parallel('CustomParameters', () => {
  test('Auto join', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, false, { customParameter: c.autoJoin });
    await customParam.autoJoin();
  });

  test('Listen Only Mode', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, false, { customParameter: c.listenOnlyMode });
    await customParam.listenOnlyMode();
  });

  test('Force Listen Only', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initUserPage(false, context, { useModMeetingId: false, customParameter: c.forceListenOnly });
    await customParam.forceListenOnly(page);
  });

  test('Skip audio check', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, false, { customParameter: c.skipCheck });
    await customParam.skipCheck();
  });

  test('Skip audio check on first join', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, false, { customParameter: c.skipCheckOnFirstJoin });
    await customParam.skipCheckOnFirstJoin();
  });

  test('Client title', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: c.clientTitle });
    await customParam.clientTitle();
  });

  test('Ask For Feedback On Logout', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: c.askForFeedbackOnLogout });
    await customParam.askForFeedbackOnLogout();
  });

  test('Display Branding Area', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: `${c.displayBrandingArea}&${encodeCustomParams(c.logo)}` });
    await customParam.displayBrandingArea();
  });

  test('Shortcuts', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    const shortcutParam = getAllShortcutParams();
    await customParam.initModPage(page, true, { customParameter: encodeCustomParams(shortcutParam) });
    await customParam.initUserPage(true, context, { useModMeetingId: true });
    await customParam.shortcuts();
  });

  test('Disable screensharing', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: c.enableScreensharing });
    await customParam.disableScreensharing();
  });

  test('Disable Webcam Sharing', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: c.enableVideo });
    await customParam.enableVideo();
  });

  test('Multi Users Pen Only', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: c.multiUserPenOnly });
    await customParam.initUserPage(true, context, { useModMeetingId: true, customParameter: c.multiUserPenOnly });
    await customParam.multiUserPenOnly();
  });

  test('Presenter Tools', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: encodeCustomParams(c.presenterTools) });
    await customParam.presenterTools();
  });

  test('Multi Users Tools', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: encodeCustomParams(c.multiUserTools) });
    await customParam.initUserPage(true, context, { useModMeetingId: true, customParameter: encodeCustomParams(c.multiUserTools) });
    await customParam.multiUserTools();
  });

  test('Custom Styles: CSS code', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: encodeCustomParams(c.customStyle) });
    await customParam.customStyle();
  });

  test('Custom Styles: URL', async ({ browser, context, page }) => {
    test.fixme();
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: encodeCustomParams(c.customStyleUrl) });
    await customParam.customStyle();
  });

  test('Auto Swap Layout', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: c.autoSwapLayout });
    await customParam.autoSwapLayout();
  });

  test('Hide Presentation', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: encodeCustomParams(c.hidePresentation) });
    await customParam.hidePresentation();
  });

  test('Banner Text', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: encodeCustomParams(c.bannerText) });
    await customParam.bannerText();
  });

  test('Banner Color', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    const colorToRGB = hexToRgb(c.color);
    await customParam.initModPage(page, true, { customParameter: `${c.bannerColor}&${encodeCustomParams(c.bannerText)}` });
    await customParam.bannerColor(colorToRGB);
  });

  test('Show Public Chat On Login', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: c.showPublicChatOnLogin });
    await customParam.showPublicChatOnLogin();
  });

  test('Force Restore Presentation On New Events', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    const customParameter = c.forceRestorePresentationOnNewEvents;
    await customParam.initModPage(page, true, { customParameter });
    await customParam.forceRestorePresentationOnNewEvents(customParameter);
  });

  test('Force Restore Presentation On New Poll Result', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    const customParameter = c.forceRestorePresentationOnNewEvents;
    await customParam.initModPage(page, true, { customParameter });
    await customParam.forceRestorePresentationOnNewPollResult(customParameter);
  });

  test('Record Meeting', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: c.recordMeeting });
    await customParam.recordMeeting();
  });

  test('Skip Video Preview', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: c.skipVideoPreview });
    await customParam.skipVideoPreview();
  });

  test('Skip Video Preview on First Join', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: c.skipVideoPreviewOnFirstJoin });
    await customParam.skipVideoPreviewOnFirstJoin();
  });

  test('Mirror Own Webcam', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: c.mirrorOwnWebcam });
    await customParam.mirrorOwnWebcam();
  });

  test('Show Participants on Login', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: c.showParticipantsOnLogin });
    await customParam.showParticipantsOnLogin();
  });
});