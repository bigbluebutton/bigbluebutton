import { test } from '../core/setup/fixtures';
import { PreFlight } from './preFlight';
import { LISTEN_ONLY_CREATE_PARAMETER } from './util';

test.describe.parallel('Pre-flight', { tag: '@ci' }, () => {
  test('Joins only after confirmation', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await preFlight.joinsOnlyAfterConfirmation();
  });

  test('Joins the audio as set in the pre-flight', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await test.step('Joins audio without the audio modal', async () => {
      await preFlight.joinsAudioWithoutModal();
    });
    await preFlight.closeAttendee();
    await test.step('Joins muted when the microphone is toggled off', async () => {
      await preFlight.joinsMutedWhenMicToggledOff();
    });
  });

  test('Shares or keeps off the camera as set in the pre-flight', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await test.step('Shares the camera without the video preview modal', async () => {
      await preFlight.sharesCameraWithoutPreviewModal();
    });
    await preFlight.closeAttendee();
    await test.step('Keeps the camera off when toggled off', async () => {
      await preFlight.keepsCameraOffWhenToggled();
    });
  });

  test('Picks devices in the setup panel', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await preFlight.picksDevicesInTheSetupPanel();
  });

  test('Changes settings before joining', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await preFlight.changesSettingsBeforeJoining();
  });

  test('Guest lobby within the pre-flight', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await preFlight.guestLobbyWithinPreFlight();
  });

  test('Holds the join on a denied microphone, clears on a grant', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await test.step('Holds the join while the microphone is denied', async () => {
      await preFlight.holdsJoinWhileMicrophoneDenied();
    });
    await preFlight.closeAttendee();
    await test.step('Clears the microphone denial on a grant', async () => {
      await preFlight.clearsMicrophoneDenialOnGrant();
    });
  });

  test('Retries a denied camera or goes on without it', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await test.step('Retries a denied camera', async () => {
      await preFlight.retriesDeniedCamera();
    });
    await preFlight.closeAttendee();
    await test.step('Continues without a denied camera', async () => {
      await preFlight.continuesWithoutDeniedCamera();
    });
  });

  test('Listen only past denied devices', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    // The moderator only hosts: their own audio on the legacy bridge is not
    // what this covers.
    await preFlight.initModPage(page, {
      testInfo,
      createParameter: LISTEN_ONLY_CREATE_PARAMETER,
      shouldCloseAudioModal: false,
    });
    await preFlight.listenOnlyPastDeniedDevices();
  });

  test('Disabled by default', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await preFlight.disabledByDefault();
  });
});

// Fault injection, races and edge cases: out of the per-PR gates, run by `npm run test-nightly`.
test.describe.parallel('Pre-flight: faults and denials', { tag: '@nightly' }, () => {
  test('Recovers a dropped connection, or reloads on retry', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await test.step('Recovers a dropped connection on its own', async () => {
      await preFlight.recoversConnectionOnItsOwn();
    });
    await preFlight.closeAttendee();
    await test.step('Reloads on retry while disconnected', async () => {
      await preFlight.reloadsOnRetryWhileDisconnected();
    });
  });

  test('Recommits the setup on a stalled join retry', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await preFlight.recommitsSetupOnStalledJoinRetry();
  });

  test('Guest denial within the pre-flight', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await preFlight.guestDenialWithinPreFlight();
  });

  test('Guest denial leave button', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await preFlight.guestDenialLeaveButton();
  });
});
