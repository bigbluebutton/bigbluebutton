const Page = require('../core/page');
const Send = require('./send');
const Clear = require('./clear');
const Copy = require('./copy');
const Save = require('./save');
const MultiUsers = require('../user/multiusers');
const { closePages } = require('../core/util');
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { MAX_CHAT_TEST_TIMEOUT } = require('../core/constants'); // core constants (Timeouts vars imported)

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
      await test.init(true, true, testName);
      await test.startRecording(testName);
      response = await test.test(testName);
      await test.stopRecording();
      screenshot = await test.page.screenshot();
      await test.logger('end of ', testName);
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.9, screenshot);
  });

  // Clear chat box and make sure that no chat public messages appear in chat box
  test('Clear chat', async () => {
    const test = new Clear();
    let response;
    let screenshot;
    try {
      const testName = 'clearChat';
      await test.logger('begin of ', testName);
      await test.init(true, true, testName);
      await test.startRecording(testName);
      response = await test.test(testName);
      await test.stopRecording();
      screenshot = await test.page.screenshot();
      await test.logger('end of ', testName);
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.9, screenshot);
  });

  // Check if clipboard copied content contains the expected copied text
  test('Copy chat', async () => {
    const test = new Copy();
    let response;
    let screenshot;
    try {
      const testName = 'copyChat';
      await test.logger('begin of ', testName);
      await test.init(true, true, testName);
      await test.startRecording(testName);
      response = await test.test(testName);
      await test.stopRecording();
      screenshot = await test.page.screenshot();
      await test.logger('end of ', testName);
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.9, screenshot);
  });

  // Wait for chat history to start downloading
  test('Save chat', async () => {
    const test = new Save();
    let response;
    let screenshot;
    try {
      const testName = 'saveChat';
      await test.logger('begin of ', testName);
      await test.init(true, true, testName);
      await test.startRecording(testName);
      response = await test.test(testName);
      await test.stopRecording();
      screenshot = await test.page.screenshot();
      await test.logger('end of ', testName);
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.9, screenshot);
  });

  // Check for public chat message and return true when it appears
  test('Send public chat', async () => {
    const test = new MultiUsers();
    let response;
    let screenshot;
    try {
      const testName = 'sendPublicChat';
      await test.page1.logger('begin of ', testName);
      await test.init(testName);
      await test.page1.startRecording(testName);
      response = await test.multiUsersPublicChat(testName);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await test.page1.logger('end of ', testName);
    } catch (err) {
      await test.page1.logger(err);
    } finally {
      await closePages(test.page1, test.page2);
    }
    expect(response).toBe(true);
    Page.checkRegression(0.9, screenshot);
  });

  // Check for private chat message and return true when it appears
  test('Send private chat to other User', async () => {
    const test = new MultiUsers();
    let response;
    let screenshot;
    try {
      const testName = 'sendPrivateChat';
      await test.page1.logger('begin of ', testName);
      await test.init(testName);
      await test.page1.startRecording(testName);
      response = await test.multiUsersPrivateChat(testName);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await test.page1.logger('end of ', testName);
    } catch (err) {
      await test.page1.logger(err);
    } finally {
      await closePages(test.page1, test.page2);
    }
    expect(response).toBe(true);
    Page.checkRegression(0.9, screenshot);
  });
};

module.exports = exports = chatTest;