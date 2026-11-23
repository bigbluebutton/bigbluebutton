import { test } from '../core/setup/fixtures';
import { PLUGIN_MANIFEST_URL, pluginCreateParameter, Telemetry, TELEMETRY_OFF, TELEMETRY_ON } from './telemetry';

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

  test('Plugin load is measured and attributed to the plugin', async ({ browser, context, page }, testInfo) => {
    test.skip(!PLUGIN_MANIFEST_URL, 'needs PLUGIN_MANIFEST_URL pointing at a plugin manifest.json');
    const telemetry = new Telemetry(browser, context);
    await telemetry.initModPage(page, {
      testInfo,
      clientSettingsOverrides: TELEMETRY_ON,
      createParameter: pluginCreateParameter(PLUGIN_MANIFEST_URL!),
    });
    await telemetry.pluginLoadIsMeasured(PLUGIN_MANIFEST_URL!);
  });

  test('Repro trail records controls and never typed text', async ({ browser, context, page }, testInfo) => {
    const telemetry = new Telemetry(browser, context);
    await telemetry.initModPage(page, { testInfo, clientSettingsOverrides: TELEMETRY_ON });
    await telemetry.reproTrailKeepsControlsNotContent();
  });
});
