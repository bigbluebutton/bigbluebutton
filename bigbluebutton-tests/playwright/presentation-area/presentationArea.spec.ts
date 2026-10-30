import { test } from '../core/setup/fixtures';
import { PresentationArea } from './presentationArea';

// New content on the presentation area ejects whatever was there before
test.describe.parallel('Presentation area content', { tag: ['@ci', '@media'] }, () => {
  test.beforeEach(({ browserName }) => {
    test.skip(browserName === 'firefox', 'Screenshare tests not able in Firefox browser without desktop');
  });

  test('Starting a screenshare unpins shared notes', async ({ browser, context, page }, testInfo) => {
    const presentationArea = new PresentationArea(browser, context);
    await presentationArea.initModPage(page, { testInfo });
    await presentationArea.screenshareUnpinsNotes();
  });

  test('Sharing a camera as content unpins shared notes', async ({ browser, context, page }, testInfo) => {
    const presentationArea = new PresentationArea(browser, context);
    await presentationArea.initModPage(page, { testInfo });
    await presentationArea.cameraAsContentUnpinsNotes();
  });

  test('Pinning shared notes stops the screenshare', async ({ browser, context, page }, testInfo) => {
    const presentationArea = new PresentationArea(browser, context);
    await presentationArea.initModPage(page, { testInfo });
    await presentationArea.pinningNotesStopsScreenshare();
  });

  test('Plugin main content stops the screenshare and unpins shared notes', async ({
    browser,
    context,
    page,
    request,
  }, testInfo) => {
    const presentationArea = new PresentationArea(browser, context);
    const createParameter = await presentationArea.stubPlugin(context, request);
    await presentationArea.initModPage(page, { testInfo, createParameter });
    await presentationArea.pluginContentEjectsCoreContent();
  });
});
