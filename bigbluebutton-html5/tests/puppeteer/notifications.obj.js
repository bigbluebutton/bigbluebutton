const Notifications = require('./notifications/notifications');
const ShareScreen = require('./screenshare/screenshare');
const Audio = require('./audio/audio');
const Page = require('./core/page');
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

const notificationsTest = () => {
  beforeEach(() => {
    jest.setTimeout(80000);
  });

  test('Save settings notification', async () => {
    const test = new Notifications();
    let response;
    let screenshot;
    try {
      const testName = 'saveSettingsNotification';
      response = await test.saveSettingsNotification(testName);
      screenshot = await test.page1.page.screenshot();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close(test.page1, test.page2);
      await test.page1.logger('Save Setting notification !');
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
      });
    }
  });

  test('Public Chat notification', async () => {
    const test = new Notifications();
    let response;
    let screenshot;
    try {
      const testName = 'publicChatNotification';
      response = await test.publicChatNotification(testName);
      screenshot = await test.page1.page.screenshot();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close(test.page1, test.page2);
      await test.page1.logger('Public Chat notification !');
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
      });
    }
  });

  test('Private Chat notification', async () => {
    const test = new Notifications();
    let response;
    let screenshot;
    try {
      const testName = 'privateChatNotification';
      response = await test.privateChatNotification(testName);
      screenshot = await test.page1.page.screenshot();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close(test.page1, test.page2);
      await test.page1.logger('Private Chat notification !');
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 0.6,
        failureThresholdType: 'percent',
      });
    }
  });

  test('User join notification', async () => {
    const test = new Notifications();
    let response;
    let screenshot;
    try {
      const testName = 'userJoinNotification';
      response = await test.getUserJoinPopupResponse(testName);
      screenshot = await test.page3.page.screenshot();
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePages();
      await test.page1.logger('User join notification !');
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 0.6,
        failureThresholdType: 'percent',
      });
    }
  });

  test('Presentation upload notification', async () => {
    const test = new Notifications();
    let response;
    let screenshot;
    try {
      const testName = 'uploadPresentationNotification';
      response = await test.fileUploaderNotification(testName);
      screenshot = await test.page3.page.screenshot();
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePage(test.page3);
      await test.page3.logger('Presentation upload notification !');
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
      });
    }
  });

  test('Poll results notification', async () => {
    const test = new Notifications();
    let response;
    let screenshot;
    try {
      const testName = 'pollResultsNotification';
      response = await test.publishPollResults(testName);
      screenshot = await test.page3.page.screenshot();
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePage(test.page3);
      await test.page3.logger('Poll results notification !');
    }
    expect(response).toContain('Poll results were published to Public Chat and Whiteboard');
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
      });
    }
  });

  test('Screenshare notification', async () => {
    const page = new Notifications();
    let response;
    let screenshot;
    try {
      const testName = 'screenShareNotification';
      response = await page.screenshareToast(testName);
      screenshot = await page.page3.page.screenshot();
    } catch (e) {
      console.log(e);
    } finally {
      await page.closePage(page.page3);
      await page.page3.logger('Screenshare notification !');
    }
    expect(response).toBe('Screenshare has started');
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
      });
    }
  });

  test('Audio notifications', async () => {
    const test = new Notifications();
    let response;
    let screenshot;
    try {
      const testName = 'audioNotification';
      response = await test.audioNotification(testName);
      screenshot = await test.page3.page.screenshot();
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePage(test.page3);
      await test.page3.logger('Audio notification !');
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
      });
    }
  });
};
module.exports = exports = notificationsTest;
