const Page = require('./core/page');
const Slide = require('./presentation/slide');
const Upload = require('./presentation/upload');
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { MAX_PRESENTATION_TEST_TIMEOUT } = require('./core/constants'); // core constants (Timeouts vars imported)

expect.extend({ toMatchImageSnapshot });

const presentationTest = () => {
  beforeEach(() => {
    jest.setTimeout(MAX_PRESENTATION_TEST_TIMEOUT);
  });

  test('Skip slide', async () => {
    const test = new Slide();
    let response;
    let screenshot;
    try {
      const testName = 'skipSlide';
      await test.logger('begin of ', testName);
      await test.init(Page.getArgs());
      await test.closeAudioModal();
      response = await test.test();
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
        failureThreshold: 0.81,
        failureThresholdType: 'percent',
      });
    }
  });

  test('Upload presentation', async () => {
    const test = new Upload();
    let response;
    let screenshot;
    try {
      const testName = 'uploadPresentation';
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
        failureThreshold: 24.62,
        failureThresholdType: 'percent',
      });
    }
  });
};
module.exports = exports = presentationTest;
