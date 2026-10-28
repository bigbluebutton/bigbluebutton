import { linkIssue } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { API } from './api';
import { APIBreakout } from './breakout';
import { APIChecksum } from './checksum';
import { APIDisabledFeatures } from './disabledFeatures';
import { APIJoin } from './join';
import { APILifecycle } from './lifecycle';

test.describe.parallel('API', () => {
  test('getMeetings', { tag: '@ci' }, async ({ browser, context, page, request }, testInfo) => {
    const api = new API(browser, context);
    await api.testGetMeetings(page, testInfo, request);
  });

  test('getMeetingInfo', { tag: '@ci' }, async ({ browser, context, page, request }, testInfo) => {
    const api = new API(browser, context);
    await api.testGetMeetingInfo(page, testInfo, request);
  });

  test('webVoiceParamIgnored', { tag: '@ci' }, async () => {
    await API.testWebVoiceParamIgnored();
  });

  test('duplicateVoiceBridgeRejected', { tag: '@ci' }, async () => {
    await API.testDuplicateVoiceBridgeRejected();
  });

  test('joinLongFullNameAccepted', { tag: '@ci' }, async () => {
    linkIssue(25682);
    await API.testJoinLongFullNameAccepted();
  });

  test('joinFullNameOverLimitRejected', { tag: '@ci' }, async () => {
    linkIssue(25682);
    await API.testJoinFullNameOverLimitRejected();
  });

  test('joinLongFullNameThroughClient', { tag: '@ci' }, async ({ browser, context, page }, testInfo) => {
    linkIssue(25682);
    const api = new API(browser, context);
    await api.testJoinLongFullNameThroughClient(page, testInfo);
  });

  test('bbbWebSecurityHeaders', { tag: '@ci' }, async () => {
    await API.testBbbWebSecurityHeaders();
  });

  test('controllerHelpersNotReachable', { tag: '@ci' }, async () => {
    linkIssue(26002);
    await API.testControllerHelpersNotReachable();
  });

  test('joinInsideCrossOriginFrame', { tag: '@ci' }, async ({ page, browserName }) => {
    test.skip(
      browserName !== 'chromium',
      'route.continue() with another URL navigates the page away from the LMS origin in Firefox',
    );
    await API.testJoinInsideCrossOriginFrame(page);
  });

  test('overAThousandRequestParameters', { tag: '@ci' }, async () => {
    await API.testOverAThousandRequestParameters();
  });

  test('hiddenMethodOverrideIgnored', { tag: '@ci' }, async () => {
    linkIssue(26002);
    await API.testHiddenMethodOverrideIgnored();
  });

  test('breakoutWithoutParent', { tag: '@ci' }, async () => {
    await APIBreakout.testBreakoutWithoutParent();
  });

  // A breakout create without `sequence` fails with HTTP 500: bbb-web parses the
  // missing value with Integer.parseInt (ParamsProcessorUtil). The API is
  // documented to answer errors with returncode FAILED.
  test('breakoutWithoutSequenceNumber', { tag: ['@ci', '@known-issue'] }, async ({ request }) => {
    await APIBreakout.testBreakoutWithoutSequenceNumber(request);
  });

  // A non-numeric sequence takes the same Integer.parseInt path (ParamsProcessorUtil
  // processCreateParams) and fails the same way as a missing one.
  test('breakoutWithNonNumericSequenceNumber', { tag: ['@ci', '@known-issue'] }, async ({ request }) => {
    await APIBreakout.testBreakoutWithNonNumericSequence(request);
  });

  test('breakoutWithNonexistentParent', { tag: '@ci' }, async () => {
    await APIBreakout.testBreakoutWithNonexistentParent();
  });

  test('breakoutMeetingInfo', { tag: '@ci' }, async ({ browser, context, page, request }, testInfo) => {
    const api = new APIBreakout(browser, context);
    await api.initPages(page, testInfo);
    try {
      await api.create();
      await api.testBreakoutMeetingInfoNoJoins();
      await api.joinRoom();
      await api.testBreakoutMeetingInfoOneJoin();
    } finally {
      await api.endParentMeeting(request);
    }
  });

  test.describe('Breakout rooms', { tag: '@ci' }, () => {
    // A room's voice bridge is the parent's plus its sequence. When another meeting holds
    // that number, bbb-web refuses to create the room (MeetingService.createMeeting ~557-561,
    // duplicate telVoice) and processCreateBreakoutRoom ignores the refusal (~931), while
    // akka-apps keeps the room in its breakout model and waits for it to start.
    test(
      'breakoutRoomOnTakenVoiceBridgeIsCreated',
      { tag: '@known-issue' },
      async ({ browser, context, page, request }, testInfo) => {
        const api = new APIBreakout(browser, context);
        await api.testVoiceBridgeTakenByAnotherMeeting(page, testInfo, request);
      },
    );

    test('apiCreatedBreakoutRoom', async ({ browser, context, page, request }, testInfo) => {
      const api = new APIBreakout(browser, context);
      await api.testApiCreatedRoom(page, testInfo, request);
    });

    // bbb-web keeps the requested meetingID as the room's internal ID and returns a rebuilt
    // external ID (ParamsProcessorUtil.processCreateParams ~941-950); getMeetingInfo resolves
    // an external ID through sha1(externalID) (ServiceUtils.findMeetingFromMeetingID), which
    // matches only the IDs akka-apps builds for the rooms it creates.
    test(
      'apiCreatedBreakoutRoomFoundByReturnedId',
      { tag: '@known-issue' },
      async ({ browser, context, page, request }, testInfo) => {
        const api = new APIBreakout(browser, context);
        await api.testApiCreatedRoomFoundByReturnedId(page, testInfo, request);
      },
    );

    // The parent's akka-apps ends only the rooms of its own breakout model
    // (HandlerHelpers.endAllBreakoutRooms ~290-299), and an API-created room never enters
    // it (BreakoutRoomCreatedMsgHdlr finds no such room in state.breakout).
    test(
      'apiCreatedBreakoutRoomEndsWithParent',
      { tag: '@known-issue' },
      async ({ browser, context, page, request }, testInfo) => {
        const api = new APIBreakout(browser, context);
        await api.testApiCreatedRoomEndsWithParent(page, testInfo, request);
      },
    );

    // CreateBreakoutRoomsCmdMsgHdlr (~130) passes the client's record flag to the rooms
    // without checking the parent's breakoutRoomsRecord.
    test(
      'breakoutRoomsRecordFalseEnforced',
      { tag: '@known-issue' },
      async ({ browser, context, page, request }, testInfo) => {
        const api = new APIBreakout(browser, context);
        await api.testRoomsNotRecordedWhenParentForbids(page, testInfo, request);
      },
    );

    test('breakoutRoomsRecordTrueControl', async ({ browser, context, page, request }, testInfo) => {
      const api = new APIBreakout(browser, context);
      await api.testRoomsRecordedWhenParentAllows(page, testInfo, request);
    });

    test('disabledBreakoutRoomsNotCreated', async ({ browser, context, page, request }, testInfo) => {
      const api = new APIBreakout(browser, context);
      await api.testDisabledBreakoutRoomsNotCreated(page, testInfo, request);
    });

    test('breakoutRoomCreateTakesEffect', async ({ browser, context, page, request }, testInfo) => {
      const api = new APIBreakout(browser, context);
      await api.testBreakoutRoomCreateTakesEffect(page, testInfo, request);
    });

    test('attendeeCannotCreateBreakoutRooms', async ({ browser, context, page, request }, testInfo) => {
      const api = new APIBreakout(browser, context);
      await api.testAttendeeCannotCreateRooms(page, testInfo, request);
    });

    test('breakoutRoomCannotCreateBreakoutRooms', async ({ browser, context, page, request }, testInfo) => {
      const api = new APIBreakout(browser, context);
      await api.testRoomCannotCreateRooms(page, testInfo, request);
    });

    test('breakoutRoomCountLimits', async ({ browser, context, page, request }, testInfo) => {
      const api = new APIBreakout(browser, context);
      await api.testRoomCountLimits(page, testInfo, request);
    });

    test('endingParentEndsBreakoutRooms', async ({ browser, context, page, request }, testInfo) => {
      const api = new APIBreakout(browser, context);
      await api.testEndingParentEndsRooms(page, testInfo, request);
    });

    test('getMeetingsListsBreakoutRooms', async ({ browser, context, page, request }, testInfo) => {
      const api = new APIBreakout(browser, context);
      await api.testGetMeetingsListsRooms(page, testInfo, request);
    });
  });

  test.describe('Checksum', { tag: '@ci' }, () => {
    test('checksumAlgorithmsAccepted', async ({ request }) => {
      await APIChecksum.testAlgorithmsAccepted(request);
    });

    test('createChecksumRefused', async ({ request }) => {
      await APIChecksum.testCreateRefused(request);
    });

    test('joinChecksumRefused', async ({ request }) => {
      await APIChecksum.testJoinRefused(request);
    });

    test('getMeetingInfoChecksumRefused', async ({ request }) => {
      await APIChecksum.testGetMeetingInfoRefused(request);
    });
  });

  test.describe('Meeting lifecycle', { tag: '@ci' }, () => {
    test('meetingLifecycle', async ({ browser, context, page, request }, testInfo) => {
      const lifecycle = new APILifecycle(browser, context);
      await lifecycle.testLifecycle(page, testInfo, request);
    });

    test('createTwice', async ({ request }) => {
      await APILifecycle.testCreateTwice(request);
    });
  });

  test.describe('Join', { tag: '@ci' }, () => {
    test('joinRoleOverridesPassword', async ({ browser, context, page, request }, testInfo) => {
      const join = new APIJoin(browser, context);
      await join.testRoleOverridesPassword(page, testInfo, request);
    });

    test('joinPasswordAndRoleRules', async ({ request }) => {
      await APIJoin.testPasswordAndRoleRules(request);
    });

    test('joinRedirectFalseReturnsSession', async ({ request }) => {
      await APIJoin.testRedirectFalseReturnsSession(request);
    });

    test('joinUnknownMeetingRefused', async ({ request }) => {
      await APIJoin.testUnknownMeetingRefused(request);
    });

    // bbb-web answers meetingForciblyEnded for a meeting that never existed.
    test('joinUnknownMeetingErrorKey', { tag: '@known-issue' }, async ({ request }) => {
      await APIJoin.testUnknownMeetingErrorKey(request);
    });

    // bbb-web redirects on a validation error even with redirect=false.
    test('joinValidationErrorWithRedirectFalse', { tag: '@known-issue' }, async ({ request }) => {
      await APIJoin.testValidationErrorWithRedirectFalse(request);
    });

    test('maxParticipantsReached', async ({ browser, context, page, request }, testInfo) => {
      const join = new APIJoin(browser, context);
      await join.testMaxParticipants(page, testInfo, request);
    });
  });

  // Each feature is disabled on create and the matching GraphQL request is
  // sent directly, as a client that ignores the hidden UI would; another
  // participant must not see any effect.
  test.describe('disabledFeatures enforcement', { tag: '@ci' }, () => {
    test('disabledChatMessageDropped', async ({ browser, context, page, request }, testInfo) => {
      const disabledFeatures = new APIDisabledFeatures(browser, context);
      await disabledFeatures.testChatMessageDropped(page, testInfo, request);
    });

    test('disabledPollNotStarted', async ({ browser, context, page, request }, testInfo) => {
      const disabledFeatures = new APIDisabledFeatures(browser, context);
      await disabledFeatures.testPollNotStarted(page, testInfo, request);
    });

    test('disabledTimerNotActivated', async ({ browser, context, page, request }, testInfo) => {
      const disabledFeatures = new APIDisabledFeatures(browser, context);
      await disabledFeatures.testTimerNotActivated(page, testInfo, request);
    });

    test('disabledPrivateChatNotCreated', async ({ browser, context, page, request }, testInfo) => {
      const disabledFeatures = new APIDisabledFeatures(browser, context);
      await disabledFeatures.testPrivateChatNotCreated(page, testInfo, request);
    });

    test('enabledFeaturesControl', async ({ browser, context, page, request }, testInfo) => {
      const disabledFeatures = new APIDisabledFeatures(browser, context);
      await disabledFeatures.testRequestsTakeEffectWhenEnabled(page, testInfo, request);
    });
  });
});
