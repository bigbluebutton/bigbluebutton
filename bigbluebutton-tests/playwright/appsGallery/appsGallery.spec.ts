import { test } from '../core/setup/fixtures';
import { AppsGallery, TWO_PINNED_APPS_SETTINGS_OVERRIDE } from './appsGallery';

test.describe.parallel('Apps Gallery', { tag: '@ci' }, () => {
  test('Search the gallery and launch an app from it', async ({ browser, context, page }, testInfo) => {
    const appsGallery = new AppsGallery(browser, context);
    await appsGallery.initModPage(page, { testInfo });
    await appsGallery.searchAndLaunchApp();
  });

  test('Unpin and pin an app', async ({ browser, context, page }, testInfo) => {
    const appsGallery = new AppsGallery(browser, context);
    await appsGallery.initModPage(page, { testInfo });
    await appsGallery.unpinAndPinApp();
  });

  test('Pinning beyond the maximum replaces the app pinned first', async ({ browser, context, page }, testInfo) => {
    const appsGallery = new AppsGallery(browser, context);
    await appsGallery.initModPage(page, { testInfo, clientSettingsOverrides: TWO_PINNED_APPS_SETTINGS_OVERRIDE });
    await appsGallery.pinBeyondTheMaximum();
  });
});
