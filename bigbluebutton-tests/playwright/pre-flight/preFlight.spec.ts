import { test } from '../core/setup/fixtures';
import { PreFlight } from './preFlight';
import { LISTEN_ONLY_CREATE_PARAMETER } from './util';

test.describe.parallel('Pre-flight', { tag: '@ci' }, () => {
  test('Joins only after confirmation', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await preFlight.joinsOnlyAfterConfirmation();
  });

  test('Joins audio without the audio modal', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await preFlight.joinsAudioWithoutModal();
  });

  test('Joins muted when the microphone is toggled off', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await preFlight.joinsMutedWhenMicToggledOff();
  });

  test('Shares the camera without the video preview modal', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await preFlight.sharesCameraWithoutPreviewModal();
  });

  test('Keeps the camera off when toggled off', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await preFlight.keepsCameraOffWhenToggled();
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

  test('Holds the join while the microphone is denied', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await preFlight.holdsJoinWhileMicrophoneDenied();
  });

  test('Clears the microphone denial on a grant', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await preFlight.clearsMicrophoneDenialOnGrant();
  });

  test('Retries a denied camera', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await preFlight.retriesDeniedCamera();
  });

  test('Continues without a denied camera', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await preFlight.continuesWithoutDeniedCamera();
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

  test('Recovers a dropped connection on its own', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await preFlight.recoversConnectionOnItsOwn();
  });

  test('Reloads on retry while disconnected', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await preFlight.reloadsOnRetryWhileDisconnected();
  });

  test('Recommits the setup on a stalled join retry', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await preFlight.recommitsSetupOnStalledJoinRetry();
  });

  test('Disabled by default', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await preFlight.disabledByDefault();
  });
});
