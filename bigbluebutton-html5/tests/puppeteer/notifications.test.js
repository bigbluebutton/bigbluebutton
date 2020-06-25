const Notifications = require('./notifications/notifications');
const ShareScreen = require('./screenshare/screenshare');
const Audio = require('./audio/audio');

describe('Notifications', () => {
  beforeEach(() => {
    jest.setTimeout(30000);
  });

  test('Save settings notification', async () => {
    const test = new Notifications();
    let response;
    try {
      response = await test.saveSettingsNotification();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close(test.page1, test.page2);
    }
    expect(response).toBe(true);
  });

  test('Public Chat notification', async () => {
    const test = new Notifications();
    let response;
    try {
      response = await test.publicChatNotification();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close(test.page1, test.page2);
    }
    expect(response).toBe(true);
  });

  test('Private Chat notification', async () => {
    const test = new Notifications();
    let response;
    try {
      response = await test.privateChatNotification();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close(test.page1, test.page2);
    }
    expect(response).toBe(true);
  });

  test('User join notification', async () => {
    const test = new Notifications();
    let response;
    try {
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
    const page = new Notifications();
    let response;
    try {
      await page.initUser3(undefined);
      response = await test.toast(page.page3);
    } catch (e) {
      console.log(e);
    } finally {
      await page.closePage(page.page3);
    }
    expect(response).toBe('Screenshare has started');
  });

  test('Audio notifications', async () => {
    const test = new Audio();
    const page = new Notifications();
    let response;
    try {
      process.env.IS_AUDIO_TEST = true;
      await test.initOneUser(page.page3);
      response = await test.audioNotification(page.page3);
    } catch (e) {
      console.log(e);
    } finally {
      await page.closePage(page.page3);
    }
    expect(response).toBe('You have joined the audio conference');
  });
});
