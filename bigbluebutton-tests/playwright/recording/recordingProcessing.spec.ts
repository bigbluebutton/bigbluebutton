import { ELEMENT_WAIT_LONGER_TIME, RECORDING_PROCESSING_WAIT_TIME } from '../core/constants';
import { test } from '../core/setup/fixtures';
import { constants as c } from '../parameters/constants';
import { RecordedPlayback } from './recordedPlayback';

test.describe('Recording processing', { tag: '@nightly' }, () => {
  test('getRecordingProcessingInfo shows a recording processing until it is published', async ({
    browser,
    context,
    page,
  }) => {
    test.setTimeout(RECORDING_PROCESSING_WAIT_TIME + 2 * ELEMENT_WAIT_LONGER_TIME + 3 * 60000);
    const recording = new RecordedPlayback(browser, context);
    await recording.initModPage(page, { createParameter: c.recordMeeting });
    await recording.processingUntilPublished();
  });
});
