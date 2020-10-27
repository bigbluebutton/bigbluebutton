const Page = require('./core/page');
const Draw = require('./whiteboard/draw');
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

const whiteboardTest = () => {
  beforeEach(() => {
    jest.setTimeout(80000);
  });

  test('Draw rectangle', async () => {
    const test = new Draw();
    let response;
    let screenshot;
    try {
      const testName = 'drawRectangle';
      await test.init(Page.getArgs());
      await test.logger('Test Name: ', testName);
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
        failureThreshold: 0.9,
        failureThresholdType: 'percent',
      });
    }
  });
};
module.exports = exports = whiteboardTest;
