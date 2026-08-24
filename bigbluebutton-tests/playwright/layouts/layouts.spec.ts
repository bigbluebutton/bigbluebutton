import { elements as e } from '../core/elements';
import { initializePages, linkIssue } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { Layouts } from './layouts';

test.describe.parallel('Unified Layout - meeting create param', { tag: '@ci' }, () => {
  test('First minimize of presentation shows participant tiles for moderator', async ({ browser, context }, testInfo) => {
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
  test('First minimize of presentation shows participant tiles for moderator', async ({ browser, context }, testInfo) => {
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
  test('Speaking with no webcams keeps avatar tiles hidden while the presentation is visible', async ({ browser, context }, testInfo) => {
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
