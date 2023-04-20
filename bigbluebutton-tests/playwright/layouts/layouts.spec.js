const { test } = require('@playwright/test');
const { FocusOnPresentation } = require('./focusOnPresentation');
const { FocusOnVideo } = require('./focusOnVideo');
const { encodeCustomParams } = require('../customparameters/util');
const { PARAMETER_HIDE_PRESENTATION_TOAST } = require('../core/constants');

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
});
