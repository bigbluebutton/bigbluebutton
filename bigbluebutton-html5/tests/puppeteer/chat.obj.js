const Page = require('./core/page');
const Send = require('./chat/send');
const Clear = require('./chat/clear');
const Copy = require('./chat/copy');
const Save = require('./chat/save');
const MultiUsers = require('./user/multiusers');
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

const chatTest = () => {
  beforeEach(() => {
    jest.setTimeout(30000);
  });

  test('Send message', async () => {
    const test = new Send();
    let response;
    let screenshot;
    try {
      const testName = 'sendChat';
      await test.logger('begin of ', testName);
      await test.init(Page.getArgs());
      await test.closeAudioModal();
      response = await test.test(testName);
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

  test('Clear chat', async () => {
    const test = new Clear();
    let response;
    let screenshot;
    try {
      const testName = 'clearChat';
      await test.logger('begin of ', testName);
      await test.init(Page.getArgs());
      await test.closeAudioModal();
      response = await test.test(testName);
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

  test('Copy chat', async () => {
    const test = new Copy();
    let response;
    let screenshot;
    try {
      const testName = 'copyChat';
      await test.logger('begin of ', testName);
      await test.init(Page.getArgs());
      await test.closeAudioModal();
      response = await test.test(testName);
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

  test('Save chat', async () => {
    const test = new Save();
    let response;
    let screenshot;
    try {
      const testName = 'saveChat';
      await test.logger('begin of ', testName);
      await test.init(Page.getArgs());
      await test.closeAudioModal();
      response = await test.test(testName);
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

  test('Send private chat to other User', async () => {
    const test = new MultiUsers();
    let response;
    let screenshot;
    try {
      const testName = 'sendPrivateChat';
      await test.page1.logger('begin of ', testName);
      await test.init();
      await test.page1.closeAudioModal();
      await test.page2.closeAudioModal();
      response = await test.multiUsersPrivateChat(testName);
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

  test('Send public chat', async () => {
    const test = new MultiUsers();
    let response;
    let screenshot;
    try {
      const testName = 'sendPublicChat';
      await test.page1.logger('begin of ', testName);
      await test.init();
      await test.page1.closeAudioModal();
      await test.page2.closeAudioModal();
      response = await test.multiUsersPublicChat(testName);
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
};
module.exports = exports = chatTest;
