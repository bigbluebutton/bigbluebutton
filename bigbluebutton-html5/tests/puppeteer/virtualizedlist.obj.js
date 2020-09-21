const VirtualizedList = require('./virtualizedlist/virtualize');

const virtualizedListTest = () => {
  test('Virtualized Users List', async () => {
    const test = new VirtualizedList();
    let response;
    try {
      await test.init();
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  }, parseInt(process.env.TEST_DURATION_TIME));
};
module.exports = exports = virtualizedListTest;
