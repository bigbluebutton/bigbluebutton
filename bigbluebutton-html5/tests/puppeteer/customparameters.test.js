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
});
