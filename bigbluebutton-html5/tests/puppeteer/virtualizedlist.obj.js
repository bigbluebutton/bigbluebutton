const VirtualizedList = require('./virtualizedlist/virtualize');
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

const virtualizedListTest = () => {
  test('Virtualized Users List', async () => {
    const test = new VirtualizedList();
    let response;
    let screenshot;
    try {
      await test.init();
      response = await test.test();
      screenshot = await test.page1.page.screenshot();
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
  }, parseInt(process.env.TEST_DURATION_TIME));
};
module.exports = exports = virtualizedListTest;
