import { test } from '../core/setup/fixtures';
import { constants as c } from '../parameters/constants';
import { MULTI_FUNCTIONAL_MODE_SETTINGS, MultifunctionalMode } from './multifunctionalMode';

test.describe.parallel('Multifunctional Mode', { tag: '@ci' }, () => {
  test('Open a panel in the auxiliary sidebar', async ({ browser, context, page }, testInfo) => {
    const mfm = new MultifunctionalMode(browser, context);
    await mfm.initModPage(page, { testInfo, clientSettingsOverrides: MULTI_FUNCTIONAL_MODE_SETTINGS });
    await mfm.openPanelInAuxiliarySidebar();
  });

  test(
    'Opening auxiliary sidebar resets camera from sidebar-bottom position',
    { tag: '@media' },
    async ({ browser, context, page }, testInfo) => {
      const mfm = new MultifunctionalMode(browser, context);
      await mfm.initModPage(page, { testInfo, clientSettingsOverrides: MULTI_FUNCTIONAL_MODE_SETTINGS });
      await mfm.modPage.shareWebcam();
      await mfm.openAuxiliarySidebarResetsCameraFromSidebarBottom();
    },
  );

  test(
    'Should not allow dragging camera below sidebars while auxiliary sidebar is open',
    { tag: '@media' },
    async ({ browser, context, page }, testInfo) => {
      const mfm = new MultifunctionalMode(browser, context);
      await mfm.initModPage(page, { testInfo, clientSettingsOverrides: MULTI_FUNCTIONAL_MODE_SETTINGS });
      await mfm.modPage.shareWebcam();
      await mfm.cannotDragCameraToSidebarBottomWithAuxiliaryOpen();
    },
  );

  test('The auxiliary sidebar should remember the last open panel', async ({ browser, context, page }, testInfo) => {
    const mfm = new MultifunctionalMode(browser, context);
    await mfm.initModPage(page, { testInfo, clientSettingsOverrides: MULTI_FUNCTIONAL_MODE_SETTINGS });
    await mfm.auxiliarySidebarRemembersLastOpenPanel();
  });

  test('Should show empty panel when reopening auxiliary after its previous panel was opened in main', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const mfm = new MultifunctionalMode(browser, context);
    await mfm.initModPage(page, { testInfo, clientSettingsOverrides: MULTI_FUNCTIONAL_MODE_SETTINGS });
    await mfm.reopeningAuxiliaryShowsEmptyPanelWhenPreviousPanelOpenedInMain();
  });

  test('Breakout panel in auxiliary closes when breakouts end, then reopening shows empty panel', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const mfm = new MultifunctionalMode(browser, context);
    await mfm.initModPage(page, { testInfo, clientSettingsOverrides: MULTI_FUNCTIONAL_MODE_SETTINGS });
    await mfm.initUserPage(context, { testInfo, clientSettingsOverrides: MULTI_FUNCTIONAL_MODE_SETTINGS });
    await mfm.breakoutPanelInAuxiliaryClosesWhenBreakoutsEnd();
  });

  test('Notes pinned to whiteboard should close auxiliary sidebar and reopen with empty panel', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const mfm = new MultifunctionalMode(browser, context);
    await mfm.initModPage(page, { testInfo, clientSettingsOverrides: MULTI_FUNCTIONAL_MODE_SETTINGS });
    await mfm.notesPinnedToWhiteboardClosesAuxiliarySidebar();
  });

  test('Auxiliary sidebar layout in RTL language', async ({ browser, context, page }, testInfo) => {
    const mfm = new MultifunctionalMode(browser, context);
    await mfm.initModPage(page, {
      joinParameter: c.overrideDefaultLocaleToRTL,
      clientSettingsOverrides: MULTI_FUNCTIONAL_MODE_SETTINGS,
      testInfo,
    });
    await mfm.auxiliarySidebarRTLLayout();
  });
});
