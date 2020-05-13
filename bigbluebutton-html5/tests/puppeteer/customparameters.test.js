const Page = require('./core/page');
const CustomParameters = require('./customparameters/customparameters');
const c = require('./customparameters/constants');

describe('Custom parameters', () => {
  beforeEach(() => {
    jest.setTimeout(process.env.TEST_DURATION_TIME);
  });

  test('Auto join', async () => {
    const test = new CustomParameters();
    let response;
    try {
      console.log('before');
      response = await test.autoJoin(Page.getArgs(), undefined, c.autoJoin);
      console.log('after');
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  test('Listen Only Mode', async () => {
    const test = new CustomParameters();
    let response;
    try {
      console.log('before');
      response = await test.listenOnlyMode(Page.getArgs(), undefined, c.listenOnlyMode);
      console.log('after');
    } catch (e) {
      console.log(e);
    } finally {
      await test.close(test.page1, test.page2);
    }
    expect(response).toBe(true);
  });

  test('Force Listen Only', async () => {
    const test = new CustomParameters();
    let response;
    try {
      console.log('before');
      response = await test.forceListenOnly(Page.getArgs(), undefined, c.forceListenOnly);
      console.log('after');
    } catch (e) {
      console.log(e);
    } finally {
      await test.close(test.page1, test.page2);
    }
    expect(response).toBe(true);
  });
});
