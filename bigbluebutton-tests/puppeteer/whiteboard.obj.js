const Page = require('./core/page');
const Draw = require('./whiteboard/draw');
const Multiusers = require('./user/multiusers');
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { MAX_WHITEBOARD_TEST_TIMEOUT } = require('./core/constants');

expect.extend({ toMatchImageSnapshot });

const whiteboardTest = () => {
  beforeEach(() => {
    jest.setTimeout(MAX_WHITEBOARD_TEST_TIMEOUT);
  });

  // Draw a rectange in whiteboard
  // and expect difference in shapes before and after drawing
  test('Draw rectangle', async () => {
    const test = new Draw();
    let response;
    let screenshot;
    try {
      const testName = 'drawRectangle';
      await test.logger('begin of ', testName);
      await test.init(Page.getArgs(), undefined, undefined, undefined, testName);
      await test.startRecording(testName);
      await test.logger('Test Name: ', testName);
      await test.closeAudioModal();
      response = await test.test();
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
        failureThreshold: 0.9,
        failureThresholdType: 'percent',
      });
    }
  });

  // Give a User Whiteboard addition access
  // and expect that there is only one additional user with whiteboard access
  test('Give Additional Whiteboard Access', async () => {
    const test = new Multiusers();
    let response;
    let screenshot;
    try {
      const testName = 'giveWhiteboardAdditionalAccess';
      await test.page1.logger('begin of ', testName);
      await test.init(undefined, testName);
      await test.initUser3(testName);
      await test.page1.startRecording(testName);
      await test.page2.startRecording(testName);
      await test.page1.logger('Test Name: ', testName);
      response = await test.testWhiteboardAccess();
      await test.page1.logger('end of ', testName);
      await test.page1.stopRecording();
      await test.page2.stopRecording();
      screenshot = await test.page1.page.screenshot();
    } catch (e) {
      await test.page1.logger(e);
    } finally {
      await test.close(test.page1, test.page2);
      await test.closePage(test.page3);
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
