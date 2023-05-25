const { test } = require('@playwright/test');
const { CustomParameters } = require('./customparameters');
const c = require('./constants');
const { encodeCustomParams, getAllShortcutParams, hexToRgb } = require('./util');

test.describe.parallel('CustomParameters', () => {
  test('Show Public Chat On Login', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: c.showPublicChatOnLogin });
    await customParam.showPublicChatOnLogin();
  });

  test('Record Meeting', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: c.recordMeeting });
    await customParam.recordMeeting();
  });

  test('Show Participants on Login', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: c.showParticipantsOnLogin });
    await customParam.showParticipantsOnLogin();
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

  test('Custom Styles: CSS code @ci', async ({ browser, context, page }) => {
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

  test('Hide Actions Bar @ci', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: c.hideActionsBar });
    await customParam.hideActionsBarTest();
  });

  test('Override Default Locale', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: c.overrideDefaultLocale });
    await customParam.overrideDefaultLocaleTest();
  });

  test('Hide NavBar @ci', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: c.hideNavBar });
    await customParam.hideNavBarTest();
  });

  test('Preferred Camera Profile', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { customParameter: c.preferredCameraProfile });
    await customParam.preferredCameraProfileTest();
  });

  test.describe.parallel('Audio', () => {
    test('Auto join @ci', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, false, { customParameter: c.autoJoin });
      await customParam.autoJoin();
    });

    test('Disable Listen Only Mode @ci', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, false, { customParameter: c.listenOnlyMode });
      await customParam.listenOnlyMode();
    });

    test('Force Listen Only @ci', async ({ browser, context, page }) => {
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
  });

  test.describe.parallel('Banner', () => {
    test('Banner Text @ci', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { customParameter: encodeCustomParams(c.bannerText) });
      await customParam.bannerText();
    });

    test('Banner Color @ci', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      const colorToRGB = hexToRgb(c.color);
      await customParam.initModPage(page, true, { customParameter: `${c.bannerColor}&${encodeCustomParams(c.bannerText)}` });
      await customParam.bannerColor(colorToRGB);
    });
  })

  test.describe.parallel('Presentation', () => {
    test('Hide Presentation on join @ci', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { customParameter: encodeCustomParams(c.hidePresentationOnJoin) });
      await customParam.hidePresentationOnJoin();
    });

    test('Force Restore Presentation On New Events @ci', async ({ browser, context, page }) => {
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
  });

  test.describe.parallel('Webcam', () => {
    test('Disable Webcam Sharing @ci', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { customParameter: c.enableVideo });
      await customParam.enableVideo();
    });

    test('Skip Video Preview', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { customParameter: c.skipVideoPreview });
      await customParam.skipVideoPreview();
    });

    test('Skip Video Preview on First Join @ci', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { customParameter: c.skipVideoPreviewOnFirstJoin });
      await customParam.skipVideoPreviewOnFirstJoin();
    });

    test('Mirror Own Webcam @ci', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { customParameter: c.mirrorOwnWebcam });
      await customParam.mirrorOwnWebcam();
    });
  });

  test.describe.parallel('Whiteboard', () => {
    test.skip();
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
  });

  test.describe.parallel('Disabled Features @ci', () => {
    test('Breakout Rooms', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { customParameter: c.breakoutRooms });
      await customParam.breakoutRooms();
    });

    test('Live Transcription', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, false, { customParameter: c.liveTranscription });
      await customParam.liveTranscription();
    });

    test('Captions', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { customParameter: c.captions });
      await customParam.captions();
    });

    test('Chat', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { customParameter: c.chat });
      await customParam.chat();
    });

    test('External Videos', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { customParameter: c.externalVideos });
      await customParam.externalVideos();
    });

    test('Layouts', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { customParameter: c.layouts });
      await customParam.layouts();
    });

    test('Learning Dashboard', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { customParameter: c.learningDashboard });
      await customParam.learningDashboard();
    });

    test('Polls', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { customParameter: c.polls });
      await customParam.polls();
    });

    test('Screenshare', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { customParameter: c.screenshare });
      await customParam.screenshare();
    });

    test('Shared Notes', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { customParameter: c.sharedNotes });
      await customParam.sharedNotes();
    });

    test('Virtual Backgrounds', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { customParameter: c.virtualBackgrounds });
      await customParam.virtualBackgrounds();
    });

    test('Download Presentation With Annotations', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { customParameter: c.downloadPresentationWithAnnotations });
      await customParam.downloadPresentationWithAnnotations();
    });

    test('Import Presentation With Annotations From Breakout Rooms', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { customParameter: c.importPresentationWithAnnotationsFromBreakoutRooms });
      await customParam.importPresentationWithAnnotationsFromBreakoutRooms();
    });

    test('Import Shared Notes From Breakout Rooms', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { customParameter: c.importSharedNotesFromBreakoutRooms });
      await customParam.importSharedNotesFromBreakoutRooms();
    });

    test('Presentation', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { customParameter: c.presentation });
      await customParam.presentation();
    });

    test('Custom Virtual Background', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { customParameter: c.customVirtualBackground });
      await customParam.customVirtualBackground();
    });
  });
});
