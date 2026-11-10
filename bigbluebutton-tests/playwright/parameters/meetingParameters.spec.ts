import { getRandomInt, linkIssue } from '../core/helpers';
import { isLegacy } from '../core/livekit';
import { test } from '../core/setup/fixtures';
import { EXTERNAL_UPLOAD_PARAMETERS, MeetingParameters, sessionDetailsParameters } from './meetingParameters';

test.describe.parallel('Meeting create parameters', { tag: '@nightly' }, () => {
  test('Session details show the welcome message with its keywords replaced, the dial number and the PIN', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    // bbb-web refuses a voice bridge that another running meeting uses
    const voiceBridge = getRandomInt(30000, 70000).toString();
    const meetingParameters = new MeetingParameters(browser, context);
    await meetingParameters.initModPage(page, { createParameter: sessionDetailsParameters(voiceBridge), testInfo });
    await meetingParameters.sessionDetails(voiceBridge);
  });

  test(
    'Pinning a second camera unpins the first when maxPinnedCameras is 1',
    { tag: '@media' },
    async ({ browser, context, page }, testInfo) => {
      const meetingParameters = new MeetingParameters(browser, context);
      await meetingParameters.initModPage(page, { createParameter: 'maxPinnedCameras=1', testInfo });
      await meetingParameters.initUserPage(context, { testInfo });
      await meetingParameters.initUserPage2(context, { testInfo });
      await meetingParameters.secondPinnedCameraUnpinsTheFirst();
    },
  );

  // maxPinnedCameras defaults to 3
  test(
    'Pinning a second camera keeps the first pinned by default',
    { tag: '@media' },
    async ({ browser, context, page }, testInfo) => {
      const meetingParameters = new MeetingParameters(browser, context);
      await meetingParameters.initModPage(page, { testInfo });
      await meetingParameters.initUserPage(context, { testInfo });
      await meetingParameters.initUserPage2(context, { testInfo });
      await meetingParameters.secondPinnedCameraKeepsTheFirst();
    },
  );

  test('The upload dialog shows the external upload description and opens its URL', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const meetingParameters = new MeetingParameters(browser, context);
    await meetingParameters.initModPage(page, { createParameter: EXTERNAL_UPLOAD_PARAMETERS, testInfo });
    await meetingParameters.externalUpload();
  });

  test('A guest can be promoted to moderator when allowPromoteGuestToModerator is true', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const meetingParameters = new MeetingParameters(browser, context);
    await meetingParameters.initModPage(page, {
      createParameter: 'guestPolicy=ALWAYS_ACCEPT&allowPromoteGuestToModerator=true',
      testInfo,
    });
    await meetingParameters.initUserPage(context, { testInfo });
    await meetingParameters.initUserPage2(context, { fullName: 'Guest', joinParameter: 'guest=true', testInfo });
    await meetingParameters.promoteOptionOnGuest(true);
  });

  test('A guest cannot be promoted to moderator when allowPromoteGuestToModerator is false', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const meetingParameters = new MeetingParameters(browser, context);
    await meetingParameters.initModPage(page, {
      createParameter: 'guestPolicy=ALWAYS_ACCEPT&allowPromoteGuestToModerator=false',
      testInfo,
    });
    await meetingParameters.initUserPage(context, { testInfo });
    await meetingParameters.initUserPage2(context, { fullName: 'Guest', joinParameter: 'guest=true', testInfo });
    await meetingParameters.promoteOptionOnGuest(false);
  });

  test(
    'cameraBridge=bbb-webrtc-sfu shares the webcam through bbb-webrtc-sfu',
    { tag: '@media' },
    async ({ browser, context, page }, testInfo) => {
      test.skip(isLegacy, 'the legacy run puts every media type on bbb-webrtc-sfu');
      const socketUrls: string[] = [];
      page.on('websocket', (socket) => socketUrls.push(socket.url()));
      const meetingParameters = new MeetingParameters(browser, context);
      await meetingParameters.initModPage(page, { createParameter: 'cameraBridge=bbb-webrtc-sfu', testInfo });
      await meetingParameters.webcamThroughSfu(socketUrls);
    },
  );

  test(
    'screenShareBridge=bbb-webrtc-sfu shares the screen through bbb-webrtc-sfu',
    { tag: '@media' },
    async ({ browser, browserName, context, page }, testInfo) => {
      test.skip(browserName === 'firefox', 'Screenshare tests not able in Firefox browser without desktop');
      test.skip(isLegacy, 'the legacy run puts every media type on bbb-webrtc-sfu');
      const socketUrls: string[] = [];
      page.on('websocket', (socket) => socketUrls.push(socket.url()));
      const meetingParameters = new MeetingParameters(browser, context);
      await meetingParameters.initModPage(page, { createParameter: 'screenShareBridge=bbb-webrtc-sfu', testInfo });
      await meetingParameters.screenshareThroughSfu(socketUrls);
    },
  );
});

// the breakout panel takes these defaults from settings.yml (captureWhiteboardByDefault and
// captureSharedNotesByDefault), not from the meeting
test(
  'breakoutRoomsCaptureSlides and breakoutRoomsCaptureNotes pre-check the save options of the breakout panel',
  { tag: '@known-issue' },
  async ({ browser, context, page }, testInfo) => {
    linkIssue(26228);
    const meetingParameters = new MeetingParameters(browser, context);
    await meetingParameters.initModPage(page, {
      createParameter: 'breakoutRoomsCaptureSlides=true&breakoutRoomsCaptureNotes=true',
      testInfo,
    });
    await meetingParameters.breakoutCaptureDefaults();
  },
);
