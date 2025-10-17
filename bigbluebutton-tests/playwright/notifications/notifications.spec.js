const { test } = require('../fixtures');
const { Notifications } = require('./notifications');
const { ChatNotifications } = require('./chatNotifications');
const { PresenterNotifications } = require('./presenterNotifications');
const { RecordingNotifications } = require('./recordingNotifications');
const { recordMeeting } = require('../parameters/constants');

test.describe.parallel('Notifications', { tag: '@ci' }, () => {
  test('Save settings notification', async ({ browser, context, page }, testInfo) => {
    const notifications = new Notifications(browser, context);
    await notifications.initModPage(page, true, { testInfo });
    await notifications.saveSettingsNotification();
  });

  test('Audio notifications', async ({ browser, context, page }, testInfo) => {
    const notifications = new Notifications(browser, context);
    await notifications.initModPage(page, true, { testInfo });
    await notifications.audioNotification();
  });

  test('User join notification', async ({ browser, context, page }, testInfo) => {
    const notifications = new Notifications(browser, context);
    await notifications.initModPage(page, true, { testInfo });
    await notifications.getUserJoinPopupResponse();
  });

  test('Raise and lower hand notification', async ({ browser, context, page }, testInfo) => {
    const notifications = new Notifications(browser, context);
    await notifications.initModPage(page, true, { testInfo });
    await notifications.raiseAndLowerHandNotification();
  });

  test('Leave notification', async ({ browser, context, page }, testInfo) => {
    const notifications = new Notifications(browser, context);
    await notifications.initModPage(page, true, { testInfo });
    await notifications.userLeaveNotifications();
  });

  test.describe.parallel('Chat', () => {
    test('Public Chat notification', async ({ browser, context, page }, testInfo) => {
      const chatNotifications = new ChatNotifications(browser, context);
      await chatNotifications.initPages(page, testInfo);
      await chatNotifications.modPage.closeAllToastNotifications();
      await chatNotifications.userPage.closeAllToastNotifications();
      await chatNotifications.publicChatNotification();
    });

    test('Private Chat notification', async ({ browser, context, page }, testInfo) => {
      const chatNotifications = new ChatNotifications(browser, context);
      await chatNotifications.initPages(page, testInfo);
      await chatNotifications.modPage.closeAllToastNotifications();
      await chatNotifications.userPage.closeAllToastNotifications();
      await chatNotifications.privateChatNotification();
    });
  });

  test.describe.parallel('Recording', () => {
    test('Notification appearing when user is not in audio', async ({ browser, page }, testInfo) => {
      const recordingNotifications = new RecordingNotifications(browser, page);
      await recordingNotifications.init(true, true, { createParameter: recordMeeting, testInfo });
      await recordingNotifications.notificationNoAudio();
    });

    test('Notification appearing when user is in listen only', async ({ browser, page }, testInfo) => {
      const recordingNotifications = new RecordingNotifications(browser, page);
      await recordingNotifications.init(true, true, { createParameter: recordMeeting, testInfo });
      await recordingNotifications.notificationListenOnly();
    });

    test('No notification appearing when user is in audio', async ({ browser, page }, testInfo) => {
      const recordingNotifications = new RecordingNotifications(browser, page);
      await recordingNotifications.init(true, true, { createParameter: recordMeeting, testInfo });
      await recordingNotifications.noNotificationInAudio();
    });

    test('Modal appearing when user wants to start recording', async ({ browser, page }, testInfo) => {
      const recordingNotifications = new RecordingNotifications(browser, page);
      await recordingNotifications.init(true, true, { createParameter: recordMeeting, testInfo });
      await recordingNotifications.modalStartRecording();
    });
  });

  test.describe.parallel('Presenter', () => {
    test('Poll results notification', async ({ browser, context, page }, testInfo) => {
      const presenterNotifications = new PresenterNotifications(browser, context);
      await presenterNotifications.initPages(page, testInfo);
      await presenterNotifications.modPage.closeAllToastNotifications();
      await presenterNotifications.userPage.closeAllToastNotifications();
      await presenterNotifications.publishPollResults();
    });

    test('Presentation upload notification', async ({ browser, context, page }, testInfo) => {
      const presenterNotifications = new PresenterNotifications(browser, context);
      await presenterNotifications.initPages(page, testInfo);
      await presenterNotifications.modPage.closeAllToastNotifications();
      await presenterNotifications.userPage.closeAllToastNotifications();
      await presenterNotifications.fileUploaderNotification();
    });

    test('Screenshare notification', async ({ browser, browserName, context, page }, testInfo) => {
      test.skip(browserName === 'firefox',
        'Screenshare tests not able in Firefox browser without desktop',
      );
      const presenterNotifications = new PresenterNotifications(browser, context);
      await presenterNotifications.initModPage(page, true, { testInfo });
      await presenterNotifications.screenshareToast();
    });
  });
});
