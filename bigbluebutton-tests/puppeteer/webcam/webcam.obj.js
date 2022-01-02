const Share = require('./share');
const Check = require('./check');
const Page = require('../core/page');
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { MAX_WEBCAM_TEST_TIMEOUT } = require('../core/constants');

expect.extend({ toMatchImageSnapshot });

const webcamTest = () => {
  beforeEach(() => {
    jest.setTimeout(MAX_WEBCAM_TEST_TIMEOUT);
  });

  test('Shares webcam', async () => {
    const test = new Share();
    let response;
    let screenshot;
    try {
      const testName = 'shareWebcam';
      await test.logger('begin of ', testName);
      await test.init(true, true, testName);
      await test.startRecording(testName);
      response = await test.test();
      await test.stopRecording();
      screenshot = await test.page.screenshot();
      await test.logger('end of ', testName);
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.81, screenshot);
  });

  test('Checks content of webcam', async () => {
    const test = new Check();
    let response;
    let screenshot;
    try {
      const testName = 'checkWebcamContent';
      await test.logger('begin of ', testName);
      await test.init(true, true, testName);
      await test.startRecording(testName);
      response = await test.test();
      await test.stopRecording();
      screenshot = await test.page.screenshot();
      await test.logger('end of ', testName);
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(7.5, screenshot);
  });

  test('Checks webcam talking indicator', async () => {
    const test = new Share();
    let response;
    let screenshot;
    try {
      const testName = 'joinWebcamAndMicrophone';
      await test.logger('begin of ', testName);
      await test.init(true, false, testName);
      await test.startRecording(testName);
      await test.webcamLayoutStart();
      response = await test.webcamLayoutTest(testName);
      await test.logger('end of ', testName);
      await test.stopRecording();
      screenshot = await test.page.screenshot();
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(10.83, screenshot);
  });
};
module.exports = exports = webcamTest;
