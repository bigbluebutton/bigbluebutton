import { test } from '../core/setup/fixtures';
import { HideUsersWithoutCamera } from './hideUsersWithoutCamera';

// docs/docs/testing/release-testing.md#hide-participants-without-camera-automated
test.describe.parallel('Hide participants without camera', { tag: '@ci' }, () => {
  test('Moderator hides and restores camera-less tiles for the whole meeting', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const hideUsersWithoutCamera = new HideUsersWithoutCamera(browser, context);
    await hideUsersWithoutCamera.initModPage(page, { testInfo });
    await hideUsersWithoutCamera.initUserPage(context, { testInfo });
    await hideUsersWithoutCamera.hideAndRestoreUsersWithoutCamera();
  });
});
