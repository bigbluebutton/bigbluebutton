const Page = require('./core/page');
const Share = require('./webcam/share');
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

const webcamLayoutTest = () => {
  beforeEach(() => {
    jest.setTimeout(80000);
  });

  test('Join Webcam and microphone', async () => {
    const test = new Share();
    let response;
    let screenshot;
    try {
      const testName = 'joinWebcamAndMicrophone';
      await test.logger('begin of ', testName);
      await test.init(Page.getArgsWithAudioAndVideo());
      await test.webcamLayoutStart();
      response = await test.webcamLayoutTest();
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
        failureThreshold: 10.83,
        failureThresholdType: 'percent',
      });
    }
  });
};
module.exports = exports = webcamLayoutTest;
