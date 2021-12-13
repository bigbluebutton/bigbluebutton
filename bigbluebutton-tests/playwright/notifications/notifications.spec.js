const { test } = require('@playwright/test');
const { Notifications } = require('./notifications');

test.describe.parallel('Notifications', () => {
  test('Save settings notification', async ({ browser, context, page }) => {
    const notification = new Notifications(browser, context);
    await notification.initModPage(page);
    await notification.saveSettingsNotification();
  });

  test('Public Chat notification', async ({ browser, context, page }) => {
    const notification = new Notifications(browser, context);
    await notification.initPages(page);
    await notification.publicChatNotification();
  });

  test('Private Chat notification', async ({ browser, context, page }) => {
    const notification = new Notifications(browser, context);
    await notification.initPages(page);
    await notification.privateChatNotification();
  });

  test('User join notification', async ({ browser, context, page }) => {
    const notification = new Notifications(browser, context);
    await notification.initModPage(page);
    await notification.getUserJoinPopupResponse();
  });

  test('Presentation upload notification', async ({ browser, context, page }) => {
    const notification = new Notifications(browser, context);
    await notification.initModPage(page);
    await notification.fileUploaderNotification();
  });

  test('Poll results notification', async ({ browser, context, page }) => {
    const notification = new Notifications(browser, context);
    await notification.initModPage(page);
    await notification.publishPollResults();
  });

  test('Screenshare notification', async ({ browser, context, page }) => {
    const notification = new Notifications(browser, context);
    await notification.initModPage(page);
    await notification.screenshareToast();
  });

  test('Audio notifications', async ({ browser, context, page }) => {
    const notification = new Notifications(browser, context);
    await notification.initModPage(page);
    await notification.audioNotification();
  });
});
