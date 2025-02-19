const { test } = require('../fixtures');
const { Notifications } = require('./notifications');
const { ChatNotifications } = require('./chatNotifications');
const { PresenterNotifications } = require('./presenterNotifications');
const { RecordingNotifications } = require('./recordingNotifications');
const { recordMeeting } = require('../parameters/constants');
const { linkIssue } = require('../core/helpers');
const { PARAMETER_HIDE_PRESENTATION_TOAST } = require('../core/constants');
const { encodeCustomParams } = require('../parameters/util');

const hidePresentationToast = encodeCustomParams(PARAMETER_HIDE_PRESENTATION_TOAST);

test.describe.parallel('Notifications', { tag: '@ci' }, () => {
  test('Save settings notification', async ({ browser, context, page }) => {
    const notifications = new Notifications(browser, context);
    await notifications.initModPage(page, true, { joinParameter: hidePresentationToast });
    await notifications.saveSettingsNotification();
  });

  test('Audio notifications', async ({ browser, context, page }) => {
    const notifications = new Notifications(browser, context);
    await notifications.initModPage(page);
    await notifications.audioNotification();
  });

  test('User join notification', async ({ browser, context, page }) => {
    const notifications = new Notifications(browser, context);
    await notifications.initModPage(page, true);
    await notifications.getUserJoinPopupResponse();
  });

  // Notification does not disappear, test needs to be updated after the fix.
  test('Raise and lower hand notification', { tag: '@flaky' }, async ({ browser, context, page }) => {
    const notifications = new Notifications(browser, context);
    await notifications.initModPage(page);
    await notifications.raiseAndLowerHandNotification();
  });

  test.describe.parallel('Chat', () => {
    test('Public Chat notification', async ({ browser, context, page }) => {
      const chatNotifications = new ChatNotifications(browser, context);
      await chatNotifications.initPages(page);
      await chatNotifications.publicChatNotification();
    });

    test('Private Chat notification', async ({ browser, context, page }) => {
      const chatNotifications = new ChatNotifications(browser, context);
      await chatNotifications.initPages(page);
      await chatNotifications.privateChatNotification();
    });
  });

  test.describe.parallel('Recording', () => {
    test('Notification when user wants to start recording', async ({ browser, page }) => {
      const recordingNotifications = new RecordingNotifications(browser, page);
      await recordingNotifications.init(true, true, { createParameter: recordMeeting });
      await recordingNotifications.modalStartRecording();
    });

    test('Notification appearing when user is not in audio', async ({ browser, page }) => {
      const recordingNotifications = new RecordingNotifications(browser, page);
      await recordingNotifications.init(true, true, { createParameter: recordMeeting });
      await recordingNotifications.notificationNoAudio();
    });

    test('Notification appearing when user is in listen only', async ({ browser, page }) => {
      const recordingNotifications = new RecordingNotifications(browser, page);
      await recordingNotifications.init(true, true, { createParameter: recordMeeting });
      await recordingNotifications.notificationListenOnly();
    });

    test('No notification appearing when user is in audio', async ({ browser, page }) => {
      const recordingNotifications = new RecordingNotifications(browser, page);
      await recordingNotifications.init(true, true, { createParameter: recordMeeting });
      await recordingNotifications.noNotificationInAudio();
    });
  });

  test.describe.parallel('Presenter', () => {
    test('Poll results notification', async ({ browser, context, page }) => {
      const presenterNotifications = new PresenterNotifications(browser, context);
      await presenterNotifications.initPages(page, true, { joinParameter: hidePresentationToast});
      await presenterNotifications.publishPollResults();
    });

    test('Presentation upload notification', async ({ browser, context, page }) => {
      const presenterNotifications = new PresenterNotifications(browser, context);
      await presenterNotifications.initPages(page);
      await presenterNotifications.fileUploaderNotification();
    });

    test('Screenshare notification', async ({ browser, browserName, context, page }) => {
      test.skip(browserName === 'firefox',
        'Screenshare tests not able in Firefox browser without desktop',
      );
      const presenterNotifications = new PresenterNotifications(browser, context);
      await presenterNotifications.initModPage(page);
      await presenterNotifications.screenshareToast();
    });
  });
});
