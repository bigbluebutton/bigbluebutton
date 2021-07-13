const Page = require('./core/page');
const Send = require('./chat/send');
const Clear = require('./chat/clear');
const Copy = require('./chat/copy');
const Save = require('./chat/save');
const Poll = require('./chat/poll');
const MultiUsers = require('./user/multiusers');
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { MAX_CHAT_TEST_TIMEOUT } = require('./core/constants'); // core constants (Timeouts vars imported)

expect.extend({ toMatchImageSnapshot });

const chatTest = () => {
  beforeEach(() => {
    jest.setTimeout(MAX_CHAT_TEST_TIMEOUT);
  });

  // Send public chat message and check if it appears
  test('Send message', async () => {
    const test = new Send();
    let response;
    let screenshot;
    try {
      const testName = 'sendChat';
      await test.logger('begin of ', testName);
      await test.init(Page.getArgs(), undefined, undefined, undefined, testName);
      await test.startRecording(testName);
      await test.closeAudioModal();
      response = await test.test(testName);
      await test.stopRecording();
      screenshot = await test.page.screenshot();
      await test.logger('end of ', testName);
    } catch (e) {
      await test.logger(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 0.9,
        failureThresholdType: 'percent',
      });
    }
  });

  // Clear chat box and make sure that no chat public messages appear in chat box
  test('Clear chat', async () => {
    const test = new Clear();
    let response;
    let screenshot;
    try {
      const testName = 'clearChat';
      await test.logger('begin of ', testName);
      await test.init(Page.getArgs(), undefined, undefined, undefined, testName);
      await test.startRecording(testName);
      await test.closeAudioModal();
      response = await test.test(testName);
      await test.stopRecording();
      screenshot = await test.page.screenshot();
      await test.logger('end of ', testName);
    } catch (e) {
      await test.logger(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 0.9,
        failureThresholdType: 'percent',
      });
    }
  });

  // Check if clipboard copied content contains the expected copied text
  test('Copy chat', async () => {
    const test = new Copy();
    let response;
    let screenshot;
    try {
      const testName = 'copyChat';
      await test.logger('begin of ', testName);
      await test.init(Page.getArgs(), undefined, undefined, undefined, testName);
      await test.startRecording(testName);
      await test.closeAudioModal();
      response = await test.test(testName);
      await test.stopRecording();
      screenshot = await test.page.screenshot();
      await test.logger('end of ', testName);
    } catch (e) {
      await test.logger(e);
    } finally {
      await test.close();
    }
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 0.9,
        failureThresholdType: 'percent',
      });
    }
  });

  // Wait for chat history to start downloading
  test('Save chat', async () => {
    const test = new Save();
    let response;
    let screenshot;
    try {
      const testName = 'saveChat';
      await test.logger('begin of ', testName);
      await test.init(Page.getArgs(), undefined, undefined, undefined, testName);
      await test.startRecording(testName);
      await test.closeAudioModal();
      response = await test.test(testName);
      await test.stopRecording();
      screenshot = await test.page.screenshot();
      await test.logger('end of ', testName);
    } catch (e) {
      await test.logger(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 0.9,
        failureThresholdType: 'percent',
      });
    }
  });

  // Check for public chat message and return true when it appears
  test('Send public chat', async () => {
    const test = new MultiUsers();
    let response;
    let screenshot;
    try {
      const testName = 'sendPublicChat';
      await test.page1.logger('begin of ', testName);
      await test.init(undefined, testName);
      await test.page1.startRecording(testName);
      await test.page1.closeAudioModal();
      await test.page2.closeAudioModal();
      response = await test.multiUsersPublicChat(testName);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await test.page1.logger('end of ', testName);
    } catch (e) {
      await test.page1.logger(e);
    } finally {
      await test.close(test.page1, test.page2);
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 0.9,
        failureThresholdType: 'percent',
      });
    }
  });

  // Check for private chat message and return true when it appears
  test('Send private chat to other User', async () => {
    const test = new MultiUsers();
    let response;
    let screenshot;
    try {
      const testName = 'sendPrivateChat';
      await test.page1.logger('begin of ', testName);
      await test.init(undefined, testName);
      await test.page1.startRecording(testName);
      await test.page1.closeAudioModal();
      await test.page2.closeAudioModal();
      response = await test.multiUsersPrivateChat(testName);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await test.page1.logger('end of ', testName);
    } catch (e) {
      await test.page1.logger(e);
    } finally {
      await test.close(test.page1, test.page2);
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 0.9,
        failureThresholdType: 'percent',
      });
    }
  });

  // Check for Poll Results chat message and return true when it appears
  test('Poll Results chat message', async () => {
    const test = new Poll();
    let response;
    let screenshot;
    try {
      const testName = 'pollResultsChatMessage';
      await test.page3.logger('begin of ', testName);
      await test.initUser3(Page.getArgs(), undefined, testName);
      await test.page3.startRecording(testName);
      response = await test.test(testName);
      await test.page3.startRecording();
      screenshot = await test.page3.page.screenshot();
      await test.page3.logger('end of ', testName);
    } catch (e) {
      await test.page3.logger(e);
    } finally {
      await test.closePage(test.page3);
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 0.9,
        failureThresholdType: 'percent',
      });
    }
  });
};
module.exports = exports = chatTest;
