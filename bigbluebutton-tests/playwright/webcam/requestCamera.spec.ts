import { Browser, BrowserContext, Page as PlaywrightPage, TestInfo } from '@playwright/test';

import { test } from '../core/setup/fixtures';
import { REQUEST_CAMERA_PARAMETER, RequestCamera } from './requestCamera';

// A moderator asks a participant to share their camera; the camera never starts
// without that consent. Requires allowModsToRequestCameraShare=true on create.
test.describe.parallel('Ask to share camera', { tag: ['@ci', '@media'] }, () => {
  const initPages = async (
    browser: Browser,
    context: BrowserContext,
    page: PlaywrightPage,
    testInfo: TestInfo,
  ): Promise<RequestCamera> => {
    const requestCamera = new RequestCamera(browser, context);
    await requestCamera.initModPage(page, { createParameter: REQUEST_CAMERA_PARAMETER, testInfo });
    await requestCamera.initUserPage(context, { testInfo });
    await requestCamera.skipUnlessWebcamSharingEnabled();
    await requestCamera.openUserLists();
    return requestCamera;
  };

  test('Attendee accepts and shares', async ({ browser, context, page }, testInfo) => {
    const requestCamera = await initPages(browser, context, page, testInfo);
    await requestCamera.attendeeAcceptsRequest();
  });

  test('Attendee declines', async ({ browser, context, page }, testInfo) => {
    const requestCamera = await initPages(browser, context, page, testInfo);
    await requestCamera.attendeeDeniesRequest();
  });

  test('Pending request survives a promotion to moderator', async ({ browser, context, page }, testInfo) => {
    const requestCamera = await initPages(browser, context, page, testInfo);
    await requestCamera.requestSurvivesPromotion();
  });

  test('Pending request survives becoming the presenter', async ({ browser, context, page }, testInfo) => {
    const requestCamera = await initPages(browser, context, page, testInfo);
    await requestCamera.requestSurvivesPresenterChange();
  });
});
