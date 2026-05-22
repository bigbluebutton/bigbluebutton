import { elements as e } from '../core/elements';
import { initializePages } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { Layouts } from './layouts';

test.describe.parallel('Unified Layout - meeting create param', () => {
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

test.describe.parallel('Unified Layout - join param', () => {
  test('First minimize of presentation shows participant tiles for moderator', async ({ browser, context }, testInfo) => {
    const layouts = new Layouts(browser, context);
    await initializePages(layouts, browser, {
      isMultiUser: true,
      joinParameter: 'userdata-bbb_change_layout=UNIFIED_LAYOUT',
      testInfo,
      recordVideo: true,
    });
    await layouts.unifiedLayoutMinimizeShowsTiles();
  });
});

test.describe.parallel('Unified Layout - concurrent user join', () => {
  test('Minimize concurrent with user joining shows participant tiles for moderator', async ({ browser, context }, testInfo) => {
    const layouts = new Layouts(browser, context);
    // Only moderator joins initially — the user join happens inside the test method,
    // overlapping with the minimize click to surface the race condition.
    await initializePages(layouts, browser, {
      isMultiUser: false,
      joinParameter: 'userdata-bbb_change_layout=UNIFIED_LAYOUT',
      testInfo,
      recordVideo: true,
    });
    await layouts.unifiedLayoutMinimizeConcurrentWithUserJoin();
  });
});

test.describe.parallel('Unified Layout - meeting create param - with audio', () => {
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

test.describe.parallel('Unified Layout - join param - with audio', () => {
  test('First minimize of presentation shows participant tiles for moderator', async ({ browser, context }, testInfo) => {
    const layouts = new Layouts(browser, context);
    await initializePages(layouts, browser, {
      isMultiUser: false,
      joinParameter: 'userdata-bbb_change_layout=UNIFIED_LAYOUT',
      testInfo,
      recordVideo: true,
    });
    await layouts.modPage.waitAndClick(e.joinAudio);
    await layouts.modPage.joinMicrophone({ shouldUnmute: false });
    await layouts.initUserPage(undefined, { joinParameter: 'userdata-bbb_change_layout=UNIFIED_LAYOUT' });
    await layouts.unifiedLayoutMinimizeShowsTiles();
  });
});

test.describe.parallel('Unified Layout - concurrent user join - with audio', () => {
  test('Minimize concurrent with user joining shows participant tiles for moderator', async ({ browser, context }, testInfo) => {
    const layouts = new Layouts(browser, context);
    await initializePages(layouts, browser, {
      isMultiUser: false,
      joinParameter: 'userdata-bbb_change_layout=UNIFIED_LAYOUT',
      testInfo,
      recordVideo: true,
    });
    await layouts.modPage.waitAndClick(e.joinAudio);
    await layouts.modPage.joinMicrophone({ shouldUnmute: false });
    await layouts.unifiedLayoutMinimizeConcurrentWithUserJoin();
  });
});

test.describe.parallel('Layout', { tag: '@ci' }, () => {
  let layouts: Layouts;

  test.beforeEach(async ({ browser, context }, testInfo) => {
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
