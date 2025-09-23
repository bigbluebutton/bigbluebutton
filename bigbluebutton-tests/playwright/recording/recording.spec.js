const { test } = require('../fixtures');
const Page = require('../core/page');
const c = require('../parameters/constants');
const { Recording } = require('./recording');
const { expect } = require('@playwright/test');

test.describe.parallel('Recording', { tag: '@ci' }, () => {
  let recordedMeetingID;

  test.beforeAll(async ({ browser }) => {
    // Record meeting
    const context = await browser.newContext();
    const page = await context.newPage();
    const recording = new Recording(browser, context);
    await recording.initModPage(page, true, { createParameter: c.recordMeeting });
    await recording.recordMeeting();
    recordedMeetingID = recording.modPage.meetingId;
  });

  test.describe.parallel('Presentation format', () => {
    let presentationPlaybackUrl;

    test.beforeAll(async ({ browser }) => {
      // validate playback presentation format
      const context = await browser.newContext();
      const page = await context.newPage();
      const recording = new Recording(browser, context);
      recording.playbackPage = new Page(browser, page);
      presentationPlaybackUrl = await recording.validatePlaybackFormat(recordedMeetingID, 'presentation');
    });

    test.beforeEach(async ({ page }) => {
      const response = await page.goto(presentationPlaybackUrl);
      expect(response.ok(), 'playback URL should be accessible').toBeTruthy();
      await page.waitForLoadState('domcontentloaded');
    });

    test('Generate a valid and accessible presentation playback recording link', async ({ browser, context, page }) => {
      // recording generation is done in beforeAll hook
      const recording = new Recording(browser, context);
      recording.playbackPage = new Page(browser, page);
      await recording.accessPresentationPlayback();
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

  test.describe.parallel('Video format', () => {
    let videoPlaybackUrl;

    test.beforeAll(async ({ browser }) => {
      // validate playback video format
      const context = await browser.newContext();
      const page = await context.newPage();
      const recording = new Recording(browser, context);
      recording.playbackPage = new Page(browser, page);
      videoPlaybackUrl = await recording.validatePlaybackFormat(recordedMeetingID, 'video');
    });

    test.beforeEach(async ({ page }) => {
      const response = await page.goto(videoPlaybackUrl);
      expect(response.ok(), 'playback URL should be accessible').toBeTruthy();
      await page.waitForLoadState('domcontentloaded');
    });

    test('Generate a valid and accessible video playback recording link', async ({ browser, context, page }) => {
      // recording generation is done in beforeAll hook
      const recording = new Recording(browser, context);
      recording.playbackPage = new Page(browser, page);
      await recording.accessVideoPlayback();
    });

    test('Video file accessible via /video-0', async ({ browser, context, page, request }) => {
      const recording = new Recording(browser, context);
      recording.playbackPage = new Page(browser, page);
      await recording.accessDefaultVideoFile(request);
    });

    test('Display chat messages', { tag: '@ci-only' }, async ({ browser, context, page, request }) => {
      const recording = new Recording(browser, context);
      recording.playbackPage = new Page(browser, page);
      await recording.chatMessages(request);
    });
  });
});
