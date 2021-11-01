const Page = require('../core/page');
const Draw = require('./draw');
const Multiusers = require('../user/multiusers');
const { closePages } = require('../core/util');
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { MAX_WHITEBOARD_TEST_TIMEOUT } = require('../core/constants');

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
      await test.init(true, true, testName);
      await test.startRecording(testName);
      response = await test.test();
      await test.logger('end of ', testName);
      await test.stopRecording();
      screenshot = await test.page.screenshot();
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.9, screenshot);
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
      await test.init(testName);
      await test.page1.startRecording(testName);
      await test.page2.startRecording(testName);
      response = await test.testWhiteboardAccess();
      await test.page1.logger('end of ', testName);
      await test.page1.stopRecording();
      await test.page2.stopRecording();
      screenshot = await test.page1.page.screenshot();
    } catch (err) {
      await test.page1.logger(err);
    } finally {
      await closePages(test.page1, test.page2);
    }
    expect(response).toBe(true);
    Page.checkRegression(0.9, screenshot);
  });
};
module.exports = exports = whiteboardTest;
