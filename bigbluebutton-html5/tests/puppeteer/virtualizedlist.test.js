const moment = require('moment');
const VirtualizedList = require('./virtualizedlist/virtualize');

describe('Virtualized List', () => {
  test('Virtualized List Audio test', async () => {
    const test = new VirtualizedList();
    let response;
    try {
      console.log('initializing ', moment(Date.now()).format('DD/MM/YYYY hh:mm:ss'));
      await test.init();
      console.log('getting results', moment(Date.now()).format('DD/MM/YYYY hh:mm:ss'));
      response = await test.test();
      console.log('after test ', moment(Date.now()).format('DD/MM/YYYY hh:mm:ss'));
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(parseInt(process.env.USER_LIST_VLIST_BOTS_LISTENING) + 1);
  }, parseInt(process.env.TEST_DURATION_TIME));
});
