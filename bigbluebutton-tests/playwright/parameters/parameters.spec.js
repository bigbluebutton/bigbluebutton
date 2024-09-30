const { test } = require('../fixtures');
const { CustomParameters } = require('./customparameters');
const { DisabledFeatures } = require('./disabledFeatures');
const c = require('./constants');
const { encodeCustomParams, getAllShortcutParams, hexToRgb } = require('./util');
const { CreateParameters } = require('./createParameters');
const { PARAMETER_HIDE_PRESENTATION_TOAST } = require('../core/constants');

// it only works for snapshot comparisons. playwright assertions will complain about the element (still in the DOM)
const hidePresentationToast = encodeCustomParams(PARAMETER_HIDE_PRESENTATION_TOAST);

test.describe.parallel('Create Parameters', { tag: '@ci' }, () => {
  test('Record Meeting', async ({ browser, context, page }) => {
    const createParam = new CreateParameters(browser, context);
    await createParam.initModPage(page, true, { createParameter: c.recordMeeting });
    await createParam.recordMeeting();
  });

  test.describe.parallel('Banner', () => {
    test('Banner Text', async ({ browser, context, page }) => {
      const createParam = new CreateParameters(browser, context);
      await createParam.initModPage(page, true, { createParameter: c.bannerText });
      await createParam.bannerText();
    });

    test('Banner Color', async ({ browser, context, page }) => {
      const createParam = new CreateParameters(browser, context);
      const colorToRGB = hexToRgb(c.color.substring(1));
      await createParam.initModPage(page, true, { createParameter: `${encodeCustomParams(c.bannerColor)}&${c.bannerText}` });
      await createParam.bannerColor(colorToRGB);
    });
  });

  // see https://github.com/bigbluebutton/bigbluebutton/issues/19426
  test('Max Participants', { tag: '@flaky' }, async ({ browser, context, page }) => {
    const createParam = new CreateParameters(browser, context);
    await createParam.initModPage(page, true, { createParameter: c.maxParticipants });
    await createParam.initModPage2(true, context);
    await createParam.maxParticipants(context);
  });

  // Not working due to missing data provided by GraphQL
  test('Meeting Duration', async ({ browser, context, page }) => {
    const createParam = new CreateParameters(browser, context);
    await createParam.initModPage(page, true, { createParameter: c.duration });
    await createParam.duration();
  });

  test('Message Only To Moderators', async ({ browser, context, page }) => {
    const createParam = new CreateParameters(browser, context);
    await createParam.initModPage(page, true, { createParameter: c.moderatorOnlyMessage });
    await createParam.moderatorOnlyMessage(context);
  });

  test('Webcams Shows Only For Moderators', async ({ browser, context, page }) => {
    const createParam = new CreateParameters(browser, context);
    await createParam.initModPage(page, true, { createParameter: c.webcamsOnlyForModerator });
    await createParam.initUserPage2(true, context);
    await createParam.webcamsOnlyForModerator(context);
  });

  test('Mute On Start', async ({ browser, context, page }) => {
    const createParam = new CreateParameters(browser, context);
    await createParam.initModPage(page, true, { createParameter: c.muteOnStart });
    await createParam.muteOnStart();
  });

  test('Allow Mods To Unmute Users', { tag: '@fci' }, async ({ browser, context, page }) => {
    const createParam = new CreateParameters(browser, context);
    await createParam.initModPage(page, true, { createParameter: c.allowModsToUnmuteUsers });
    await createParam.allowModsToUnmuteUsers(context);
  });

  test('Lock Settings Disable Webcam', async ({ browser, context, page }) => {
    const createParam = new CreateParameters(browser, context);
    await createParam.initModPage(page, true, { createParameter: c.lockSettingsDisableCam });
    await createParam.initUserPage(true, context);
    await createParam.lockSettingsDisableCam();
  });

  test('Lock Settings Disable Microphone', async ({ browser, context, page }) => {
    const createParam = new CreateParameters(browser, context);
    await createParam.initModPage(page, true, { createParameter: c.lockSettingsDisableMic });
    await createParam.initUserPage(false, context);
    await createParam.lockSettingsDisableMic();
  });

  test('Lock Settings Disable Public Chat', async ({ browser, context, page }) => {
    const createParam = new CreateParameters(browser, context);
    await createParam.initModPage(page, true, { createParameter: c.lockSettingsDisablePublicChat });
    await createParam.initUserPage(true, context);
    await createParam.lockSettingsDisablePublicChat();
  });

  test('Lock Settings Hide User List', async ({ browser, context, page }) => {
    const createParam = new CreateParameters(browser, context);
    await createParam.initModPage(page, true, { createParameter: c.lockSettingsHideUserList });
    await createParam.initUserPage(true, context);
    await createParam.initUserPage2(true, context);
    await createParam.lockSettingsHideUserList();
  });

  test('Allow Moderator To Eject Cameras', async ({ browser, context, page }) => {
    const createParam = new CreateParameters(browser, context);
    await createParam.initModPage(page, true, { createParameter: c.allowModsToEjectCameras });
    await createParam.initUserPage(true, context);
    await createParam.allowModsToEjectCameras();
  });

  test.describe.parallel('Disabled Features', () => {
    test.describe.serial(() => {
      test('Breakout rooms', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.breakoutRoomsDisabled });
        await disabledFeatures.breakoutRooms();
      });
      test('Breakout rooms (exclude)', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.breakoutRoomsExclude });
        await disabledFeatures.breakoutRoomsExclude();
      });
    });

    test.describe.serial(() => {
      test('Speech Recognition', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, false, { createParameter: c.speechRecognitionDisabled });
        await disabledFeatures.speechRecognition();
      });
      test('Speech Recognition (exclude)', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, false, { createParameter: c.speechRecognitionExclude });
        await disabledFeatures.speechRecognitionExclude();
      });
    });

    test.describe.serial(() => {
      // current testing code is checking the old (write) captions
      // this parameter should works the same way with the automatic captions
      test.fixme();
      test('Captions', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.captionsDisabled });
        await disabledFeatures.captions();
      });
      test('Captions (exclude)', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.captionsExclude });
        await disabledFeatures.captionsExclude();
      });
    });

    test.describe.serial(() => {
      test('Chat', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.chatDisabled });
        await disabledFeatures.chat();
      });
      test('Chat (exclude)', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.chatExclude });
        await disabledFeatures.chatExclude();
      });
    });

    test.describe.serial(() => {
      test('External Videos', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.externalVideosDisabled });
        await disabledFeatures.externalVideos();
      });
      test('External Videos (exclude)', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.externalVideosExclude });
        await disabledFeatures.externalVideosExclude();
      });
    });

    test.describe.serial(() => {
      test('Layouts', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.layoutsDisabled });
        await disabledFeatures.layouts();
      });
      test('Layouts (exclude)', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.layoutsExclude });
        await disabledFeatures.layoutsExclude();
      });
    });

    test.describe.serial(() => {
      test('Learning Dashboard', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.learningDashboardDisabled });
        await disabledFeatures.learningDashboard();
      });
      test('Learning Dashboard (exclude)', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.learningDashboardExclude });
        await disabledFeatures.learningDashboardExclude();
      });
    });

    test.describe.serial(() => {
      test('Polls', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.pollsDisabled });
        await disabledFeatures.polls();
      });
      test('Polls (exclude)', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.pollsExclude });
        await disabledFeatures.pollsExclude();
      });
    });

    test.describe.serial(() => {
      test('Screenshare', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.screenshareDisabled });
        await disabledFeatures.screenshare();
      });
      test('Screenshare (exclude)', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.screenshareExclude });
        await disabledFeatures.screenshareExclude();
      });
    });

    test.describe.serial(() => {
      test('Shared Notes', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.sharedNotesDisabled });
        await disabledFeatures.sharedNotes();
      });
      test('Shared Notes (exclude)', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.sharedNotesExclude });
        await disabledFeatures.sharedNotesExclude();
      });
    });

    test.describe.serial(() => {
      test('Virtual Background', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.virtualBackgroundsDisabled });
        await disabledFeatures.virtualBackgrounds();
      });
      test('Virtual Background (exclude)', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.virtualBackgroundsExclude });
        await disabledFeatures.virtualBackgroundsExclude();
      });
    });

    test.describe.serial(() => {
      test('Download Presentation With Annotations', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.downloadPresentationWithAnnotationsDisabled });
        await disabledFeatures.downloadPresentationWithAnnotations();
      });
      test('Download Presentation With Annotations (exclude)', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.downloadPresentationWithAnnotationsExclude });
        await disabledFeatures.downloadPresentationWithAnnotationsExclude();
      });
    });

    test.describe.serial(() => {
      test('Import Presentation With Annotations From Breakout Rooms', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.importPresentationWithAnnotationsFromBreakoutRoomsDisabled });
        await disabledFeatures.importPresentationWithAnnotationsFromBreakoutRooms();
      });
      test('Import Presentation With Annotations From Breakout Rooms (exclude)', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.importPresentationWithAnnotationsFromBreakoutRoomsExclude });
        await disabledFeatures.importPresentationWithAnnotationsFromBreakoutRoomsExclude();
      });
    });

    test.describe.serial(() => {
      test('Import Shared Notes From Breakout Rooms', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.importSharedNotesFromBreakoutRoomsDisabled });
        await disabledFeatures.importSharedNotesFromBreakoutRooms();
      });
      test('Import Shared Notes From Breakout Rooms (exclude)', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.importSharedNotesFromBreakoutRoomsExclude });
        await disabledFeatures.importSharedNotesFromBreakoutRoomsExclude();
      });
    });

    test.describe.serial(() => {
      test('Presentation', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.presentationDisabled });
        await disabledFeatures.presentation();
      });
      test('Presentation (exclude)', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.presentationExclude });
        await disabledFeatures.presentationExclude();
      });
    });

    test.describe.serial(() => {
      test('Custom Virtual Background', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.customVirtualBackgroundDisabled });
        await disabledFeatures.customVirtualBackground();
      });
      test('Custom Virtual Background (exclude)', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.customVirtualBackgroundExclude });
        await disabledFeatures.customVirtualBackgroundExclude();
      });
    });

    test.describe.serial(() => {
      test('Slide Snapshot', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.slideSnapshotDisabled });
        await disabledFeatures.slideSnapshot();
      });
      test('Slide Snapshot (exclude)', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.slideSnapshotExclude });
        await disabledFeatures.slideSnapshotExclude();
      });
    });

    test.describe.serial(() => {
      test('Camera As Content', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.cameraAsContent });
        await disabledFeatures.cameraAsContent();
      });
      test('Camera As Content (exclude)', async ({ browser, context, page }) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.cameraAsContentExclude });
        await disabledFeatures.cameraAsContentExclude();
      });
    });
  });
});

test.describe.parallel('Custom Parameters', { tag: '@ci' }, () => {
  test('Show Public Chat On Login', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { joinParameter: c.showPublicChatOnLogin });
    await customParam.showPublicChatOnLogin();
  });

  test('Show Participants on Login', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { joinParameter: c.showParticipantsOnLogin });
    await customParam.showParticipantsOnLogin();
  });

  test('Client title', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { joinParameter: c.clientTitle });
    await customParam.clientTitle();
  });

  test('Ask for feedback on logout', { tag: '@ci' }, async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { joinParameter: c.askForFeedbackOnLogout });
    await customParam.askForFeedbackOnLogout();
  });

  test('Display Branding Area', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { createParameter: `${c.displayBrandingArea}&${encodeCustomParams(c.logo)}` });
    await customParam.displayBrandingArea();
  });

  test('Shortcuts', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    const shortcutParam = getAllShortcutParams();
    await customParam.initModPage(page, true, { joinParameter: encodeCustomParams(shortcutParam) });
    await customParam.initUserPage(true, context, { useModMeetingId: true });
    await customParam.shortcuts();
  });

  test('Custom Styles: CSS code', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { joinParameter: encodeCustomParams(c.customStyle) });
    await customParam.customStyle();
  });

  test('Custom Styles: URL', async ({ browser, context, page }) => {
    test.fixme();
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { joinParameter: encodeCustomParams(c.customStyleUrl) });
    await customParam.customStyle();
  });

  test('Auto Swap Layout', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { joinParameter: c.autoSwapLayout });
    await customParam.autoSwapLayout();
  });

  test('Hide Actions Bar', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { joinParameter: c.hideActionsBar });
    await customParam.hideActionsBarTest();
  });

  test('Override Default Locale', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { joinParameter: c.overrideDefaultLocale });
    await customParam.overrideDefaultLocaleTest();
  });

  test('Hide NavBar', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { joinParameter: c.hideNavBar });
    await customParam.hideNavBarTest();
  });

  test('Preferred Camera Profile', async ({ browser, context, page }) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { joinParameter: c.preferredCameraProfile });
    await customParam.preferredCameraProfileTest();
  });

  test.describe.parallel('Audio', () => {
    // see https://github.com/bigbluebutton/bigbluebutton/issues/19427
    test('Auto join', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, false, { joinParameter: c.autoJoin });
      await customParam.autoJoin();
    });

    test('Disable Listen Only Mode', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, false, { joinParameter: c.listenOnlyMode });
      await customParam.listenOnlyMode();
    });

    // see https://github.com/bigbluebutton/bigbluebutton/issues/19428
    test('Force Listen Only', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initUserPage(false, context, { useModMeetingId: false, joinParameter: c.forceListenOnly });
      await customParam.forceListenOnly(page);
    });

    test('Skip audio check', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, false, { joinParameter: c.skipCheck });
      await customParam.skipCheck();
    });

    test('Skip audio check on first join', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, false, { joinParameter: c.skipCheckOnFirstJoin });
      await customParam.skipCheckOnFirstJoin();
    });

    test('Skip echo test if previous device', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, false, { joinParameter: c.skipEchoTestIfPreviousDevice });
      await customParam.skipEchoTestIfPreviousDevice();
    });
  });

  test.describe.parallel('Presentation', () => {
    // see https://github.com/bigbluebutton/bigbluebutton/issues/19456
    test('Hide Presentation on join', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: c.hidePresentationOnJoin });
      await customParam.initUserPage(true, context, { useModMeetingId: true, joinParameter: c.hidePresentationOnJoin });
      await customParam.hidePresentationOnJoin();
    });

    test('Force restore presentation on new events', { tag: '@ci' }, async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page);
      await customParam.initUserPage(true, context, { useModMeetingId: true, joinParameter: c.forceRestorePresentationOnNewEvents });
      await customParam.forceRestorePresentationOnNewEvents();
    });
  });

  test.describe.parallel('Webcam', () => {
    test('Disable Webcam Sharing', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: c.enableVideo });
      await customParam.enableVideo();
    });

    test('Skip Video Preview', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: c.skipVideoPreview });
      await customParam.skipVideoPreview();
    });

    test('Skip Video Preview on First Join', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: c.skipVideoPreviewOnFirstJoin });
      await customParam.skipVideoPreviewOnFirstJoin();
    });

    test('Skip Video Preview if Previous Device', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: c.skipVideoPreviewIfPreviousDevice });
      await customParam.skipVideoPreviewIfPreviousDevice();
    });

    test('Mirror Own Webcam', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: c.mirrorOwnWebcam });
      await customParam.mirrorOwnWebcam();
    });
  });

  test.describe.parallel('Whiteboard', () => {
    test('Multi Users Pen Only', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true);
      await customParam.initUserPage(true, context, { useModMeetingId: true, joinParameter: c.multiUserPenOnly });
      await customParam.multiUserPenOnly();
    });

    test('Presenter Tools', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: encodeCustomParams(c.presenterTools) });
      await customParam.presenterTools();
    });

    test('Multi Users Tools', async ({ browser, context, page }) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: encodeCustomParams(c.multiUserTools) });
      await customParam.initUserPage(true, context, { useModMeetingId: true, joinParameter: encodeCustomParams(c.multiUserTools) });
      await customParam.multiUserTools();
    });
  });
});
