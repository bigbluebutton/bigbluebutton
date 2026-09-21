import { test } from '../core/setup/fixtures';
import { PreFlight } from './preFlight';

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

  test('Guest lobby within the pre-flight', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await preFlight.guestLobbyWithinPreFlight();
  });

  test('Disabled by default', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, { testInfo });
    await preFlight.disabledByDefault();
  });
});
