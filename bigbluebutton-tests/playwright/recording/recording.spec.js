const { test } = require('../fixtures');
const c = require('../parameters/constants')
const { Recording } = require('./recording');

test.describe.parallel('Recording', { tag: '@ci' }, () => {
  test('Generate a valid and accessible playback recording link', async ({ browser, context, page }) => {
    const recording = new Recording(browser, context);
    await recording.initModPage(page, true, { createParameter: c.recordMeeting });
    await recording.recordMeeting();
  });
});
