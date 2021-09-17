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
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    await Page.checkRegression(1.37, screenshot);
  });

  test('Share screen unavailable on Mobile Android', async () => {
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
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    await Page.checkRegression(1.37, screenshot);
  });

  test('Share screen unavailable on Mobile iPhone', async () => {
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
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    await Page.checkRegression(1.37, screenshot);
  });

  test('Share screen unavailable on Tablet iPad', async () => {
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
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    await Page.checkRegression(1.37, screenshot);
  });
};
module.exports = exports = screenShareTest;
