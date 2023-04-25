const { test } = require('@playwright/test');
const { FocusOnPresentation } = require('./focusOnPresentation');
const { FocusOnVideo } = require('./focusOnVideo');
const { encodeCustomParams } = require('../customparameters/util');
const { PARAMETER_HIDE_PRESENTATION_TOAST } = require('../core/constants');
const { SmartLayout } = require('./smartLayout');
const { CustomLayout } = require('./customLayout');
const { PushLayout } = require('./pushLayout');

const hidePresentationToast = encodeCustomParams(PARAMETER_HIDE_PRESENTATION_TOAST);

const CUSTOM_MEETING_ID = 'layout_management_meeting';

test.describe.parallel('Layout management', () => {
  test('Focus on presentation', async ({ browser, context, page }) => {
    const focusOnPresentation = new FocusOnPresentation(browser, context);
    await focusOnPresentation.initModPage(page, true, { customMeetingId: CUSTOM_MEETING_ID, customParameter: hidePresentationToast });
    await focusOnPresentation.initModPage2(true, context, { customParameter: hidePresentationToast });
    await focusOnPresentation.test();
  });

  test('Focus on video', async ({ browser, context, page }) => {
    const focusOnVideo = new FocusOnVideo(browser, context);
    await focusOnVideo.initModPage(page, true, { customMeetingId: CUSTOM_MEETING_ID, customParameter: hidePresentationToast });
    await focusOnVideo.initModPage2(true, context, { customParameter: hidePresentationToast });
    await focusOnVideo.test();
  });

  test('Smart layout', async ({ browser, context, page }) => {
    const smartLayout = new SmartLayout(browser, context);
    await smartLayout.initModPage(page, true, { customMeetingId: CUSTOM_MEETING_ID, customParameter: hidePresentationToast });
    await smartLayout.initUserPage(true, context, { customParameter: hidePresentationToast });
    await smartLayout.test();
  });

  test('Custom layout', async ({ browser, context, page }) => {
    const customLayout = new CustomLayout(browser, context);
    await customLayout.initModPage(page, true, { customMeetingId: CUSTOM_MEETING_ID, customParameter: hidePresentationToast });
    await customLayout.initUserPage(true, context, { customParameter: hidePresentationToast });
    await customLayout.test();
  });

  test('Push layout to all', async ({ browser, context, page }) => {
    const pushLayout = new PushLayout(browser, context);
    await pushLayout.initModPage(page, true, { customMeetingId: CUSTOM_MEETING_ID, customParameter: hidePresentationToast });
    await pushLayout.initUserPage(true, context, { customParameter: hidePresentationToast });
    await pushLayout.test();
  });
});
