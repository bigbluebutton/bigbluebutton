const Notifications = require('./notifications/notifications');
const ShareScreen = require('./screenshare/screenshare');
const Audio = require('./audio/audio');
const Page = require('./core/page');

const notificationsTest = () => {
  beforeEach(() => {
    jest.setTimeout(50000);
  });

  test('Save settings notification', async () => {
    const test = new Notifications();
    let response;
    try {
      const testName = 'saveSettingsNotification';
      response = await test.saveSettingsNotification(testName);
    } catch (e) {
      console.log(e);
    } finally {
      await test.close(test.page1, test.page2);
      await test.page1.logger('Save Setting notification !');
    }
    expect(response).toBe(true);
  });

  test('Public Chat notification', async () => {
    const test = new Notifications();
    let response;
    try {
      const testName = 'publicChatNotification';
      response = await test.publicChatNotification(testName);
    } catch (e) {
      console.log(e);
    } finally {
      await test.close(test.page1, test.page2);
      await test.page1.logger('Public Chat notification !');
    }
    expect(response).toBe(true);
  });

  test('Private Chat notification', async () => {
    const test = new Notifications();
    let response;
    try {
      const testName = 'privateChatNotification';
      response = await test.privateChatNotification(testName);
    } catch (e) {
      console.log(e);
    } finally {
      await test.close(test.page1, test.page2);
      await test.page1.logger('Private Chat notification !');
    }
    expect(response).toBe(true);
  });

  test('User join notification', async () => {
    const test = new Notifications();
    let response;
    try {
      const testName = 'userJoinNotification';
      response = await test.getUserJoinPopupResponse(testName);
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePages();
      await test.page1.logger('User join notification !');
    }
    expect(response).toBe(true);
  });

  test('Presentation upload notification', async () => {
    const test = new Notifications();
    let response;
    try {
      const testName = 'uploadPresentationNotification';
      response = await test.fileUploaderNotification(testName);
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePage(test.page3);
      await test.page3.logger('Presentation upload notification !');
    }
    expect(response).toBe(true);
  });

  test('Poll results notification', async () => {
    const test = new Notifications();
    let response;
    try {
      const testName = 'pollResultsNotification';
      response = await test.publishPollResults(testName);
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePage(test.page3);
      await test.page3.logger('Poll results notification !');
    }
    expect(response).toContain('Poll results were published to Public Chat and Whiteboard');
  });

  test('Screenshare notification', async () => {
    const page = new Notifications();
    let response;
    try {
      const testName = 'screenShareNotification';
      response = await page.screenshareToast(testName);
    } catch (e) {
      console.log(e);
    } finally {
      await page.closePage(page.page3);
      await page.page3.logger('Screenshare notification !');
    }
    expect(response).toBe('Screenshare has started');
  });

  test('Audio notifications', async () => {
    const test = new Notifications();
    let response;
    try {
      const testName = 'audioNotification';
      response = await test.audioNotification(testName);
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePage(test.page3);
      await test.page3.logger('Audio notification !');
    }
    expect(response).toBe(true);
  });
};
module.exports = exports = notificationsTest;
