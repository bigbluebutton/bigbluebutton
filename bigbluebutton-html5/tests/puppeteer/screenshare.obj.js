const { toMatchImageSnapshot } = require('jest-image-snapshot');
const ShareScreen = require('./screenshare/screenshare');
const Page = require('./core/page');
const { MAX_SCREENSHARE_TEST_TIMEOUT } = require('./core/constants'); // core constants (Timeouts vars imported)
const devices = require('./core/devices');
const iPhonex = devices['iPhone X'];
const galaxyNote3 = devices['Galaxy Note 3'];
const ipadPro = devices['iPad Pro'];
expect.extend({ toMatchImageSnapshot });

const screenShareTest = () => {
  beforeEach(() => {
    jest.setTimeout(MAX_SCREENSHARE_TEST_TIMEOUT);
  });

  test('Share screen', async () => {
    const test = new ShareScreen();
    let response;
    let screenshot;
    try {
      const testName = 'shareScreen';
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
        failureThreshold: 1.37,
        failureThresholdType: 'percent',
      });
    }
  });

  test('Share screen unvailable on Mobile Android', async () => {
    process.env.IS_MOBILE = true;
    const test = new ShareScreen();
    let response;
    let screenshot;
    try {
      const testName = 'shareScreenAndroidMobile';
      await test.logger('begin of ', testName);
      response = await test.testMobileDevice(Page.getArgs(), testName, galaxyNote3);
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
        failureThreshold: 1.37,
        failureThresholdType: 'percent',
      });
    }
  });

  test('Share screen unvailable on Mobile iPhone', async () => {
    process.env.IS_MOBILE = true;
    const test = new ShareScreen();
    let response;
    let screenshot;
    try {
      const testName = 'shareScreenIphoneMobile';
      await test.logger('begin of ', testName);
      response = await test.testMobileDevice(Page.getArgs(), testName, iPhonex);
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
        failureThreshold: 1.37,
        failureThresholdType: 'percent',
      });
    }
  });

  test('Share screen unvailable on Tablet iPad', async () => {
    process.env.IS_MOBILE = true;
    const test = new ShareScreen();
    let response;
    let screenshot;
    try {
      const testName = 'shareScreenTabletIpad';
      await test.logger('begin of ', testName);
      response = await test.testMobileDevice(Page.getArgs(), testName, ipadPro);
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
        failureThreshold: 1.37,
        failureThresholdType: 'percent',
      });
    }
  });
};
module.exports = exports = screenShareTest;
