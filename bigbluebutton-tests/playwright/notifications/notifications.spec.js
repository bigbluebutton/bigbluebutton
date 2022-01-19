const { test } = require('@playwright/test');
const { Notifications } = require('./notifications');
const { ChatNotifications } = require('./chatNotifications');
const { PresenterNotifications } = require('./presenterNotifications');

test.describe.parallel('Notifications', () => {
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

  test.describe.parallel('Presenter', () => {
    test('Poll results notification', async ({ browser, context, page }) => {
      const presenterNotifications = new PresenterNotifications(browser, context);
      await presenterNotifications.initModPage(page);
      await presenterNotifications.publishPollResults();
    });

    test('Presentation upload notification', async ({ browser, context, page }) => {
      const presenterNotifications = new PresenterNotifications(browser, context);
      await presenterNotifications.initModPage(page);
      await presenterNotifications.fileUploaderNotification();
    });

    test('Screenshare notification', async ({ browser, context, page }) => {
      const presenterNotifications = new PresenterNotifications(browser, context);
      await presenterNotifications.initModPage(page);
      await presenterNotifications.screenshareToast();
    });
  });
});
