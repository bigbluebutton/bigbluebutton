import { RECORDING_PROCESSING_WAIT_TIME } from '../core/constants';
import { Page } from '../core/page';
import { test } from '../core/setup/fixtures';
import { constants as c } from '../parameters/constants';
import { RecordedMeeting, RecordedPlayback } from './recordedPlayback';

test.describe('Recorded media', { tag: ['@nightly', '@media'] }, () => {
  let recorded: RecordedMeeting;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(RECORDING_PROCESSING_WAIT_TIME + 3 * 60000);
    const context = await browser.newContext();
    const page = await context.newPage();
    const recording = new RecordedPlayback(browser, context);
    await recording.initModPage(page, { createParameter: c.recordMeeting, shouldCloseAudioModal: false });
    recorded = await recording.recordMeetingWithMedia();
  });

  test.beforeEach(() => {
    const { recordId, recordedSeconds, marks } = recorded;
    test
      .info()
      .annotations.push({ type: 'recording', description: JSON.stringify({ recordId, recordedSeconds, marks }) });
  });

  test('Playback has the recorded webcam for the whole recording', async ({ browser, context, page }) => {
    const recording = new RecordedPlayback(browser, context);
    recording.playbackPage = new Page(browser, page);
    await recording.webcamsVideo(recorded);
  });

  test('Playback shows the recorded screenshare after seeking to it', async ({ browser, context, page }) => {
    const recording = new RecordedPlayback(browser, context);
    recording.playbackPage = new Page(browser, page);
    await recording.screenshareAfterSeeking(recorded);
  });

  test('Playback has the recorded microphone audio', async ({ browser, context, page }) => {
    const recording = new RecordedPlayback(browser, context);
    recording.playbackPage = new Page(browser, page);
    await recording.recordedAudioIsNotSilent(recorded);
  });

  test('Podcast format has the recorded audio', async ({ browser, context, page }) => {
    const recording = new RecordedPlayback(browser, context);
    recording.playbackPage = new Page(browser, page);
    await recording.podcastFormat(recorded);
  });

  test('Video format has a video of the recording', async ({ browser, context, page }) => {
    const recording = new RecordedPlayback(browser, context);
    recording.playbackPage = new Page(browser, page);
    await recording.videoFormat(recorded);
  });

  test('Screenshare format has a video of the recording', async ({ browser, context, page }) => {
    const recording = new RecordedPlayback(browser, context);
    recording.playbackPage = new Page(browser, page);
    await recording.screenshareFormat(recorded);
  });
});
