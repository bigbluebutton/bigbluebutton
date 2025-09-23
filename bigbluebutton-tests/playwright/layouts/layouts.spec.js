const { test } = require('../fixtures');
const { fullyParallel } = require('../playwright.config');
const { Layouts } = require('./layouts');
const { initializePages } = require('../core/helpers');

test.describe('Layout', { tag: '@ci' }, () => {
  const layouts = new Layouts();

  test.describe.configure({ mode: fullyParallel ? 'parallel' : 'serial' });
  test[fullyParallel ? 'beforeEach' : 'beforeAll'](async ({ browser }, testInfo) => {
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

  test("Video Pagination", async ({ browser }) => {
    await layouts.videoPagination(browser);
  });
});
