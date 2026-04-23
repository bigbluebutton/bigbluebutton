import { test } from '../core/setup/fixtures';
import { constants as c } from '../parameters/constants';
import { MultifunctionalMode } from './multifunctionalMode';

test.describe.parallel('Multifunctional Mode', () => {
  test('Open a panel in the auxiliary sidebar', async ({ browser, context, page }, testInfo) => {
    const mfm = new MultifunctionalMode(browser, context);
    await mfm.initModPage(page, { testInfo });
    await mfm.openPanelInAuxiliarySidebar();
  });

  test('Opening auxiliary sidebar resets camera from sidebar-bottom position', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const mfm = new MultifunctionalMode(browser, context);
    await mfm.initModPage(page, { testInfo });
    await mfm.modPage.shareWebcam();
    await mfm.openAuxiliarySidebarResetsCameraFromSidebarBottom();
  });

  test('Should not allow dragging camera below sidebars while auxiliary sidebar is open', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const mfm = new MultifunctionalMode(browser, context);
    await mfm.initModPage(page, { testInfo });
    await mfm.modPage.shareWebcam();
    await mfm.cannotDragCameraToSidebarBottomWithAuxiliaryOpen();
  });

  test('The auxiliary sidebar should remember the last open panel', async ({ browser, context, page }, testInfo) => {
    const mfm = new MultifunctionalMode(browser, context);
    await mfm.initModPage(page, { testInfo });
    await mfm.auxiliarySidebarRemembersLastOpenPanel();
  });

  test('Should show empty panel when reopening auxiliary after its previous panel was opened in main', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const mfm = new MultifunctionalMode(browser, context);
    await mfm.initModPage(page, { testInfo });
    await mfm.reopeningAuxiliaryShowsEmptyPanelWhenPreviousPanelOpenedInMain();
  });

  test('Should not allow resizing main sidebar panel while auxiliary sidebar is open', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const mfm = new MultifunctionalMode(browser, context);
    await mfm.initModPage(page, { testInfo });
    await mfm.cannotResizeMainSidebarWithAuxiliaryOpen();
  });

  test('Breakout panel in auxiliary closes when breakouts end, then reopening shows empty panel', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const mfm = new MultifunctionalMode(browser, context);
    await mfm.initPages(page, testInfo);
    await mfm.breakoutPanelInAuxiliaryClosesWhenBreakoutsEnd();
  });

  test('Notes pinned to whiteboard should close auxiliary sidebar and reopen with empty panel', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const mfm = new MultifunctionalMode(browser, context);
    await mfm.initModPage(page, { testInfo });
    await mfm.notesPinnedToWhiteboardClosesAuxiliarySidebar();
  });

  test('Auxiliary sidebar layout in RTL language', async ({ browser, context, page }, testInfo) => {
    const mfm = new MultifunctionalMode(browser, context);
    await mfm.initModPage(page, {
      joinParameter: c.overrideDefaultLocaleToRTL,
      testInfo,
    });
    await mfm.auxiliarySidebarRTLLayout();
  });
});
