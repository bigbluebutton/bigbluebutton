import { test } from '../fixtures';
import { Layouts } from './layouts';
import { initializePages } from '../core/helpers.ts';

test.describe.parallel('Layout', { tag: '@ci' }, () => {
  const layouts = new Layouts();

  test.beforeEach(async ({ browser }, testInfo) => {
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
