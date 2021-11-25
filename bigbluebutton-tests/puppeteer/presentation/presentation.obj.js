const Page = require('../core/page');
const Presentation = require('./presentation');
const { closePages } = require('../core/util');
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { MAX_PRESENTATION_TEST_TIMEOUT } = require('../core/constants'); // core constants (Timeouts vars imported)

expect.extend({ toMatchImageSnapshot });

const presentationTest = () => {
  beforeEach(() => {
    jest.setTimeout(MAX_PRESENTATION_TEST_TIMEOUT);
  });

  test('Skip slide', async () => {
    const test = new Presentation();
    let response;
    let screenshot;
    try {
      const testName = 'skipSlide';
      await test.modPage.logger('begin of ', testName);
      await test.initModPage(testName);
      await test.modPage.startRecording(testName);
      response = await test.skipSlide();
      await test.modPage.stopRecording(testName);
      screenshot = await test.modPage.page.screenshot();
      await test.modPage.logger('end of ', testName);
    } catch (err) {
      await test.modPage.logger(err);
    } finally {
      await test.modPage.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.81, screenshot);
  });

  test('Upload presentation', async () => {
    const test = new Presentation();
    let response;
    let screenshot;
    try {
      const testName = 'uploadPresentation';
      await test.modPage.logger('begin of ', testName);
      await test.initModPage(testName);
      await test.modPage.startRecording(testName);
      response = await test.uploadPresentation(testName);
      await test.modPage.stopRecording();
      screenshot = await test.modPage.page.screenshot();
      await test.modPage.logger('end of ', testName);
    } catch (err) {
      await test.modPage.logger(err);
    } finally {
      await test.modPage.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(24.62, screenshot);
  });

  test('Allow and disallow presentation download', async () => {
    const test = new Presentation();
    let response;
    let screenshot;
    try {
      const testName = 'allowAndDisallowPresentationDownload';
      await test.modPage.logger('begin of ', testName);
      await test.initPages(testName);
      await test.modPage.startRecording(testName);
      response = await test.allowAndDisallowDownload(testName);
      await test.modPage.stopRecording();
      screenshot = await test.modPage.page.screenshot();
      await test.modPage.logger('end of ', testName);
    } catch (e) {
      await test.modPage.logger(e);
    } finally {
      await closePages(test.modPage, test.userPage);
    }
    expect(response).toBe(true);
    Page.checkRegression(24.62, screenshot);
  });

  test('Remove all presentation', async () => {
    const test = new Presentation();
    let response;
    let screenshot;
    try {
      const testName = 'removeAllPresentation';
      await test.modPage.logger('begin of ', testName);
      await test.initPages(testName);
      await test.modPage.startRecording(testName);
      response = await test.removeAllPresentation(testName);
      await test.modPage.stopRecording();
      screenshot = await test.modPage.page.screenshot();
      await test.modPage.logger('end of ', testName);
    } catch (e) {
      await test.modPage.logger(e);
    } finally {
      await closePages(test.modPage, test.userPage);
    }
    expect(response).toBe(true);
    Page.checkRegression(24.62, screenshot);
  });

  test('Hide/Restore presentation', async () => {
    const test = new Presentation();
    let response;
    let screenshot;
    try {
      const testName = 'hideAndRestorePresentation';
      await test.modPage.logger('begin of ', testName);
      await test.initModPage(testName);
      await test.modPage.startRecording(testName);
      response = await test.hideAndRestorePresentation(testName);
      await test.modPage.stopRecording();
      screenshot = await test.modPage.page.screenshot();
      await test.modPage.logger('end of ', testName);
    } catch (e) {
      await test.modPage.logger(e);
    } finally {
      await test.modPage.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(24.62, screenshot);
  });

  test('Start external video', async () => {
    const test = new Presentation();
    let response;
    let screenshot;
    try {
      const testName = 'startExternalVideo';
      await test.modPage.logger('begin of ', testName);
      await test.initPages(testName, ['--disable-features=IsolateOrigins,site-per-process']);
      await test.modPage.startRecording(testName);
      response = await test.startExternalVideo(testName);
      await test.modPage.stopRecording();
      screenshot = await test.modPage.page.screenshot();
      await test.modPage.logger('end of ', testName);
    } catch (e) {
      await test.modPage.logger(e);
    } finally {
      await closePages(test.modPage, test.userPage);
    }
    expect(response).toBe(true);
    Page.checkRegression(24.62, screenshot);
  });
};

module.exports = exports = presentationTest;
