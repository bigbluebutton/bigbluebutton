const Notifications = require('./notifications');
const Page = require('../core/page');
const { closePages } = require('../core/util');
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { MAX_NOTIFICATIONS_TEST_TIMEOUT } = require('../core/constants'); // core constants (Timeouts vars imported)

expect.extend({ toMatchImageSnapshot });

const notificationsTest = () => {
  beforeEach(() => {
    jest.setTimeout(MAX_NOTIFICATIONS_TEST_TIMEOUT);
  });

  test('Save settings notification', async () => {
    const test = new Notifications();
    let response;
    let screenshot;
    try {
      const testName = 'saveSettingsNotification';
      await test.page1.logger('begin of ', testName);
      response = await test.saveSettingsNotification(testName);
      await test.page1.logger('end of ', testName);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
    } catch (err) {
      await test.page1.logger(err);
    } finally {
      await closePages(test.page1, test.page2);
      await test.page1.logger('Save Setting notification !');
    }
    expect(response).toBe(true);
    Page.checkRegression(1.56, screenshot);
  });

  test('Public Chat notification', async () => {
    const test = new Notifications();
    let response;
    let screenshot;
    try {
      const testName = 'publicChatNotification';
      await test.page1.logger('begin of ', testName);
      response = await test.publicChatNotification(testName);
      await test.page1.logger('end of ', testName);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
    } catch (err) {
      await test.page1.logger(err);
    } finally {
      await closePages(test.page1, test.page2);
      await test.page1.logger('Public Chat notification !');
    }
    expect(response).toBe(true);
    Page.checkRegression(1.0, screenshot);
  });

  test('Private Chat notification', async () => {
    const test = new Notifications();
    let response;
    let screenshot;
    try {
      const testName = 'privateChatNotification';
      await test.page1.logger('begin of ', testName);
      response = await test.privateChatNotification(testName);
      await test.page1.logger('end of ', testName);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
    } catch (err) {
      await test.page1.logger(err);
    } finally {
      await closePages(test.page1, test.page2);
      await test.page1.logger('Private Chat notification !');
    }
    expect(response).toBe(true);
    Page.checkRegression(0.6, screenshot);
  });

  test('User join notification', async () => {
    const test = new Notifications();
    let response;
    let screenshot;
    try {
      const testName = 'userJoinNotification';
      await test.page3.logger('begin of ', testName);
      response = await test.getUserJoinPopupResponse(testName);
      await test.page3.logger('end of ', testName);
      await test.page3.stopRecording();
      screenshot = await test.page3.page.screenshot();
    } catch (err) {
      await test.page3.logger(err);
    } finally {
      await closePages(test.page3, test.page4)
      await test.page3.logger('User join notification !');
    }
    expect(response).toBe(true);
    Page.checkRegression(2.0, screenshot);
  });

  test('Presentation upload notification', async () => {
    const test = new Notifications();
    let response;
    let screenshot;
    try {
      const testName = 'uploadPresentationNotification';
      await test.page3.logger('begin of ', testName);
      response = await test.fileUploaderNotification(testName);
      await test.page3.logger('end of ', testName);
      await test.page3.stopRecording();
      screenshot = await test.page3.page.screenshot();
    } catch (err) {
      await test.page3.logger(err);
    } finally {
      await test.page3.close();
      await test.page3.logger('Presentation upload notification !');
    }
    expect(response).toBe(true);
    Page.checkRegression(2.64, screenshot);
  });

  test('Poll results notification', async () => {
    const test = new Notifications();
    let response;
    let screenshot;
    try {
      const testName = 'pollResultsNotification';
      await test.page3.logger('begin of ', testName);
      await test.initUser3(true, testName);
      response = await test.publishPollResults(testName);
      await test.page3.logger('end of ', testName);
      await test.page3.stopRecording();
      screenshot = await test.page3.page.screenshot();
    } catch (err) {
      await test.page3.logger(err);
    } finally {
      await test.page3.close();
      await test.page3.logger('Poll results notification !');
    }
    expect(response).toContain('Poll results were published');
    Page.checkRegression(7.26, screenshot);
  });

  test('Screenshare notification', async () => {
    const test = new Notifications();
    let response;
    let screenshot;
    try {
      const testName = 'screenShareNotification';
      await test.page3.logger('begin of ', testName);
      response = await test.screenshareToast(testName);
      await test.page3.logger('end of ', testName);
      await test.page3.stopRecording();
      screenshot = await test.page3.page.screenshot();
    } catch (err) {
      await test.page3.logger(err);
    } finally {
      await test.page3.close();
      await test.page3.logger('Screenshare notification !');
    }
    expect(response).toBe('Screenshare has started');
    Page.checkRegression(7.25, screenshot);
  });

  test('Audio notifications', async () => {
    const test = new Notifications();
    let response;
    let screenshot;
    try {
      const testName = 'audioNotification';
      await test.page3.logger('begin of ', testName);
      response = await test.audioNotification(testName);
      await test.page3.logger('end of ', testName);
      await test.page3.stopRecording();
      screenshot = await test.page3.page.screenshot();
    } catch (err) {
      await test.page3.logger(err);
    } finally {
      await test.page3.close();
      await test.page3.logger('Audio notification !');
    }
    expect(response).toBe(true);
    Page.checkRegression(1.05, screenshot);
  });
};
module.exports = exports = notificationsTest;
