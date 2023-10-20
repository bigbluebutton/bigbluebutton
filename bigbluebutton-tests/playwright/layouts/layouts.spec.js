const { test } = require('@playwright/test');
const { fullyParallel } = require('../playwright.config');
const { encodeCustomParams } = require('../parameters/util');
const { PARAMETER_HIDE_PRESENTATION_TOAST } = require('../core/constants');
const { Layouts } = require('./layouts');

const hidePresentationToast = encodeCustomParams(PARAMETER_HIDE_PRESENTATION_TOAST);

const CUSTOM_MEETING_ID = 'layout_management_meeting';

if (!fullyParallel) test.describe.configure({ mode: 'serial' });

test.describe("Layout management", () => {
  const layouts = new Layouts();

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await layouts.initModPage(page, true, { createParameter: hidePresentationToast, customMeetingId: CUSTOM_MEETING_ID });
    await layouts.initUserPage(true, context, { createParameter: hidePresentationToast });
    await layouts.modPage.shareWebcam();
    await layouts.userPage.shareWebcam();
  });

  test("Focus on presentation", async () => {
    await layouts.focusOnPresentation();
  });

  test("Focus on video", async () => {
    await layouts.focusOnVideo();
  });

  test("Smart layout", async () => {
    await layouts.smartLayout();
  });

  test("Custom layout", async () => {
    await layouts.customLayout();
  });

  test("Update everyone's layout", async () => {
    await layouts.updateEveryone();
  });
});
