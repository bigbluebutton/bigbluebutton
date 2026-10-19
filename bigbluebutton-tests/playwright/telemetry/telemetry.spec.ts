import { test } from '../core/setup/fixtures';
import { Telemetry, TELEMETRY_OFF, TELEMETRY_ON } from './telemetry';

// Client performance telemetry (public.app.telemetry), read through the debug window
test.describe.parallel('Client telemetry', { tag: '@ci' }, () => {
  test('Performance section lists measurements when telemetry is on', async ({ browser, context, page }, testInfo) => {
    const telemetry = new Telemetry(browser, context);
    await telemetry.initModPage(page, { testInfo, clientSettingsOverrides: TELEMETRY_ON });
    await telemetry.performanceSectionListsMeasurements();
  });

  test('No Performance section with telemetry off', async ({ browser, context, page }, testInfo) => {
    const telemetry = new Telemetry(browser, context);
    await telemetry.initModPage(page, { testInfo, clientSettingsOverrides: TELEMETRY_OFF });
    await telemetry.performanceSectionAbsentWhenOff();
  });

  test('Repro trail records controls and never typed text', async ({ browser, context, page }, testInfo) => {
    const telemetry = new Telemetry(browser, context);
    await telemetry.initModPage(page, { testInfo, clientSettingsOverrides: TELEMETRY_ON });
    await telemetry.reproTrailKeepsControlsNotContent();
  });
});
