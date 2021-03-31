const Page = require('./core/page');
const Status = require('./user/status');
const MultiUsers = require('./user/multiusers');
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { MAX_MULTIUSERS_TEST_TIMEOUT } = require('./core/constants'); // core constants (Timeouts vars imported)

expect.extend({ toMatchImageSnapshot });

const userTest = () => {
  beforeEach(() => {
    jest.setTimeout(MAX_MULTIUSERS_TEST_TIMEOUT);
  });

  // Change user status icon and check if it has changed
  test('Change status', async () => {
    const test = new Status();
    let response;
    let screenshot;
    try {
      const testName = 'changeUserStatus';
      await test.logger('begin of ', testName);
      await test.init(Page.getArgs(), undefined, undefined, undefined, testName);
      await test.startRecording(testName);
      await test.closeAudioModal();
      response = await test.test();
      await test.logger('end of ', testName);
      await test.stopRecording();
      screenshot = await test.page.screenshot();
    } catch (e) {
      await test.logger(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 1.08,
        failureThresholdType: 'percent',
      });
    }
  });

  // Connect with 2 users and check if User1 sees User2
  test('Multi user presence check', async () => {
    const test = new MultiUsers();
    let response;
    let screenshot;
    try {
      const testName = 'multiUsersPresenceCheck';
      await test.page1.logger('begin of ', testName);
      await test.init(undefined, testName);
      await test.page1.startRecording(testName);
      await test.page1.closeAudioModal();
      await test.page2.startRecording(testName);
      await test.page2.closeAudioModal();
      response = await test.test();
      await test.page1.stopRecording();
      await test.page2.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await test.page1.logger('end of ', testName);
    } catch (err) {
      await test.page1.logger(err);
    } finally {
      await test.close(test.page1, test.page2);
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 19.93,
        failureThresholdType: 'percent',
      });
    }
  });

  // Open Connection Status Modal and check if appears
  test('Connections Status Modal', async () => {
    const test = new Status();
    let response;
    let screenshot;
    try {
      const testName = 'connectionStatusModal';
      await test.logger('begin of ', testName);
      await test.init(Page.getArgs(), undefined, undefined, undefined, testName);
      await test.startRecording(testName);
      await test.closeAudioModal();
      response = await test.findConnectionStatusModal();
      await test.stopRecording();
      screenshot = await test.page.screenshot();
      await test.logger('end of ', testName);
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 19.93,
        failureThresholdType: 'percent',
      });
    }
  });

  // Open Connection Status Modal, disable Webcam
  // and check if webcam sharing is still available
  test('Disable Webcams From Connection Status Modal', async () => {
    const test = new Status();
    let response;
    let screenshot;
    try {
      const testName = 'disableWebcamsFromConnectionStatus';
      await test.logger('begin of ', testName);
      await test.init(Page.getArgsWithVideo(), undefined, undefined, undefined, testName);
      await test.startRecording(testName);
      response = await test.disableWebcamsFromConnectionStatus();
      await test.stopRecording();
      screenshot = await test.page.screenshot();
      await test.logger('end of ', testName);
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 19.93,
        failureThresholdType: 'percent',
      });
    }
  });

  // Open Connection Status Modal, disable Screenshare
  // and check if Screensharing is still available
  test('Disable Screenshare From Connection Status Modal', async () => {
    const test = new Status();
    let response;
    let screenshot;
    try {
      const testName = 'disableScreenshareFromConnectionStatus';
      await test.logger('begin of ', testName);
      await test.init(Page.getArgsWithVideo(), undefined, undefined, undefined, testName);
      await test.startRecording(testName);
      response = await test.disableScreenshareFromConnectionStatus();
      await test.stopRecording();
      screenshot = await test.page.screenshot();
      await test.logger('end of ', testName);
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 19.93,
        failureThresholdType: 'percent',
      });
    }
  });
};
module.exports = exports = userTest;
