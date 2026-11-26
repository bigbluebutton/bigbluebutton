import { initializePages, linkIssue } from '../core/helpers';
import { isLegacy, isLiveKit } from '../core/livekit';
import { refuseMedia } from '../core/mediaPermissions';
import { trackPeerConnections } from '../core/rtcStatsProbe';
import { test } from '../core/setup/fixtures';
import { constants as c } from '../parameters/constants';
import { Audio } from './audio';
import { exposeLiveKitRoomInContext } from './liveKitProbe';
import { E2E_ECHO_TEST_SETTINGS_OVERRIDE } from './util';

const UNMUTE_WITH_CONSENT = `${c.allowModsToUnmuteUsers}&requireUserConsentBeforeUnmuting=true`;
const UNMUTE_WITHOUT_CONSENT = `${c.allowModsToUnmuteUsers}&requireUserConsentBeforeUnmuting=false`;
// unpublishOnMute is the default; set here because the spec waits for the unpublish.
const unmuteWithoutConsentSettings = (useLiveKitAudioState: boolean) => ({
  public: { media: { livekit: { audio: { unpublishOnMute: true, useLiveKitAudioState } } } },
});

test.describe.parallel('Audio', { tag: ['@ci', '@media'] }, () => {
  let audio: Audio;

  test.beforeEach(async ({ browser, context }, testInfo) => {
    audio = new Audio(browser, context);
    await initializePages(audio, browser, { isMultiUser: true, testInfo });
  });

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#listen-only-mode-automated
  test('Join audio with Listen Only', async () => {
    test.skip(isLiveKit, 'LiveKit does not have a dedicated listen-only mode');
    await audio.joinAudio();
  });

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#join-audio-automated
  test('Join audio with Microphone', async () => {
    await audio.joinMicrophone();
  });

  test('Change audio input and keep it connected', async ({ browserName }) => {
    test.skip(browserName === 'firefox', 'Firefox does not support fake audio to simulate de audio.');
    await audio.changeAudioInput();
  });

  test('Change audio output', async () => {
    await audio.changeAudioOutput();
  });

  test('Echo test shows the microphone volume', async () => {
    await audio.echoTestShowsVolume();
  });

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#muteunmute
  test('Mute yourself by clicking the mute button', async () => {
    await audio.muteYourselfByButton();
  });

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#choosing-different-sources
  test('Keep the last mute state after rejoining audio', async () => {
    await audio.keepMuteStateOnRejoin();
  });

  // Talking Indicator
  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#talking-indicator
  test('Mute yourself by clicking the talking indicator', async () => {
    await audio.muteYourselfByTalkingIndicator();
  });

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#talking-indicator
  test('Mute another user by clicking the talking indicator', async () => {
    await audio.muteAnotherUser();
  });

  // Push-to-talk is enabled by default in 4.0
  test('Push-to-talk removes the away status', async () => {
    linkIssue(25888);
    await audio.pushToTalkClearsAway({ unmutedBeforeAway: false });
  });

  test('Push-to-talk removes the away status of a user who was unmuted when going away', async () => {
    linkIssue(25888);
    await audio.pushToTalkClearsAway({ unmutedBeforeAway: true });
  });

  test('Push-to-talk does not change the status of an available user', async () => {
    linkIssue(25888);
    await audio.pushToTalkWhileAvailable();
  });

  test('Unmuting with the microphone button removes the away status', async () => {
    linkIssue(25888);
    await audio.unmuteClearsAway('button');
  });

  test('Unmuting yourself from the user list removes the away status', async () => {
    linkIssue(25888);
    await audio.unmuteClearsAway('userList');
  });
});

test.describe.parallel('Echo test through the server', { tag: '@ci' }, () => {
  // joining audio crashes the client, as AudioManager.joinEchoTest() is called without the { muted } it destructures
  test(
    'Not hearing the echo leads to the audio settings and back',
    { tag: '@known-issue' },
    async ({ browser, context, page }, testInfo) => {
      linkIssue(26130);
      const audio = new Audio(browser, context);
      await audio.initModPage(page, {
        testInfo,
        shouldCloseAudioModal: false,
        clientSettingsOverrides: E2E_ECHO_TEST_SETTINGS_OVERRIDE,
      });
      await audio.echoTestNotHeard();
    },
  );
});

test.describe.parallel('Audio reception', { tag: ['@ci', '@media'] }, () => {
  test('Listener receives the speaker audio', async ({ browser, context, page }, testInfo) => {
    await trackPeerConnections(context);
    const audio = new Audio(browser, context);
    await audio.initModPage(page, { testInfo });
    await audio.initUserPage(context, { testInfo });
    await audio.listenerReceivesSpeech();
  });
});

test.describe.parallel('Microphone permission', { tag: ['@ci', '@media'] }, () => {
  test('A refused microphone shows the permission help and can be retried', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    await refuseMedia(page, ['audio']);
    const audio = new Audio(browser, context);
    await audio.initModPage(page, { joinParameter: c.autoJoin, shouldCloseAudioModal: false, testInfo });
    await audio.refusedMicrophonePermission();
  });
});

test.describe.parallel('Unmute consent', { tag: ['@ci', '@media'] }, () => {
  let audio: Audio;

  test.beforeEach(async ({ browser, context, page }, testInfo) => {
    audio = new Audio(browser, context);
    await audio.initModPage(page, { createParameter: UNMUTE_WITH_CONSENT, testInfo });
    await audio.initUserPage(context, { testInfo });
  });

  test('An attendee who declines stays muted', async () => {
    await audio.unmuteConsentDeclined();
  });

  test('An attendee who accepts is unmuted', async () => {
    await audio.unmuteConsentAccepted();
  });

  test('Muting everyone withdraws a pending request', async () => {
    await audio.unmuteRequestWithdrawnByMuteAll();
  });
});

test.describe.parallel('Unmute without consent', { tag: ['@ci', '@media'] }, () => {
  [false, true].forEach((useLiveKitAudioState) => {
    const name = useLiveKitAudioState ? 'with the LiveKit audio state' : 'with the BBB audio state';

    test(`A moderator unmutes an attendee directly, ${name}`, async ({ browser, context, page }, testInfo) => {
      linkIssue(26285);
      test.skip(useLiveKitAudioState && !isLiveKit, 'the LiveKit audio state only exists on the LiveKit bridge');
      await exposeLiveKitRoomInContext(context);
      const audio = new Audio(browser, context);
      await audio.initModPage(page, {
        createParameter: UNMUTE_WITHOUT_CONSENT,
        createClientSettingsOverride: unmuteWithoutConsentSettings(useLiveKitAudioState),
        testInfo,
      });
      await audio.initUserPage(context, { testInfo });
      await audio.unmuteWithoutConsent();
    });
  });
});

test.describe.parallel('Mixed media bridges', { tag: '@ci' }, () => {
  test('Audio on bbb-webrtc-sfu with cameras on the default bridge', async ({ browser, context, page }, testInfo) => {
    test.skip(isLegacy, 'the legacy run puts every media type on bbb-webrtc-sfu');
    await trackPeerConnections(context);
    const modSocketUrls: string[] = [];
    page.on('websocket', (socket) => modSocketUrls.push(socket.url()));
    const audio = new Audio(browser, context);
    await audio.initModPage(page, {
      createParameter: 'audioBridge=bbb-webrtc-sfu',
      shouldCloseAudioModal: false,
      testInfo,
    });
    await audio.audioAndCameraOnDifferentBridges(modSocketUrls);
  });
});
