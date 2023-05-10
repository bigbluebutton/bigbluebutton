const { test } = require('@playwright/test');
const { encodeCustomParams } = require('../customparameters/util');
const { PARAMETER_HIDE_PRESENTATION_TOAST } = require('../core/constants');
const { Layouts } = require('./layouts');

const hidePresentationToast = encodeCustomParams(PARAMETER_HIDE_PRESENTATION_TOAST);

const CUSTOM_MEETING_ID = 'layout_management_meeting';

test.describe.serial('Layout management', () => {
  const layouts = new Layouts();

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await layouts.initModPage(page, true,  { customParameter: hidePresentationToast, customMeetingId: CUSTOM_MEETING_ID });
    await layouts.initUserPage(true, context, { customParameter: hidePresentationToast });
    await layouts.modPage.shareWebcam();
    await layouts.userPage.shareWebcam();
  });

  test('Focus on presentation', async () => {
    await layouts.focusOnPresentation();
  });

  test('Focus on video', async () => {
    await layouts.focusOnVideo();
  });

  test('Smart layout', async () => {
    await layouts.smartLayout();
  });

  test('Custom layout', async () => {
    await layouts.customLayout();
  });

  test('Push layout to all', async () => {
    await layouts.pushLayout();
  });
});
