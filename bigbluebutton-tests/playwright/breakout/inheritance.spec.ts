import { getRandomInt } from '../core/helpers';
import { isLegacy } from '../core/livekit';
import { test } from '../core/setup/fixtures';
import { Inheritance, roomsApiCreateParameter } from './inheritance';

// What a breakout room takes from its parent (MeetingService.processCreateBreakoutRoom) and how
// the room behaves because of it
test.describe.parallel('Breakout inheritance', { tag: '@nightly' }, () => {
  test("Rooms read through the API carry the parent's settings", async ({ browser, context, page }, testInfo) => {
    // a running meeting may hold a fixed bridge; the rooms get this one followed by their sequence
    const voiceBridge = getRandomInt(30000, 70000);
    const inheritance = new Inheritance(browser, context);
    await inheritance.initModPage(page, { createParameter: roomsApiCreateParameter(voiceBridge), testInfo });
    await inheritance.initUserPage(context, { testInfo });
    await inheritance.create();
    await inheritance.roomsReadThroughTheApi(voiceBridge);
  });

  test("The parent's welcome message names the room inside it", async ({ browser, context, page }, testInfo) => {
    const inheritance = new Inheritance(browser, context);
    await inheritance.initPages(page, testInfo);
    await inheritance.create();
    await inheritance.welcomeMessageNamesTheRoom();
  });

  test('Features the parent disables are disabled in the rooms', async ({ browser, context, page }, testInfo) => {
    const inheritance = new Inheritance(browser, context);
    await inheritance.initModPage(page, { createParameter: 'disabledFeatures=polls,sharedNotes', testInfo });
    await inheritance.initUserPage(context, { testInfo });
    await inheritance.create();
    await inheritance.pollsAndSharedNotesFollowTheParent(false);
  });

  // control of the test above
  test('Features the parent keeps are available in the rooms', async ({ browser, context, page }, testInfo) => {
    const inheritance = new Inheritance(browser, context);
    await inheritance.initPages(page, testInfo);
    await inheritance.create();
    await inheritance.pollsAndSharedNotesFollowTheParent(true);
  });

  test(
    'Rooms join the attendees unmuted when the parent has muteOnStart',
    { tag: '@media' },
    async ({ browser, context, page }, testInfo) => {
      const inheritance = new Inheritance(browser, context);
      await inheritance.initModPage(page, { createParameter: 'muteOnStart=true', testInfo });
      await inheritance.initUserPage(context, { testInfo });
      await inheritance.create();
      await inheritance.muteOnStartIsOffInRooms();
    },
  );

  test('A room shows the slide its parent is on as its only page', async ({ browser, context, page }, testInfo) => {
    const inheritance = new Inheritance(browser, context);
    await inheritance.initPages(page, testInfo);
    await inheritance.roomShowsTheParentSlide();
  });

  test('Rooms let a guest of an ASK_MODERATOR parent in without a lobby', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const inheritance = new Inheritance(browser, context);
    await inheritance.initModPage(page, { createParameter: 'guestPolicy=ASK_MODERATOR', testInfo });
    await inheritance.guestJoinsRoomWithoutLobby();
  });

  test.describe.parallel('Camera bridge', () => {
    test.skip(isLegacy, 'the legacy run puts every media type on bbb-webrtc-sfu');

    test(
      "Rooms share webcams through the parent's cameraBridge",
      { tag: '@media' },
      async ({ browser, context, page }, testInfo) => {
        const inheritance = new Inheritance(browser, context);
        await inheritance.initModPage(page, { createParameter: 'cameraBridge=bbb-webrtc-sfu', testInfo });
        await inheritance.initUserPage(context, { testInfo });
        await inheritance.create();
        await inheritance.webcamBridgeInRoom();
      },
    );

    // control of the test above
    test(
      'The default camera bridge shares webcams without bbb-webrtc-sfu',
      { tag: '@media' },
      async ({ browser, context, page }, testInfo) => {
        const inheritance = new Inheritance(browser, context);
        await inheritance.initPages(page, testInfo);
        await inheritance.webcamOnDefaultBridge();
      },
    );
  });

  test('Rooms give every attendee the whiteboard tools', async ({ browser, context, page }, testInfo) => {
    const inheritance = new Inheritance(browser, context);
    await inheritance.initModPage(page, { testInfo });
    await inheritance.initUserPage(context, { testInfo });
    await inheritance.initUserPage2(context, { testInfo });
    await inheritance.multiUserWhiteboardOnInRooms();
  });

  test('Rooms ask for recording consent when the parent has notifyRecordingIsOn', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const inheritance = new Inheritance(browser, context);
    await inheritance.initModPage(page, {
      createParameter: 'record=true&breakoutRoomsRecord=true&notifyRecordingIsOn=true',
      clientSettingsOverrides: { public: { app: { breakouts: { offerRecordingForBreakouts: true } } } },
      testInfo,
    });
    await inheritance.initUserPage(context, { testInfo });
    await inheritance.recordingConsentInRooms();
  });
});
