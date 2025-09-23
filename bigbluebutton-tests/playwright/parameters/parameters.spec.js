const { test } = require('../fixtures');
const { CustomParameters } = require('./customparameters');
const { DisabledFeatures } = require('./disabledFeatures');
const c = require('./constants');
const { encodeCustomParams, getAllShortcutParams, hexToRgb } = require('./util');
const { CreateParameters } = require('./createParameters');
const { linkIssue } = require('../core/helpers');

test.describe.parallel('Create Parameters', { tag: '@ci' }, () => {
  test('Record Meeting', async ({ browser, context, page }, testInfo) => {
    const createParam = new CreateParameters(browser, context);
    await createParam.initModPage(page, true, { createParameter: c.recordMeeting, testInfo });
    await createParam.recordMeeting();
  });

  test.describe.parallel('Banner', () => {
    test('Banner Text', async ({ browser, context, page }, testInfo) => {
      const createParam = new CreateParameters(browser, context);
      await createParam.initModPage(page, true, { createParameter: c.bannerText, testInfo });
      await createParam.bannerText();
    });

    test('Banner Color', async ({ browser, context, page }, testInfo) => {
      const createParam = new CreateParameters(browser, context);
      const colorToRGB = hexToRgb(c.color.substring(1));
      await createParam.initModPage(page, true, { createParameter: `${encodeCustomParams(c.bannerColor)}&${c.bannerText}`, testInfo });
      await createParam.bannerColor(colorToRGB);
    });
  });

  test('Max Participants', async ({ browser, context, page }, testInfo) => {
    const createParam = new CreateParameters(browser, context);
    await createParam.initModPage(page, true, { createParameter: c.maxParticipants, testInfo });
    await createParam.initModPage2(true, context, { testInfo });
    await createParam.maxParticipants();
  });

  test('Meeting Duration', async ({ browser, context, page }, testInfo) => {
    const createParam = new CreateParameters(browser, context);
    await createParam.initModPage(page, true, { createParameter: c.duration, testInfo });
    await createParam.duration();
  });

  test('Message Only To Moderators', async ({ browser, context, page }, testInfo) => {
    const createParam = new CreateParameters(browser, context);
    await createParam.initModPage(page, true, { createParameter: encodeCustomParams(c.moderatorOnlyMessage), testInfo });
    await createParam.moderatorOnlyMessage();
  });

  test('Webcams Shows Only For Moderators', async ({ browser, context, page }, testInfo) => {
    const createParam = new CreateParameters(browser, context);
    await createParam.initModPage(page, true, { createParameter: c.webcamsOnlyForModerator, testInfo });
    await createParam.initUserPage2(true, context, { testInfo });
    await createParam.webcamsOnlyForModerator(context);
  });

  test('Mute On Start', async ({ browser, context, page }, testInfo) => {
    const createParam = new CreateParameters(browser, context);
    await createParam.initModPage(page, true, { createParameter: c.muteOnStart, testInfo });
    await createParam.muteOnStart();
  });

  test('Allow Mods To Unmute Users', async ({ browser, context, page }, testInfo) => {
    const createParam = new CreateParameters(browser, context);
    await createParam.initModPage(page, true, { createParameter: c.allowModsToUnmuteUsers, testInfo });
    await createParam.allowModsToUnmuteUsers(context);
  });

  test('Lock Settings Disable Webcam', async ({ browser, context, page }, testInfo) => {
    const createParam = new CreateParameters(browser, context);
    await createParam.initModPage(page, true, { createParameter: c.lockSettingsDisableCam, testInfo });
    await createParam.initUserPage(true, context, { testInfo });
    await createParam.lockSettingsDisableCam();
  });

  test('Lock Settings Disable Microphone', async ({ browser, context, page }, testInfo) => {
    const createParam = new CreateParameters(browser, context);
    await createParam.initModPage(page, true, { createParameter: c.lockSettingsDisableMic, testInfo });
    await createParam.initUserPage(false, context, { testInfo });
    await createParam.lockSettingsDisableMic();
  });

  test('Lock Settings Disable Public Chat', async ({ browser, context, page }, testInfo) => {
    const createParam = new CreateParameters(browser, context);
    await createParam.initModPage(page, true, { createParameter: c.lockSettingsDisablePublicChat, testInfo });
    await createParam.initUserPage(true, context, { testInfo });
    await createParam.lockSettingsDisablePublicChat();
  });

  test('Lock Settings Hide User List', async ({ browser, context, page }, testInfo) => {
    const createParam = new CreateParameters(browser, context);
    await createParam.initModPage(page, true, { createParameter: c.lockSettingsHideUserList, testInfo });
    await createParam.initUserPage(true, context, { testInfo });
    await createParam.initUserPage2(true, context);
    await createParam.lockSettingsHideUserList();
  });

  test('Allow Moderator To Eject Cameras', async ({ browser, context, page }, testInfo) => {
    const createParam = new CreateParameters(browser, context);
    await createParam.initModPage(page, true, { createParameter: c.allowModsToEjectCameras, testInfo });
    await createParam.initUserPage(true, context, { testInfo });
    await createParam.allowModsToEjectCameras();
  });

  test('Override default presentation on CREATE meeting API call', async ({ browser, context, page }, testInfo) => {
    const createParam = new CreateParameters(browser, context);
    await createParam.initModPage(page, true, { createParameter: `${c.preUploadedPresentation}&${c.preUploadedPresentationOverrideDefault}&${c.preUploadedPresentationName}`, testInfo });
    await createParam.initUserPage(true, context, { testInfo });
    await createParam.overrideDefaultPresentation();
  });

  test.describe.parallel('Meeting Layout(default)', () => {
    test('CUSTOM_LAYOUT', async ({ browser, context, page }, testInfo) => {
      const createParam = new CreateParameters(browser, context);
      await createParam.initModPage(page, true, { createParameter: c.customLayout, testInfo });
      await createParam.initUserPage(true, context, { testInfo });
      await createParam.customLayout();
    });

    test('SMART_LAYOUT', async ({ browser, context, page }, testInfo) => {
      const createParam = new CreateParameters(browser, context);
      await createParam.initModPage(page, true, { createParameter: c.smartLayout, testInfo });
      await createParam.initUserPage(true, context, { testInfo });
      await createParam.smartLayout();
    });

    test('PRESENTATION_FOCUS', async ({ browser, context, page }, testInfo) => {
      const createParam = new CreateParameters(browser, context);
      await createParam.initModPage(page, true, { createParameter: c.presentationFocus, testInfo });
      await createParam.initUserPage(true, context, { testInfo });
      await createParam.presentationFocus();
    });

    test('VIDEO_FOCUS', async ({ browser, context, page }, testInfo) => {
      const createParam = new CreateParameters(browser, context);
      await createParam.initModPage(page, true, { createParameter: c.videoFocus, testInfo });
      await createParam.initUserPage(true, context, { testInfo });
      await createParam.videoFocus();
    });

    test('CAMERAS_ONLY', async ({ browser, context, page }, testInfo) => {
      const createParam = new CreateParameters(browser, context);
      await createParam.initModPage(page, true, { createParameter: c.camerasOnly, testInfo });
      await createParam.initUserPage(true, context, { testInfo });
      await createParam.camerasOnly();
    });

    test('PRESENTATION_ONLY', async ({ browser, context, page }, testInfo) => {
      const createParam = new CreateParameters(browser, context);
      await createParam.initModPage(page, true, { createParameter: c.presentationOnly, testInfo });
      await createParam.initUserPage(true, context, { testInfo });
      await createParam.presentationOnly();
    });

    test('PARTICIPANTS_AND_CHAT_ONLY', async ({ browser, context, page }, testInfo) => {
      const createParam = new CreateParameters(browser, context);
      await createParam.initModPage(page, true, { createParameter: c.participantsAndChatOnly, testInfo });
      await createParam.initUserPage(true, context, { testInfo });
      await createParam.participantsAndChatOnly();
    });

    test('MEDIA_ONLY', async ({ browser, context, page }, testInfo) => {
      const createParam = new CreateParameters(browser, context);
      await createParam.initModPage(page, true, { createParameter: c.mediaOnly, testInfo });
      await createParam.initUserPage(true, context, { testInfo });
      await createParam.mediaOnly();
    });
  });

  test.describe.parallel('Enforce Layout', () => {
    test('CUSTOM_LAYOUT', async ({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { createParameter: c.presentationFocus, joinParameter: c.enforceCustomLayout, testInfo });
      await customParam.initUserPage(true, context, { testInfo });
      await customParam.enforceCustomLayout();
    });

    test('SMART_LAYOUT', async ({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: c.enforceSmartLayout, testInfo });
      await customParam.initUserPage(true, context, { testInfo });
      await customParam.enforceSmartLayout();
    });

    test('PRESENTATION_FOCUS', async ({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: c.enforcePresentationFocus, testInfo });
      await customParam.initUserPage(true, context, { testInfo });
      await customParam.enforcePresentationFocus();
    });

    test('VIDEO_FOCUS', async ({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: c.enforceVideoFocus, testInfo });
      await customParam.initUserPage(true, context, { testInfo });
      await customParam.enforceVideoFocus();
    });

    test('CAMERAS_ONLY', async ({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: c.enforceCamerasOnly, testInfo });
      await customParam.initUserPage(true, context, { testInfo });
      await customParam.enforceCamerasOnly();
    });

    test('PARTICIPANTS_AND_CHAT_ONLY', async ({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: c.enforceParticipantsAndChatOnly, testInfo });
      await customParam.initUserPage(true, context, { testInfo });
      await customParam.enforceParticipantsAndChatOnly();
    });

    test('PRESENTATION_ONLY', async ({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: c.enforcePresentationOnly, testInfo });
      await customParam.initUserPage(true, context, { testInfo });
      await customParam.enforcePresentationOnly();
    });

    test('MEDIA_ONLY', async ({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: c.enforceMediaOnly, testInfo });
      await customParam.initUserPage(true, context, { testInfo });
      await customParam.enforceMediaOnly();
    });
  });

  test.describe.parallel('Disabled Features', () => {
    test.describe.serial(() => {
      test('Breakout rooms', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.breakoutRoomsDisabled, testInfo });
        await disabledFeatures.breakoutRooms();
      });
      test('Breakout rooms (exclude)', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.breakoutRoomsExclude, testInfo });
        await disabledFeatures.breakoutRoomsExclude();
      });
    });

    test.describe.serial(() => {
      test('Speech Recognition', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, false, { createParameter: c.speechRecognitionDisabled, testInfo });
        await disabledFeatures.speechRecognition();
      });
      test('Speech Recognition (exclude)', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, false, { createParameter: c.speechRecognitionExclude, testInfo });
        await disabledFeatures.speechRecognitionExclude();
      });
    });

    test.describe.serial(() => {
      // current testing code is checking the old (write) captions
      // this parameter should works the same way with the automatic captions
      test.fixme();
      test('Captions', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.captionsDisabled, testInfo });
        await disabledFeatures.captions();
      });
      test('Captions (exclude)', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.captionsExclude, testInfo });
        await disabledFeatures.captionsExclude();
      });
    });

    test.describe.serial(() => {
      test('Chat', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.chatDisabled, testInfo });
        await disabledFeatures.chat();
      });
      test('Chat (exclude)', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.chatExclude, testInfo });
        await disabledFeatures.chatExclude();
      });
    });

    test.describe.serial(() => {
      test('External Videos', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.externalVideosDisabled, testInfo });
        await disabledFeatures.externalVideos();
      });
      test('External Videos (exclude)', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.externalVideosExclude, testInfo });
        await disabledFeatures.externalVideosExclude();
      });
    });

    test.describe.serial(() => {
      test('Layouts', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.layoutsDisabled, testInfo });
        await disabledFeatures.layouts();
      });
      test('Layouts (exclude)', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.layoutsExclude, testInfo });
        await disabledFeatures.layoutsExclude();
      });
    });

    test.describe.serial(() => {
      test('Learning Dashboard', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.learningDashboardDisabled, testInfo });
        await disabledFeatures.learningDashboard();
      });
      test('Learning Dashboard (exclude)', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.learningDashboardExclude, testInfo });
        await disabledFeatures.learningDashboardExclude();
      });
    });

    test.describe.serial(() => {
      test('Polls', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.pollsDisabled, testInfo });
        await disabledFeatures.polls();
      });
      test('Polls (exclude)', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.pollsExclude, testInfo });
        await disabledFeatures.pollsExclude();
      });
    });

    test.describe.serial(() => {
      test('Screenshare', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.screenshareDisabled, testInfo });
        await disabledFeatures.screenshare();
      });
      test('Screenshare (exclude)', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.screenshareExclude, testInfo });
        await disabledFeatures.screenshareExclude();
      });
    });

    test.describe.serial(() => {
      test('Shared Notes', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.sharedNotesDisabled, testInfo });
        await disabledFeatures.sharedNotes();
      });
      test('Shared Notes (exclude)', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.sharedNotesExclude, testInfo });
        await disabledFeatures.sharedNotesExclude();
      });
    });

    test.describe.serial(() => {
      test('Virtual Background', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.virtualBackgroundsDisabled, testInfo });
        await disabledFeatures.virtualBackgrounds();
      });
      test('Virtual Background (exclude)', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.virtualBackgroundsExclude, testInfo });
        await disabledFeatures.virtualBackgroundsExclude();
      });
    });

    test.describe.serial(() => {
      test('Download Presentation With Annotations', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.downloadPresentationWithAnnotationsDisabled, testInfo });
        await disabledFeatures.downloadPresentationWithAnnotations();
      });
      test('Download Presentation With Annotations (exclude)', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.downloadPresentationWithAnnotationsExclude, testInfo });
        await disabledFeatures.downloadPresentationWithAnnotationsExclude();
      });
    });

    test.describe.serial(() => {
      test('Import Presentation With Annotations From Breakout Rooms', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.importPresentationWithAnnotationsFromBreakoutRoomsDisabled, testInfo });
        await disabledFeatures.importPresentationWithAnnotationsFromBreakoutRooms();
      });
      test('Import Presentation With Annotations From Breakout Rooms (exclude)', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.importPresentationWithAnnotationsFromBreakoutRoomsExclude, testInfo });
        await disabledFeatures.importPresentationWithAnnotationsFromBreakoutRoomsExclude();
      });
    });

    test.describe.serial(() => {
      test('Import Shared Notes From Breakout Rooms', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.importSharedNotesFromBreakoutRoomsDisabled, testInfo });
        await disabledFeatures.importSharedNotesFromBreakoutRooms();
      });
      test('Import Shared Notes From Breakout Rooms (exclude)', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.importSharedNotesFromBreakoutRoomsExclude, testInfo });
        await disabledFeatures.importSharedNotesFromBreakoutRoomsExclude();
      });
    });

    test.describe.serial(() => {
      test('Presentation', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.presentationDisabled, testInfo });
        await disabledFeatures.presentation();
      });
      test('Presentation (exclude)', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.presentationExclude, testInfo });
        await disabledFeatures.presentationExclude();
      });
    });

    test.describe.serial(() => {
      test('Custom Virtual Background', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.customVirtualBackgroundDisabled, testInfo });
        await disabledFeatures.customVirtualBackground();
      });
      test('Custom Virtual Background (exclude)', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.customVirtualBackgroundExclude, testInfo });
        await disabledFeatures.customVirtualBackgroundExclude();
      });
    });

    test.describe.serial(() => {
      test('Slide Snapshot', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.slideSnapshotDisabled, testInfo });
        await disabledFeatures.slideSnapshot();
      });
      test('Slide Snapshot (exclude)', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.slideSnapshotExclude, testInfo });
        await disabledFeatures.slideSnapshotExclude();
      });
    });

    test.describe.serial(() => {
      test('Camera As Content', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.cameraAsContent, testInfo });
        await disabledFeatures.cameraAsContent();
      });
      test('Camera As Content (exclude)', async ({ browser, context, page }, testInfo) => {
        const disabledFeatures = new DisabledFeatures(browser, context);
        await disabledFeatures.initModPage(page, true, { createParameter: c.cameraAsContentExclude, testInfo });
        await disabledFeatures.cameraAsContentExclude();
      });
    });
  });
});

test.describe.parallel('Custom Parameters', { tag: '@ci' }, () => {
  test('Show Public Chat On Login', async ({ browser, context, page }, testInfo) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { joinParameter: c.showPublicChatOnLogin, testInfo });
    await customParam.showPublicChatOnLogin();
  });

  test('Show Participants on Login', async ({ browser, context, page }, testInfo) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { joinParameter: c.showParticipantsOnLogin, testInfo });
    await customParam.showParticipantsOnLogin();
  });

  test('Show Session Details on Join', async ({ browser, context, page }, testInfo) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, false, { joinParameter: c.showSessionDetailsOnJoin, skipSessionDetailsModal: false, testInfo });
    await customParam.showSessionDetailsOnJoin();
  });

  test('Client title', async ({ browser, context, page }, testInfo) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { joinParameter: c.clientTitle, testInfo });
    await customParam.clientTitle();
  });

  test('Display Branding Area', async ({ browser, context, page }, testInfo) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { createParameter: `${c.displayBrandingArea}&${encodeCustomParams(c.logo)}`, testInfo });
    await customParam.displayBrandingArea();
  });

  test('Shortcuts', async ({ browser, context, page }, testInfo) => {
    const customParam = new CustomParameters(browser, context);
    const shortcutParam = getAllShortcutParams();
    await customParam.initModPage(page, true, { joinParameter: encodeCustomParams(shortcutParam) });
    await customParam.initUserPage(true, context, { useModMeetingId: true, testInfo });
    await customParam.shortcuts();
  });

  test('Custom Styles: CSS code', async ({ browser, context, page }, testInfo) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { joinParameter: encodeCustomParams(c.customStyle), testInfo });
    await customParam.customStyle();
  });

  test('Custom Styles: URL', async ({ browser, context, page }, testInfo) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { joinParameter: encodeCustomParams(c.customStyleUrl), testInfo });
    await customParam.customStyle();
  });

  test('Auto Swap Layout', async ({ browser, context, page }, testInfo) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { joinParameter: c.autoSwapLayout, testInfo });
    await customParam.autoSwapLayout();
  });

  test('Hide Actions Bar', async ({ browser, context, page }, testInfo) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { joinParameter: c.hideActionsBar, testInfo });
    await customParam.hideActionsBarTest();
  });

  test('Override Default Locale', async ({ browser, context, page }, testInfo) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { joinParameter: c.overrideDefaultLocale, testInfo });
    await customParam.overrideDefaultLocaleTest();
  });

  test('Hide NavBar', async ({ browser, context, page }, testInfo) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { joinParameter: c.hideNavBar, testInfo });
    await customParam.hideNavBarTest();
  });

  test('Preferred Camera Profile', async ({ browser, context, page }, testInfo) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { joinParameter: c.preferredCameraProfile, testInfo });
    await customParam.preferredCameraProfileTest();
  });

  test('Set webcam background by passing URL', async ({ browser, context, page }, testInfo) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { joinParameter: c.webcamBackgroundPassingURL, testInfo });
    await customParam.webcamBackgroundURL();
  });

  test('Logout URL', async ({ browser, context, page }, testInfo) => {
    const customParam = new CustomParameters(browser, context);
    await customParam.initModPage(page, true, { joinParameter: c.logoutURL, testInfo });
    await customParam.logoutURLTest();
  });

  test.describe.parallel('Audio', () => {
    test('Auto join', async ({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, false, { joinParameter: c.autoJoin, testInfo });
      await customParam.autoJoin();
    });

    test('Disable Listen Only Mode', async ({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, false, { joinParameter: c.listenOnlyMode, testInfo });
      await customParam.listenOnlyMode();
    });

    test('Force Listen Only', async ({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initUserPage(false, context, { useModMeetingId: false, joinParameter: c.forceListenOnly, testInfo });
      await customParam.forceListenOnly(page);
    });

    test('Skip audio check', async ({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, false, { joinParameter: c.skipCheck, testInfo });
      await customParam.skipCheck();
    });

    test('Skip audio check on first join', async ({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, false, { joinParameter: c.skipCheckOnFirstJoin, testInfo });
      await customParam.skipCheckOnFirstJoin();
    });

    test('Skip echo test if previous device', async ({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, false, { joinParameter: c.skipEchoTestIfPreviousDevice, testInfo });
      await customParam.skipEchoTestIfPreviousDevice();
    });
  });

  test.describe.parallel('Hide Presentation On Join', () => {
    test('Hide Presentation on join', async ({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: c.hidePresentationOnJoin, testInfo });
      await customParam.initUserPage(true, context, { useModMeetingId: true, joinParameter: c.hidePresentationOnJoin, testInfo });
      await customParam.hidePresentationOnJoin();
    });

    test('After Sharing Screen', async ({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: c.hidePresentationOnJoin, testInfo });
      await customParam.initUserPage(true, context, { useModMeetingId: true, joinParameter: c.hidePresentationOnJoin, testInfo });
      await customParam.hidePresentationOnJoinScreenshare();
    });

    test('After Sharing External video', { tag: '@flaky' }, async({ browser, context, page }, testInfo) => {
      //requiring logged user to start external video on CI environment
      linkIssue(21589);
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: c.hidePresentationOnJoin, testInfo });
      await customParam.initUserPage(true, context, { useModMeetingId: true, joinParameter: c.hidePresentationOnJoin, testInfo });
      await customParam.hidePresentationOnJoinShareExternalVideo();
    });

    test('After Pinning and unpinning shared notes', async({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: c.hidePresentationOnJoin, testInfo });
      await customParam.initUserPage(true, context, { useModMeetingId: true, joinParameter: c.hidePresentationOnJoin, testInfo });
      await customParam.hidePresentationOnJoinPinSharedNotes();
    });

    test('After Changing Layout', async({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: c.hidePresentationOnJoin, testInfo });
      await customParam.initUserPage(true, context, { useModMeetingId: true, joinParameter: c.hidePresentationOnJoin, testInfo });
      await customParam.hidePresentationOnJoinChangeLayout();
    });

    test('After Returning from breakouts', async({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: c.hidePresentationOnJoin, testInfo });
      await customParam.initUserPage(true, context, { useModMeetingId: true, joinParameter: c.hidePresentationOnJoin, testInfo });
      await customParam.hidePresentationOnJoinReturnFromBreakouts();
    });

    test('After Uploading large presentation', async({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: c.hidePresentationOnJoin, testInfo });
      await customParam.initUserPage(true, context, { useModMeetingId: true, joinParameter: c.hidePresentationOnJoin, testInfo });
      await customParam.hidePresentationOnJoinUploadLargePresentation();
    });
  });

  test.describe.parallel('Presentation', () => {
    test('Force restore presentation on new events', async ({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { testInfo });
      await customParam.initUserPage(true, context, { useModMeetingId: true, joinParameter: c.forceRestorePresentationOnNewEvents, testInfo });
      await customParam.forceRestorePresentationOnNewEvents();
    });
  });

  test.describe.parallel('Webcam', () => {
    test('Disable Webcam Sharing', async ({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: c.enableVideo, testInfo });
      await customParam.enableVideo();
    });

    test('Skip Video Preview', async ({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: c.skipVideoPreview, testInfo });
      await customParam.skipVideoPreview();
    });

    test('Skip Video Preview on First Join', async ({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: c.skipVideoPreviewOnFirstJoin, testInfo });
      await customParam.skipVideoPreviewOnFirstJoin();
    });

    test('Skip Video Preview if Previous Device', async ({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: c.skipVideoPreviewIfPreviousDevice, testInfo });
      await customParam.skipVideoPreviewIfPreviousDevice();
    });

    test('Mirror Own Webcam', async ({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: c.mirrorOwnWebcam, testInfo });
      await customParam.mirrorOwnWebcam();
    });
  });

  test.describe.parallel('Whiteboard', () => {
    test('Multi Users Pen Only', async ({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { testInfo });
      await customParam.initUserPage(true, context, { useModMeetingId: true, joinParameter: c.multiUserPenOnly, testInfo });
      await customParam.multiUserPenOnly();
    });

    test('Presenter Tools', async ({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: encodeCustomParams(c.presenterTools), testInfo });
      await customParam.presenterTools();
    });

    test('Multi Users Tools', async ({ browser, context, page }, testInfo) => {
      const customParam = new CustomParameters(browser, context);
      await customParam.initModPage(page, true, { joinParameter: encodeCustomParams(c.multiUserTools), testInfo });
      await customParam.initUserPage(true, context, { useModMeetingId: true, joinParameter: encodeCustomParams(c.multiUserTools), testInfo });
      await customParam.multiUserTools();
    });
  });
});
