const Notifications = require('./notifications/notifications');
const ShareScreen = require('./screenshare/screenshare');

describe('Notifications', () => {
  test('Save settings notification', async () => {
    const test = new Notifications();
    let response;
    try {
      await test.init();
      response = await test.saveSettingsNotification();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });

  test('Public Chat notification', async () => {
    const test = new Notifications();
    let response;
    try {
      await test.init();
      response = await test.publicChatNotification();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });

  test('Private Chat notification', async () => {
    const test = new Notifications();
    let response;
    try {
      await test.init();
      response = await test.privateChatNotification();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });

  test('User join notification', async () => {
    const test = new Notifications();
    let response;
    try {
      await test.initUser3();
      await test.userJoinNotification();
      await test.initUser4();
      response = await test.getUserJoinPopupResponse();
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePages();
    }
    expect(response).toBe('User4 joined the session');
  });

  test('Presentation upload notification', async () => {
    const test = new Notifications();
    let response;
    try {
      await test.initUser3();
      response = await test.fileUploaderNotification();
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePage(test.page3);
    }
    expect(response).toContain('Current presentation');
  });

  test('Poll results notification', async () => {
    const test = new Notifications();
    let response;
    try {
      await test.initUser3();
      response = await test.publishPollResults();
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePage(test.page3);
    }
    expect(response).toContain('Poll results were published to Public Chat and Whiteboard');
  });

  test('Screenshare notification', async () => {
    const test = new ShareScreen();
    const page = new Notifications()
    let response;
    try {
      await page.initUser3();
      response = await test.toast(page.page3);
    } catch (e) {
      console.log(e);
    } finally {
      await page.closePage(page.page3);
    }
    expect(response).toBe('Screenshare has started');
  });
});
