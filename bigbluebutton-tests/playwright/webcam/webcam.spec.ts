import { Browser, devices } from '@playwright/test';

import { linkIssue } from '../core/helpers';
import { trackPeerConnections } from '../core/rtcStatsProbe';
import { chromiumBaseArgs } from '../core/setup/browsersConfig';
import { test } from '../core/setup/fixtures';
import { MultiUsers } from '../user/multiusers';
import { addSecondFakeCamera, CameraCaps } from './cameraCaps';
import { CONSTRAINT_OBJECT_PROFILES_MODULE, Webcam } from './webcam';

// The suite's 160x120 camera file is too small for simulcast layers (480px and
// up); Chromium's built-in fake camera follows the profile's resolution.
const launchWithFakeDeviceCamera = (browser: Browser) => browser.browserType().launch({ args: chromiumBaseArgs });

test.describe.parallel('Webcam', { tag: ['@ci', '@media'] }, () => {
  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#joining-webcam-automated
  test('Shares webcam', async ({ browser, page }, testInfo) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, { testInfo });
    await webcam.share();
  });

  test('Checks content of webcam', async ({ browser, page }, testInfo) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, { testInfo });
    await webcam.checksContent();
  });

  test('Viewer receives the shared webcam', async ({ browser, context, page }, testInfo) => {
    await trackPeerConnections(context);
    const webcam = new MultiUsers(browser, context);
    await webcam.initModPage(page, { testInfo });
    await webcam.initUserPage(context, { testInfo });
    await webcam.viewerReceivesWebcam();
  });

  test('Webcam talking indicator', async ({ browser, page }, testInfo) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, { testInfo, shouldCloseAudioModal: false });
    await webcam.talkingIndicator();
  });

  test('Mirror webcam', async ({ browser, page }, testInfo) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, { testInfo });
    await webcam.mirrorWebcam();
  });

  test('Pinning and unpinning webcams', async ({ browser, context, page, browserName }, testInfo) => {
    test.skip(browserName === 'firefox', 'It only works manually on Firefox');
    const webcam = new MultiUsers(browser, context);
    await webcam.initModPage(page, { testInfo });
    await webcam.initUserPage(context, { testInfo });
    await webcam.initModPage2(context, { testInfo });
    await webcam.pinningWebcams();
  });

  test('Change video quality', async ({ browser, page }, testInfo) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, { testInfo });
    await webcam.changeVideoQuality();
  });

  test('Share webcam with a quality profile using constraint objects', async ({ browser, browserName }, testInfo) => {
    test.skip(browserName !== 'chromium', 'Uses the Chromium fake camera');
    const cameraBrowser = await launchWithFakeDeviceCamera(browser);
    try {
      const page = await (await cameraBrowser.newContext()).newPage();
      const webcam = new Webcam(cameraBrowser, page);
      await webcam.init(true, { testInfo, createModules: CONSTRAINT_OBJECT_PROFILES_MODULE });
      await webcam.shareWithQuality('minimal');
      await webcam.shareWithQuality('medium');
    } finally {
      await cameraBrowser.close();
    }
  });

  test('Webcam fullscreen', async ({ browser, page }, testInfo) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, { testInfo });
    await webcam.webcamFullscreen();
  });

  test('Disable Self-view', async ({ browser, page }, testInfo) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, { testInfo });
    await webcam.disableSelfView();
  });

  test('Focus and Unfocus webcam', async ({ browser, context, page }, testInfo) => {
    const webcam = new MultiUsers(browser, context);
    await webcam.initModPage(page, { testInfo });
    await webcam.initUserPage(context, { testInfo });
    await webcam.initUserPage2(context, { testInfo });
    await webcam.focusUnfocusWebcam();
  });

  test('Resize webcam area', async ({ browser, page }, testInfo) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, { testInfo });
    await webcam.resizeWebcamArea();
  });

  test('Drag and drop webcam in different areas', async ({ browser, page }, testInfo) => {
    const webcam = new Webcam(browser, page);
    await webcam.init(true, { testInfo });
    await webcam.dragAndDropWebcamInDifferentAreas();
  });

  test.describe('Webcam background', () => {
    test('Select one of the default backgrounds', async ({ browser, page }, testInfo) => {
      const webcam = new Webcam(browser, page);
      await webcam.init(true, { testInfo });
      await webcam.applyBackground();
    });

    // following test is throwing failures due to mis-comparison screenshot
    // as the emulated video is not static, we may add a mask in the middle part - where it moves the most
    test('Managing new background', async ({ browser, page }, testInfo) => {
      const webcam = new Webcam(browser, page);
      await webcam.init(true, { testInfo });
      await webcam.managingNewBackground();
    });

    test('Keep background when rejoin', async ({ browser, context, page }, testInfo) => {
      const webcam = new Webcam(browser, page);
      await webcam.init(true, { testInfo });
      await webcam.keepBackgroundWhenRejoin(context);
    });

    test('Virtual background toggle is disabled on unsupported devices (iPhone)', async ({ browser }, testInfo) => {
      linkIssue(23756);
      const iPhone11 = devices['iPhone 11'];
      const context = await browser.newContext({ ...iPhone11 });
      const mobilePage = await context.newPage();
      const webcam = new Webcam(browser, mobilePage);
      await webcam.init(true, { testInfo });
      await webcam.virtualBackgroundToggleDisabledOnUnsupportedDevice();
      await context.close();
    });
  });

  test.describe('Camera caps', () => {
    test('User camera cap refuses a second camera', async ({ browser, context, page }, testInfo) => {
      await addSecondFakeCamera(page);
      const cameraCaps = new CameraCaps(browser, context);
      await cameraCaps.initModPage(page, { createParameter: 'userCameraCap=1', testInfo });
      await cameraCaps.userCameraCap();
    });

    test('Meeting camera cap refuses the camera of another user', async ({ browser, context, page }, testInfo) => {
      const cameraCaps = new CameraCaps(browser, context);
      await cameraCaps.initModPage(page, { createParameter: 'meetingCameraCap=1', testInfo });
      await cameraCaps.initUserPage(context, { testInfo });
      await cameraCaps.meetingCameraCap();
    });
  });
});
