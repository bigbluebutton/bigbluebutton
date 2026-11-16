import { test } from '../core/setup/fixtures';
import { constants as c } from './constants';
import { JOIN_PARAMETERS, NAMED_ATTENDEES, routeAvatarImage, UserdataParameters } from './userdataParameters';

test.describe.parallel('Userdata and join parameters', { tag: '@nightly' }, () => {
  test(
    'userdata-bbb_auto_share_webcam=true opens the webcam settings by itself once the audio modal is closed',
    { tag: '@media' },
    async ({ browser, context, page }, testInfo) => {
      const userdata = new UserdataParameters(browser, context);
      await userdata.initModPage(page, { joinParameter: c.autoShareWebcam, shouldCloseAudioModal: false, testInfo });
      await userdata.autoShareWebcam();
    },
  );

  test('userdata-bbb_direct_leave_button=false moves leaving from the navigation bar to the options menu', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const userdata = new UserdataParameters(browser, context);
    await userdata.initModPage(page, { joinParameter: JOIN_PARAMETERS.directLeaveButtonOff, testInfo });
    await userdata.directLeaveButtonOff();
  });

  test('userdata-bbb_hide_controls=true hides the actions bar and the top row of the navigation bar', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const userdata = new UserdataParameters(browser, context);
    await userdata.initModPage(page, { joinParameter: JOIN_PARAMETERS.hideControls, testInfo });
    await userdata.hideControls();
  });

  test('userdata-bbb_hide_notifications=true shows that user no toast while the others still get one', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const userdata = new UserdataParameters(browser, context);
    await userdata.initModPage(page, { joinParameter: JOIN_PARAMETERS.hideNotifications, testInfo });
    await userdata.initModPage2(context, { testInfo });
    await userdata.initUserPage(context, { testInfo });
    await userdata.hideNotifications();
  });

  test('userdata-bbb_prefer_dark_theme=true starts the client in the dark theme', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    // with a light OS preference, the dark theme can only come from the parameter
    await page.emulateMedia({ colorScheme: 'light' });
    const userdata = new UserdataParameters(browser, context);
    await userdata.initModPage(page, { joinParameter: JOIN_PARAMETERS.preferDarkTheme, testInfo });
    await userdata.preferDarkTheme();
  });

  test('userdata-bbb_show_animations_default=false starts the animations setting off', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const userdata = new UserdataParameters(browser, context);
    await userdata.initModPage(page, { joinParameter: JOIN_PARAMETERS.animationsOff, testInfo });
    await userdata.initModPage2(context, { testInfo });
    await userdata.animationsSettingAtStart();
  });

  test('avatarURL shows that image as the user avatar in the user list', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    await routeAvatarImage(context);
    const userdata = new UserdataParameters(browser, context);
    await userdata.initModPage(page, { joinParameter: JOIN_PARAMETERS.avatarURL, testInfo });
    await userdata.avatarURL();
  });

  test('firstName and lastName order the "Save user names" export', async ({ browser, context, page }, testInfo) => {
    const { zaraAbbott, adamZeller } = NAMED_ATTENDEES;
    const userdata = new UserdataParameters(browser, context);
    await userdata.initModPage(page, { testInfo });
    await userdata.initUserPage(context, {
      fullName: zaraAbbott.fullName,
      joinParameter: JOIN_PARAMETERS.firstAndLastName(zaraAbbott),
      testInfo,
    });
    await userdata.initUserPage2(context, {
      fullName: adamZeller.fullName,
      joinParameter: JOIN_PARAMETERS.firstAndLastName(adamZeller),
      testInfo,
    });
    await userdata.firstAndLastNameExport();
  });

  test('userdata-bbb_default_layout=CAMERAS_ONLY starts the client in the cameras only layout', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const userdata = new UserdataParameters(browser, context);
    await userdata.initModPage(page, { joinParameter: JOIN_PARAMETERS.defaultLayoutCamerasOnly, testInfo });
    await userdata.defaultLayoutCamerasOnly();
  });
});
