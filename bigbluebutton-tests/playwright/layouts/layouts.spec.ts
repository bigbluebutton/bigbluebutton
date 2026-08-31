import { elements as e } from '../core/elements';
import { initializePages, linkIssue } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { Layouts, MOBILE_VIEWPORT } from './layouts';

test.describe.parallel('Unified Layout - meeting create param', { tag: '@ci' }, () => {
  test('First minimize of presentation shows participant tiles for moderator', async ({
    browser,
    context,
  }, testInfo) => {
    const layouts = new Layouts(browser, context);
    await initializePages(layouts, browser, {
      isMultiUser: true,
      createParameter: 'meetingLayout=UNIFIED_LAYOUT',
      testInfo,
      recordVideo: true,
    });
    await layouts.unifiedLayoutMinimizeShowsTiles();
  });
});

test.describe.parallel('Unified Layout - meeting create param - with audio', { tag: '@ci' }, () => {
  test('First minimize of presentation shows participant tiles for moderator', async ({
    browser,
    context,
  }, testInfo) => {
    const layouts = new Layouts(browser, context);
    await initializePages(layouts, browser, {
      isMultiUser: false,
      createParameter: 'meetingLayout=UNIFIED_LAYOUT',
      testInfo,
      recordVideo: true,
    });
    await layouts.modPage.waitAndClick(e.joinAudio);
    await layouts.modPage.joinMicrophone({ shouldUnmute: false });
    await layouts.initUserPage();
    await layouts.unifiedLayoutMinimizeShowsTiles();
  });
});

test.describe.parallel('Unified Layout - who-is-talking tiles (no webcams)', { tag: '@ci' }, () => {
  test('Speaking with no webcams keeps avatar tiles hidden while the presentation is visible', async ({
    browser,
    context,
  }, testInfo) => {
    linkIssue(25235);
    const layouts = new Layouts(browser, context);
    await initializePages(layouts, browser, {
      isMultiUser: true,
      createParameter: 'meetingLayout=UNIFIED_LAYOUT',
      testInfo,
      recordVideo: true,
    });
    await layouts.unifiedLayoutHidesTilesWhenPresentationVisible();
  });
});

test.describe.parallel('Unified Layout - viewer minimize persistence', { tag: '@ci' }, () => {
  test(
    'Viewer keeps the presentation minimized while webcams come and go',
    { tag: '@media' },
    async ({ browser, context }, testInfo) => {
      linkIssue(25592);
      const layouts = new Layouts(browser, context);
      await initializePages(layouts, browser, {
        isMultiUser: true,
        createParameter: 'meetingLayout=UNIFIED_LAYOUT',
        // Rules out the restoreOnUpdate family: the presentation must stay minimized
        // because nothing about it changed, not because of any userdata, and the bug
        // under test reopens it even with the restore feature explicitly disabled.
        joinParameter: 'userdata-bbb_force_restore_presentation_on_new_events=false',
        testInfo,
        recordVideo: true,
      });
      await layouts.initUserPage2();
      await layouts.unifiedLayoutViewerMinimizeSticksOnCameraChanges();
    },
  );
});

test.describe.parallel('Unified Layout - focused camera replication', { tag: '@ci' }, () => {
  test(
    'Viewer follows a camera focus and keeps a local unfocus while webcams come and go',
    { tag: '@media' },
    async ({ browser, context }, testInfo) => {
      linkIssue(25592);
      const layouts = new Layouts(browser, context);
      await initializePages(layouts, browser, {
        isMultiUser: true,
        createParameter: 'meetingLayout=UNIFIED_LAYOUT',
        testInfo,
        recordVideo: true,
      });
      await layouts.initUserPage2();
      await layouts.initModPage2();
      await layouts.unifiedLayoutViewerFocusFollowSticksOnCameraChanges();
    },
  );
});

test.describe.parallel('Device type breakpoint crossing', { tag: '@ci' }, () => {
  // the audio modal is irrelevant to these layout assertions, and closing it on a
  // mobile-sized viewport is not reliable (the audio controls sit behind the open panel)
  const audioModalOff = {
    joinParameter: 'userdata-bbb_auto_join_audio=false',
    shouldCloseAudioModal: false,
  };

  test('Desktop layout is restored after the viewport crosses the mobile breakpoint and back', async ({
    browser,
  }, testInfo) => {
    linkIssue(25590);
    const context = await browser.newContext({ recordVideo: { dir: 'test-results/' } });
    const page = await context.newPage();
    const layouts = new Layouts(browser, context);
    await layouts.initModPage(page, { testInfo, ...audioModalOff });
    await layouts.desktopLayoutRestoredAfterMobileBreakpointRoundTrip();
  });

  test('Sidebar navigation toggle still works after the rail auto-collapses on mobile', async ({
    browser,
  }, testInfo) => {
    linkIssue(25590);
    const context = await browser.newContext({ recordVideo: { dir: 'test-results/' } });
    const page = await context.newPage();
    const layouts = new Layouts(browser, context);
    await layouts.initModPage(page, { testInfo, ...audioModalOff });
    await layouts.navigationRailToggleStillWorksAfterAutoCollapse();
  });

  test('Mobile layout is restored after the viewport crosses the desktop breakpoint and back', async ({
    browser,
  }, testInfo) => {
    linkIssue(25590);
    // own context: this leg must MOUNT the client below the breakpoint, since the
    // regression followed the mount-time device type
    const mobileContext = await browser.newContext({
      viewport: MOBILE_VIEWPORT,
      recordVideo: { dir: 'test-results/' },
    });
    const page = await mobileContext.newPage();
    const layouts = new Layouts(browser, mobileContext);
    await layouts.initModPage(page, { testInfo, ...audioModalOff });
    await layouts.mobileLayoutRestoredAfterDesktopBreakpointRoundTrip();
  });
});

test.describe.parallel('Unified Layout - phone landscape propagation', { tag: '@ci' }, () => {
  test(
    'Presenter shares a webcam without publishing an invalid presentation video rate',
    { tag: '@media' },
    async ({ browser }, testInfo) => {
      linkIssue(25681);
      const context = await browser.newContext({ recordVideo: { dir: 'test-results/' } });
      const layouts = new Layouts(browser, context);
      await layouts.configurePhoneLandscapeLayoutDelay();
      const page = await context.newPage();
      await layouts.initModPage(page, {
        createParameter: 'meetingLayout=UNIFIED_LAYOUT',
        clientSettingsOverrides: {
          public: { app: { defaultSettings: { layout: { pushLayout: true } } } },
        },
        testInfo,
      });
      await layouts.phoneLandscapePublishesFinitePresentationVideoRate();
    },
  );
});

test.describe.parallel('Layout', { tag: ['@flaky-3.1', '@media'] }, () => {
  let layouts: Layouts;

  test.beforeEach(async ({ browser, context }, testInfo) => {
    linkIssue(24367);
    layouts = new Layouts(browser, context);
    await initializePages(layouts, browser, { isMultiUser: true, testInfo });
    await layouts.modPage.shareWebcam();
    await layouts.userPage.shareWebcam();
  });

  test('Focus on presentation', async () => {
    await layouts.focusOnPresentation();
  });

  test('Grid Layout', async () => {
    await layouts.gridLayout();
  });

  test('Smart layout', async () => {
    await layouts.smartLayout();
  });

  test('Custom layout', async () => {
    await layouts.customLayout();
  });

  test("Update everyone's layout", async () => {
    await layouts.updateEveryone();
  });

  test('Video Pagination', async () => {
    await layouts.videoPagination();
  });
});
