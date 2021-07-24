const VirtualizedList = require('./virtualizedlist/virtualize');
const { TEST_DURATION_TIME } = require('./core/constants');
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
      await test.init(undefined, testName);
      await test.page1.startRecording(testName);
      response = await test.test();
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await test.page1.logger('end of ', testName);
    } catch (e) {
      await test.page1.logger(e);
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
  }, parseInt(TEST_DURATION_TIME));
};
module.exports = exports = virtualizedListTest;
