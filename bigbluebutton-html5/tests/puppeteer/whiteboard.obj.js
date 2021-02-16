const Page = require('./core/page');
const Draw = require('./whiteboard/draw');
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { MAX_WHITEBOARD_TEST_TIMEOUT } = require('./core/constants');

expect.extend({ toMatchImageSnapshot });

const whiteboardTest = () => {
  beforeEach(() => {
    jest.setTimeout(MAX_WHITEBOARD_TEST_TIMEOUT);
  });

  test('Draw rectangle', async () => {
    const test = new Draw();
    let response;
    let screenshot;
    try {
      const testName = 'drawRectangle';
      await test.logger('begin of ', testName);
      await test.init(Page.getArgs());
      await test.logger('Test Name: ', testName);
      await test.closeAudioModal();
      response = await test.test();
      await test.logger('end of ', testName);
      screenshot = await test.page.screenshot();
    } catch (e) {
      await test.logger(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 0.9,
        failureThresholdType: 'percent',
      });
    }
  });
};
module.exports = exports = whiteboardTest;
