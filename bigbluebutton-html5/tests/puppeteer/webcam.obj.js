const Share = require('./webcam/share');
const Check = require('./webcam/check');
const Page = require('./core/page');
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

const webcamTest = () => {
  beforeEach(() => {
    jest.setTimeout(30000);
  });

  test('Shares webcam', async () => {
    const test = new Share();
    let response;
    let screenshot;
    try {
      await test.init(Page.getArgsWithVideo());
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

  test('Checks content of webcam', async () => {
    const test = new Check();
    let response;
    let screenshot;
    try {
      await test.init(Page.getArgsWithVideo());
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
        failureThreshold: 7.5,
        failureThresholdType: 'percent',
      });
    }
  });
};
module.exports = exports = webcamTest;
