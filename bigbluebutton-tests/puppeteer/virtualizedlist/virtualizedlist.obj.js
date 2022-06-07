const VirtualizedList = require('./virtualize');
const { TEST_DURATION_TIME } = require('../core/constants');
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

const virtualizedListTest = () => {
  test('Virtualized Users List', async () => {
    const test = new VirtualizedList();
    let response;
    let screenshot;
    try {
      const testName = 'virtualizedUserList';
      await test.page1.logger('begin of ', testName);
      await test.init(testName);
      await test.page1.startRecording(testName);
      response = await test.test();
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await test.page1.logger('end of ', testName);
    } catch (err) {
      await test.page1.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(0.05, screenshot);
  }, parseInt(TEST_DURATION_TIME));
};
module.exports = exports = virtualizedListTest;
