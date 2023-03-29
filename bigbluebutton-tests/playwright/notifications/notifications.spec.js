const { test } = require('@playwright/test');
const { Notifications } = require('./notifications');
const { ChatNotifications } = require('./chatNotifications');
const { PresenterNotifications } = require('./presenterNotifications');
const { RecordingNotifications } = require('./recordingNotifications');
const c = require('../customparameters/constants');

test.describe.parallel('Notifications', () => {
  test('Save settings notification @ci', async ({ browser, context, page }) => {
    const notifications = new Notifications(browser, context);
    await notifications.initModPage(page);
    await notifications.saveSettingsNotification();
  });

  test('Audio notifications @ci', async ({ browser, context, page }) => {
    const notifications = new Notifications(browser, context);
    await notifications.initModPage(page);
    await notifications.audioNotification();
  });

  test('User join notification', async ({ browser, context, page }) => {
    const notifications = new Notifications(browser, context);
    await notifications.initModPage(page);
    await notifications.getUserJoinPopupResponse();
  });

  test('Raise and lower hand notification @ci', async ({ browser, context, page }) => {
    const notifications = new Notifications(browser, context);
    await notifications.initModPage(page);
    await notifications.raiseAndLowerHandNotification();
  });

  test.describe.parallel('Chat', () => {
    test('Public Chat notification', async ({ browser, context, page }) => {
      const chatNotifications = new ChatNotifications(browser, context);
      await chatNotifications.initPages(page, true);
      await chatNotifications.publicChatNotification();
    });

    test('Private Chat notification', async ({ browser, context, page }) => {
      const chatNotifications = new ChatNotifications(browser, context);
      await chatNotifications.initPages(page, true);
      await chatNotifications.privateChatNotification();
    });
  });

  test.describe.parallel('Recording', () => {
    test('Notification appearing when user is not in audio', async ({ browser, page }) => {
      const recordingNotifications = new RecordingNotifications(browser, page);
      await recordingNotifications.init(true, true, { customParameter: c.recordMeeting });
      await recordingNotifications.notificationNoAudio();
    });
    test('Notification appearing when user is in listen only', async ({ browser, page }) => {
      const recordingNotifications = new RecordingNotifications(browser, page);
      await recordingNotifications.init(true, true, { customParameter: c.recordMeeting });
      await recordingNotifications.notificationListenOnly();
    });
    test('No notification appearing when user is in audio', async ({ browser, page }) => {
      const recordingNotifications = new RecordingNotifications(browser, page);
      await recordingNotifications.init(true, true, { customParameter: c.recordMeeting });
      await recordingNotifications.noNotificationInAudio();
    });
    test('Modal appearing when user wants to start recording', async ({ browser, page }) => {
      const recordingNotifications = new RecordingNotifications(browser, page);
      await recordingNotifications.init(true, true, { customParameter: c.recordMeeting });
      await recordingNotifications.modalStartRecording();
    });
  });

  test.describe.parallel('Presenter @ci', () => {
    test('Poll results notification', async ({ browser, context, page }) => {
      const presenterNotifications = new PresenterNotifications(browser, context);
      await presenterNotifications.initModPage(page);
      await presenterNotifications.publishPollResults();
    });

    test('Presentation upload notification', async ({ browser, context, page }) => {
      const presenterNotifications = new PresenterNotifications(browser, context);
      await presenterNotifications.initPages(page, true);
      await presenterNotifications.fileUploaderNotification();
    });

    test('Screenshare notification', async ({ browser, browserName, context, page }) => {
      test.skip(browserName === 'firefox' && process.env.DISPLAY === undefined,
        "Screenshare tests not able in Firefox browser without desktop");
      const presenterNotifications = new PresenterNotifications(browser, context);
      await presenterNotifications.initModPage(page);
      await presenterNotifications.screenshareToast();
    });
  });
});
