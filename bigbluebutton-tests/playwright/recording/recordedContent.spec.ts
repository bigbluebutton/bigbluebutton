import { RECORDING_PROCESSING_WAIT_TIME } from '../core/constants';
import { Page } from '../core/page';
import { test } from '../core/setup/fixtures';
import { constants as c } from '../parameters/constants';
import { RecordedMeeting, RecordedPlayback } from './recordedPlayback';

test.describe('Recorded content', { tag: '@nightly' }, () => {
  let recorded: RecordedMeeting;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(RECORDING_PROCESSING_WAIT_TIME + 3 * 60000);
    const context = await browser.newContext();
    const page = await context.newPage();
    const recording = new RecordedPlayback(browser, context);
    await recording.initModPage(page, { createParameter: c.recordMeeting });
    await recording.initUserPage(context);
    recorded = await recording.recordMeetingWithContentAndPause();
  });

  test.beforeEach(() => {
    const { recordId, recordedSeconds, marks } = recorded;
    test
      .info()
      .annotations.push({ type: 'recording', description: JSON.stringify({ recordId, recordedSeconds, marks }) });
  });

  test('Playback shows a shape once past the time it was drawn', async ({ browser, context, page }) => {
    const recording = new RecordedPlayback(browser, context);
    recording.playbackPage = new Page(browser, page);
    await recording.shapeAfterSeeking(recorded);
  });

  test('Playback chat shows the published poll result', async ({ browser, context, page }) => {
    const recording = new RecordedPlayback(browser, context);
    recording.playbackPage = new Page(browser, page);
    await recording.pollResultInChat(recorded);
  });

  test('Playback leaves out the time the recording was paused', async ({ browser, context, page }) => {
    const recording = new RecordedPlayback(browser, context);
    recording.playbackPage = new Page(browser, page);
    await recording.pauseIsLeftOut(recorded);
  });

  test('Notes format has the shared notes', async ({ browser, context, page }) => {
    const recording = new RecordedPlayback(browser, context);
    recording.playbackPage = new Page(browser, page);
    await recording.notesFormat(recorded);
  });
});
