import { expect } from '@playwright/test';

import { linkIssue } from '../core/helpers';
import { Page } from '../core/page';
import { test } from '../core/setup/fixtures';
import { constants as c } from '../parameters/constants';
import { Recording } from './recording';

test.describe.parallel('Recording', { tag: '@ci' }, () => {
  let generatedRecordingPlaybackUrl: string;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const recording = new Recording(browser, context);
    await recording.initModPage(page, { createParameter: c.recordMeeting });
    generatedRecordingPlaybackUrl = await recording.recordMeeting();
  });

  test.beforeEach(async ({ page }) => {
    const response = await page.goto(generatedRecordingPlaybackUrl);
    expect(response?.ok(), 'playback URL should be accessible').toBeTruthy();
    await page.waitForLoadState('domcontentloaded');
  });

  test('Generate a valid and accessible playback recording link', async ({ browser, context, page }) => {
    // recording generation is done in beforeAll hook
    const recording = new Recording(browser, context);
    recording.playbackPage = new Page(browser, page);
    await recording.accessPlayback();
  });

  test('Dark mode', async ({ browser, context, page }) => {
    const recording = new Recording(browser, context);
    recording.playbackPage = new Page(browser, page);
    await recording.darkMode();
  });

  test('Swap content', async ({ browser, context, page }) => {
    const recording = new Recording(browser, context);
    recording.playbackPage = new Page(browser, page);
    await recording.swapContent();
  });

  test('Toggle chat and notes', async ({ browser, context, page }) => {
    const recording = new Recording(browser, context);
    recording.playbackPage = new Page(browser, page);
    await recording.toggleChatNotes();
  });

  test.describe.parallel('Player', () => {
    test('Play/Pause', async ({ browser, context, page }) => {
      const recording = new Recording(browser, context);
      recording.playbackPage = new Page(browser, page);
      await recording.playPause();
    });

    test('Seek forward and backward', async ({ browser, context, page }) => {
      const recording = new Recording(browser, context);
      recording.playbackPage = new Page(browser, page);
      await recording.seekBarForwardBackward();
    });
  });
});

test.describe('Recording with audio', { tag: ['@ci', '@media'] }, () => {
  test('Generate a recording that captures microphone audio', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const recording = new Recording(browser, context);
    // keep the audio modal open so the moderator can join the fake microphone
    await recording.initModPage(page, { createParameter: c.recordMeeting, shouldCloseAudioModal: false });
    const playbackUrl = await recording.recordMeetingWithAudio();
    expect(playbackUrl, 'should return a valid presentation playback URL').toContain('/playback/presentation/');
  });
});

test.describe('Recording with screenshare', { tag: ['@ci', '@media'] }, () => {
  test.beforeEach(({ browserName }) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not able in Firefox browser without desktop');
  });

  test('Keep presentation panzoom after screenshare stops', async ({ browser, page }, testInfo) => {
    linkIssue(25920);
    test.setTimeout(240_000);
    const recording = new Recording(browser, page.context());
    await recording.initModPage(page, { createParameter: c.recordMeeting, testInfo });
    await recording.recordScreensharePresentationTransition(false);
  });

  test('Reset presentation panzoom after switching presentations during screenshare', async ({
    browser,
    page,
  }, testInfo) => {
    linkIssue(25920);
    test.setTimeout(240_000);
    const recording = new Recording(browser, page.context());
    await recording.initModPage(page, { createParameter: c.recordMeeting, testInfo });
    await recording.recordScreensharePresentationTransition(true);
  });
});
