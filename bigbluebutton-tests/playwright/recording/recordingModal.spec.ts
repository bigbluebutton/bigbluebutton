import { linkIssue } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { constants as c } from '../parameters/constants';
import { Recording } from './recording';

test.describe('Recording confirmation toast', { tag: '@ci' }, () => {
  test('Does not block other modals from opening', async ({ browser, context, page }, testInfo) => {
    linkIssue(25323);
    const recording = new Recording(browser, context);
    await recording.initModPage(page, { createParameter: c.recordMeeting, testInfo });
    await recording.recordingToastDoesNotBlockModals();
  });
});
