import { expect } from '@playwright/test';

import { CI } from '../core/constants';
import { linkIssue } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { API } from './api';
import { APIBreakout } from './breakout';
import { APICallbacks } from './callbacks';
import { APIChecksum } from './checksum';
import { APIDisabledFeatures } from './disabledFeatures';
import { APIDocumentTypes } from './documentTypes';
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

  test('controllerWithoutActionNotFound', { tag: '@ci' }, async () => {
    await API.testControllerWithoutActionNotFound();
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

  test('svgDocumentNotAdded', { tag: '@ci' }, async ({ browser, context, page, request }, testInfo) => {
    const documentTypes = new APIDocumentTypes(browser, context);
    await documentTypes.testSvgDocumentNotAdded(page, testInfo, request);
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

  test(
    'apiCreatedBreakoutRoomEndsWithParent',
    { tag: '@ci' },
    async ({ browser, context, page, request }, testInfo) => {
      const api = new APIBreakout(browser, context);
      await api.testApiCreatedRoomEndsWithParent(page, testInfo, request);
    },
  );

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

  test.describe('Meeting ended callback', { tag: '@ci' }, () => {
    test('meetingEndedUrlCarriesRecordingmarksAndMeetingID', async ({ request }) => {
      linkIssue(25929);
      const callsBack = await APICallbacks.serverCallsBackItsOwnHost(request);
      if (CI) {
        expect(callsBack, 'the meta_endCallbackUrl control callback should re-create the meeting').toBe(true);
      } else {
        test.skip(!callsBack, 'bbb-web does not accept a callback to its own host (fetchUrlAllowedLocalHosts)');
      }
      await APICallbacks.testMeetingEndedUrlCarriesRecordingmarksAndMeetingID(request);
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
