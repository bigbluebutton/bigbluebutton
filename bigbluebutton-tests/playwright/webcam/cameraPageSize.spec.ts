import { test } from '../core/setup/fixtures';
import {
  CAMERA_PAGE_SIZE_CLIENT_SETTINGS_OVERRIDE,
  CameraPageSize,
  THRESHOLD_LIMIT_CLIENT_SETTINGS_OVERRIDE,
  WEBCAM_GRID_DISABLED_PARAMETER,
  WEBCAM_USERS,
} from './cameraPageSize';

// docs/docs/testing/release-testing.md#cameras-in-view-partially-automated
test.describe.parallel('Cameras in view', { tag: '@ci' }, () => {
  test('Moderator sets how many cameras each page shows for the whole meeting', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    // Six users join in turn, three of them sharing a webcam: 170-200 s on a two-core box.
    test.setTimeout((WEBCAM_USERS + 3) * 40_000 + 60_000);
    const cameraPageSize = new CameraPageSize(browser, context);
    await cameraPageSize.initModPage(page, {
      testInfo,
      createClientSettingsOverride: CAMERA_PAGE_SIZE_CLIENT_SETTINGS_OVERRIDE,
    });
    await cameraPageSize.initUserPage(context, { testInfo });
    await cameraPageSize.setCameraPageSizeForEveryone();
  });

  test('Layout view shows only the camera page size without the webcam grid', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const cameraPageSize = new CameraPageSize(browser, context);
    await cameraPageSize.initModPage(page, { createParameter: WEBCAM_GRID_DISABLED_PARAMETER, testInfo });
    await cameraPageSize.sliderWithoutWebcamGrid();
  });

  test('The slider names the limit a pagination threshold sets', async ({ browser, context, page }, testInfo) => {
    const cameraPageSize = new CameraPageSize(browser, context);
    await cameraPageSize.initModPage(page, {
      testInfo,
      createClientSettingsOverride: THRESHOLD_LIMIT_CLIENT_SETTINGS_OVERRIDE,
    });
    await cameraPageSize.initUserPage(context, { testInfo });
    await cameraPageSize.sliderNamesThresholdLimit();
  });
});
