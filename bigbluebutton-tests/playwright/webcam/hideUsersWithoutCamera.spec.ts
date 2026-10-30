import { test } from '../core/setup/fixtures';
import { HIDE_USERS_WITHOUT_CAMERA_PARAMETER, HideUsersWithoutCamera } from './hideUsersWithoutCamera';

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

  test('Meeting created with hideUsersWithoutCamera=true starts with camera-less tiles hidden', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const hideUsersWithoutCamera = new HideUsersWithoutCamera(browser, context);
    await hideUsersWithoutCamera.initModPage(page, { createParameter: HIDE_USERS_WITHOUT_CAMERA_PARAMETER, testInfo });
    await hideUsersWithoutCamera.initUserPage(context, { testInfo });
    await hideUsersWithoutCamera.startWithUsersWithoutCameraHidden();
  });
});
