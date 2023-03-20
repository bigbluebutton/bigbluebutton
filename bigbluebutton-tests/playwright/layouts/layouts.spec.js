const { test } = require('@playwright/test');
const { FocusOnPresentation } = require('./focusOnPresentation');
const { FocusOnVideo } = require('./focusOnVideo');
const { MultiUsers } = require('../user/multiusers');
const { encodeCustomParams } = require('../customparameters/util');

const CUSTOM_MEETING_ID = 'layout_management_meeting';
const CUSTOM_STYLE = `userdata-bbb_custom_style=.presentationUploaderToast{display: none;}.currentPresentationToast{display:none;}`;

test.describe.parallel('Layout management', () => {
  test('Focus on presentation', async ({ browser, context, page }) => {
    const focusOnPresentation = new FocusOnPresentation(browser, context);
    await focusOnPresentation.initModPage(page, true, { customMeetingId: CUSTOM_MEETING_ID, customParameter: encodeCustomParams(CUSTOM_STYLE) });
    await focusOnPresentation.initModPage2(true, context, { customParameter: encodeCustomParams(CUSTOM_STYLE) });
    await focusOnPresentation.test();
  });
  test('Focus on video', async ({ browser, context, page }) => {
    const focusOnVideo = new FocusOnVideo(browser, context);
    await focusOnVideo.initModPage(page, true, { customMeetingId: CUSTOM_MEETING_ID, customParameter: encodeCustomParams(CUSTOM_STYLE) });
    await focusOnVideo.initModPage2(true, context, { customParameter: encodeCustomParams(CUSTOM_STYLE) });
    await focusOnVideo.test();
  });
});
