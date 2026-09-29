import { test } from '../core/setup/fixtures';
import { constants as c } from '../parameters/constants';
import { Recording } from './recording';

// Audio plays no part in the indicator, so it is skipped rather than joined.
const joinWithoutAudio = { joinParameter: c.autoJoin, shouldCloseAudioModal: false };

test.describe.parallel('Recording indicator', { tag: '@ci' }, () => {
  test('Keeps its label at rest when the collapse is off', async ({ browser, context, page }, testInfo) => {
    const recording = new Recording(browser, context);
    await recording.initModPage(page, { createParameter: c.recordMeeting, ...joinWithoutAudio, testInfo });
    await recording.recordingIndicatorKeepsLabelAtRest();
  });

  test('Collapses at rest and reveals its label on hover and keyboard focus when the collapse is on', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const recording = new Recording(browser, context);
    await recording.initModPage(page, { createParameter: c.recordMeeting, ...joinWithoutAudio, testInfo });
    await recording.recordingIndicatorCollapsesAtRest();
  });

  test('Tells a viewer the meeting is recording instead of offering to pause it', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const recording = new Recording(browser, context);
    await recording.initModPage(page, { createParameter: c.recordMeeting, ...joinWithoutAudio, testInfo });
    await recording.initUserPage(context, { ...joinWithoutAudio, testInfo });
    await recording.recordingIndicatorIsReadOnlyForViewers();
  });
});
