const Page = require('./core/page');
const Slide = require('./presentation/slide');
const Upload = require('./presentation/upload');
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

const presentationTest = () => {
  beforeEach(() => {
    jest.setTimeout(50000);
  });

  test('Skip slide', async () => {
    const test = new Slide();
    let response;
    let screenshot;
    try {
      await test.init(Page.getArgs());
      await test.closeAudioModal();
      response = await test.test();
      screenshot = await test.page.screenshot();
    } catch (e) {
      console.log(e);
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
      await test.init(Page.getArgs());
      await test.closeAudioModal();
      response = await test.test(testName);
      screenshot = await test.page.screenshot();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
      });
    }
  });
};
module.exports = exports = presentationTest;
