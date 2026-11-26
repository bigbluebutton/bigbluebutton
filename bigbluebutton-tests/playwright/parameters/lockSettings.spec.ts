import { test } from '../core/setup/fixtures';
import { constants as c } from './constants';
import { LockSettingsParameters } from './lockSettings';

// Audio plays no part in these checks, so it is skipped rather than joined.
const joinWithoutAudio = { joinParameter: c.autoJoin, shouldCloseAudioModal: false };

test.describe.parallel('Lock settings create parameters', { tag: '@nightly' }, () => {
  test('lockSettingsDisablePrivateChat=true leaves a viewer a private chat with the moderator only', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const lockSettings = new LockSettingsParameters(browser, context);
    await lockSettings.initModPage(page, {
      createParameter: 'lockSettingsDisablePrivateChat=true',
      ...joinWithoutAudio,
      testInfo,
    });
    await lockSettings.initUserPage(context, { ...joinWithoutAudio, testInfo });
    await lockSettings.initUserPage2(context, { ...joinWithoutAudio, testInfo });
    await lockSettings.privateChatButtons(false);
  });

  test('Without lockSettingsDisablePrivateChat a viewer can chat privately with another viewer', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const lockSettings = new LockSettingsParameters(browser, context);
    await lockSettings.initModPage(page, { ...joinWithoutAudio, testInfo });
    await lockSettings.initUserPage(context, { ...joinWithoutAudio, testInfo });
    await lockSettings.initUserPage2(context, { ...joinWithoutAudio, testInfo });
    await lockSettings.privateChatButtons(true);
  });

  test('lockSettingsDisableNotes=true makes the shared notes read-only for a viewer', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const lockSettings = new LockSettingsParameters(browser, context);
    await lockSettings.initModPage(page, {
      createParameter: 'lockSettingsDisableNotes=true',
      ...joinWithoutAudio,
      testInfo,
    });
    await lockSettings.initUserPage(context, { ...joinWithoutAudio, testInfo });
    await lockSettings.disableNotes();
  });

  // The locked case is 'Lock Settings Disable Webcam' in parameters.spec.ts.
  test('lockSettingsLockOnJoin=false keeps the webcam lock off a viewer who joins', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const lockSettings = new LockSettingsParameters(browser, context);
    await lockSettings.initModPage(page, {
      createParameter: 'lockSettingsDisableCam=true&lockSettingsLockOnJoin=false',
      ...joinWithoutAudio,
      testInfo,
    });
    await lockSettings.initUserPage(context, { ...joinWithoutAudio, testInfo });
    await lockSettings.joinsUnlocked();
  });

  test('lockSettingsHideViewersCursor=true hides a viewer cursor from the other viewers, not from the moderator', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const lockSettings = new LockSettingsParameters(browser, context);
    await lockSettings.initModPage(page, {
      createParameter: 'multiUserWhiteboardEnabled=true&lockSettingsHideViewersCursor=true',
      ...joinWithoutAudio,
      testInfo,
    });
    await lockSettings.initUserPage(context, { ...joinWithoutAudio, testInfo });
    await lockSettings.initUserPage2(context, { ...joinWithoutAudio, testInfo });
    await lockSettings.hideViewersCursor();
  });

  test('lockSettingsHideViewersAnnotation=true hides a viewer annotation from the other viewers, not from the moderator', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const lockSettings = new LockSettingsParameters(browser, context);
    await lockSettings.initModPage(page, {
      createParameter: 'multiUserWhiteboardEnabled=true&lockSettingsHideViewersAnnotation=true',
      ...joinWithoutAudio,
      testInfo,
    });
    await lockSettings.initUserPage(context, { ...joinWithoutAudio, testInfo });
    await lockSettings.initUserPage2(context, { ...joinWithoutAudio, testInfo });
    await lockSettings.hideViewersAnnotation();
  });

  test('lockSettingsPresenterPolicy=freeForAll offers a viewer to take presenter', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const lockSettings = new LockSettingsParameters(browser, context);
    await lockSettings.initModPage(page, {
      createParameter: 'lockSettingsPresenterPolicy=freeForAll',
      ...joinWithoutAudio,
      testInfo,
    });
    await lockSettings.initUserPage(context, { ...joinWithoutAudio, testInfo });
    await lockSettings.viewerCanTakePresenter();
  });

  // requireApproval is also the server default (bigbluebutton.properties).
  test('lockSettingsPresenterPolicy=requireApproval offers a viewer to request presenter', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const lockSettings = new LockSettingsParameters(browser, context);
    await lockSettings.initModPage(page, {
      createParameter: 'lockSettingsPresenterPolicy=requireApproval',
      ...joinWithoutAudio,
      testInfo,
    });
    await lockSettings.initUserPage(context, { ...joinWithoutAudio, testInfo });
    await lockSettings.viewerCanRequestPresenter();
  });

  test('lockSettingsPresenterPolicy=moderatorOnly offers a viewer no way to become presenter', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const lockSettings = new LockSettingsParameters(browser, context);
    await lockSettings.initModPage(page, {
      createParameter: 'lockSettingsPresenterPolicy=moderatorOnly',
      ...joinWithoutAudio,
      testInfo,
    });
    await lockSettings.initUserPage(context, { ...joinWithoutAudio, testInfo });
    await lockSettings.viewerCannotBecomePresenter();
  });

  test('multiUserWhiteboardEnabled=true gives a viewer the whiteboard tools on join', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const lockSettings = new LockSettingsParameters(browser, context);
    await lockSettings.initModPage(page, {
      createParameter: 'multiUserWhiteboardEnabled=true',
      ...joinWithoutAudio,
      testInfo,
    });
    await lockSettings.initUserPage(context, { ...joinWithoutAudio, testInfo });
    await lockSettings.multiUserWhiteboardOnJoin();
  });
});
