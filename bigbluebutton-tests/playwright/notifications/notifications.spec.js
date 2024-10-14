const { test } = require('../fixtures');
const { Notifications } = require('./notifications');
const { ChatNotifications } = require('./chatNotifications');
const { PresenterNotifications } = require('./presenterNotifications');
const { RecordingNotifications } = require('./recordingNotifications');
const c = require('../parameters/constants');

test.describe.parallel('Notifications', { tag: '@ci' }, () => {
  test('Save settings notification', async ({ browser, context, page }) => {
    const notifications = new Notifications(browser, context);
    await notifications.initModPage(page);
    await notifications.saveSettingsNotification();
  });

  test('Audio notifications', async ({ browser, context, page }) => {
    const notifications = new Notifications(browser, context);
    await notifications.initModPage(page);
    await notifications.audioNotification();
  });

  test('User join notification', async ({ browser, context, page }) => {
    const notifications = new Notifications(browser, context);
    await notifications.initModPage(page);
    await notifications.getUserJoinPopupResponse();
  });

  //Notification does not disappear, test needs to be updated after the fix.
  test('Raise and lower hand notification', { tag: '@flaky' }, async ({ browser, context, page }) => {
    const notifications = new Notifications(browser, context);
    await notifications.initModPage(page);
    await notifications.raiseAndLowerHandNotification();
  });

  test.describe.parallel('Chat', { tag: '@ci' }, () => {
    // both tests are flaky due to missing refactor to get data from GraphQL
    test('Public Chat notification', { tag: '@flaky' }, async ({ browser, context, page }) => {
      const chatNotifications = new ChatNotifications(browser, context);
      await chatNotifications.initPages(page, true);
      await chatNotifications.publicChatNotification();
    });

    test('Private Chat notification', { tag: '@flaky' }, async ({ browser, context, page }) => {
      const chatNotifications = new ChatNotifications(browser, context);
      await chatNotifications.initPages(page, true);
      await chatNotifications.privateChatNotification();
    });
  });

  test.describe.parallel('Recording', () => {
    test('Notification appearing when user is not in audio', async ({ browser, page }) => {
      const recordingNotifications = new RecordingNotifications(browser, page);
      await recordingNotifications.init(true, true, { createParameter: c.recordMeeting });
      await recordingNotifications.notificationNoAudio();
    });
    test('Notification appearing when user is in listen only', async ({ browser, page }) => {
      const recordingNotifications = new RecordingNotifications(browser, page);
      await recordingNotifications.init(true, true, { createParameter: c.recordMeeting });
      await recordingNotifications.notificationListenOnly();
    });
    test('No notification appearing when user is in audio', async ({ browser, page }) => {
      const recordingNotifications = new RecordingNotifications(browser, page);
      await recordingNotifications.init(true, true, { createParameter: c.recordMeeting });
      await recordingNotifications.noNotificationInAudio();
    });
    test('Modal appearing when user wants to start recording', { tag: '@ci' }, async ({ browser, page }) => {
      const recordingNotifications = new RecordingNotifications(browser, page);
      await recordingNotifications.init(true, true, { createParameter: c.recordMeeting });
      await recordingNotifications.modalStartRecording();
    });
  });

  test.describe.parallel('Presenter', { tag: '@ci' }, () => {
    test('Poll results notification', async ({ browser, context, page }) => {
      const presenterNotifications = new PresenterNotifications(browser, context);
      await presenterNotifications.initPages(page, true);
      await presenterNotifications.publishPollResults();
    });

    test('Presentation upload notification', { tag: '@flaky' }, async ({ browser, context, page }) => {
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
