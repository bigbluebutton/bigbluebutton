import { test } from '../core/setup/fixtures';
import {
  AUTO_JOIN_PARAM, LOCK_CAM_PARAM, PRE_FLIGHT_PARAM, PreFlight,
} from './preflight';

test.describe.parallel('Pre-flight screen', { tag: '@ci' }, () => {
  test('Join with microphone from the pre-flight screen', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, {
      createParameter: PRE_FLIGHT_PARAM,
      shouldCloseAudioModal: false,
      testInfo,
    });
    await preFlight.joinFromPreFlight();
  });

  // Edge case (a): listen-only / mic-denied affordance is preserved.
  test('Join without microphone (listen only) from the pre-flight screen', async ({
    browser, context, page,
  }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, {
      createParameter: PRE_FLIGHT_PARAM,
      shouldCloseAudioModal: false,
      testInfo,
    });
    await preFlight.joinListenOnlyFromPreFlight();
  });

  // Edge case (b): pre-flight takes precedence over auto join audio.
  test('Takes precedence over auto join audio', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, {
      createParameter: `${PRE_FLIGHT_PARAM}&${AUTO_JOIN_PARAM}`,
      shouldCloseAudioModal: false,
      testInfo,
    });
    await preFlight.takesPrecedenceOverAutoJoin();
  });

  // Edge case (c): webcam sharing locked hides the camera section.
  test('Hides the camera section when webcam sharing is locked', async ({ browser, context, page }, testInfo) => {
    const preFlight = new PreFlight(browser, context);
    await preFlight.initModPage(page, {
      createParameter: `${PRE_FLIGHT_PARAM}&${LOCK_CAM_PARAM}`,
      shouldCloseAudioModal: false,
      testInfo,
    });
    await preFlight.initUserPage(context, {
      createParameter: `${PRE_FLIGHT_PARAM}&${LOCK_CAM_PARAM}`,
      shouldCloseAudioModal: false,
      testInfo,
    });
    await preFlight.hidesCameraWhenLocked();
  });
});
