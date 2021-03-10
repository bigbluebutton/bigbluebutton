const Page = require('./core/page');
const Share = require('./webcam/share');
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { MAX_WEBCAM_LAYOUT_TEST_TIMEOUT } = require('./core/constants');

expect.extend({ toMatchImageSnapshot });

const webcamLayoutTest = () => {
  beforeEach(() => {
    jest.setTimeout(MAX_WEBCAM_LAYOUT_TEST_TIMEOUT);
  });

  test('Join Webcam and microphone', async () => {
    const test = new Share();
    let response;
    let screenshot;
    try {
      const testName = 'joinWebcamAndMicrophone';
      await test.logger('begin of ', testName);
      await test.init(Page.getArgsWithAudioAndVideo(), undefined, undefined, undefined, testName);
      await test.startRecording(testName);
      await test.webcamLayoutStart();
      response = await test.webcamLayoutTest(testName);
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
        failureThreshold: 10.83,
        failureThresholdType: 'percent',
      });
    }
  });
};
module.exports = exports = webcamLayoutTest;
