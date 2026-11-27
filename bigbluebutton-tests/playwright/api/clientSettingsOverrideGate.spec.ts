import { expect } from '@playwright/test';

import { APOLLO_CLIENT_SETTINGS_OVERRIDE } from '../core/apolloProbe';
import { buildClientSettingsOverrideModule } from '../core/helpers';
import { Page } from '../core/page';
import { test } from '../core/setup/fixtures';

// Needs a server that keeps the default allowOverrideClientSettingsOnCreateCall=false, which only the
// setting-client-settings-override-off nightly job has. Every other CI server enables it and runs tests
// with this same override, so a module that is wrong in itself fails there instead of passing here.
test.describe(
  'clientSettingsOverride create module',
  { tag: '@setting-required:clientSettingsOverrideDisabled' },
  () => {
    test('is ignored while the server does not allow it', async ({ browser, page }, testInfo) => {
      const modPage = new Page(browser, page);
      // init() needs create to answer with a meeting: ignoring the module must not refuse the meeting.
      await modPage.init(true, {
        createModules: buildClientSettingsOverrideModule(APOLLO_CLIENT_SETTINGS_OVERRIDE),
        testInfo,
      });
      const delivered = await page.evaluate(
        () =>
          (window as unknown as { meetingClientSettings?: { public?: { app?: { enableApolloDevTools?: boolean } } } })
            .meetingClientSettings?.public?.app?.enableApolloDevTools,
      );
      expect(delivered, 'the client should get the stock value, not the one in the create module').toBe(false);
    });
  },
);
