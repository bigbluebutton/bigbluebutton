const Page = require('./core/page');
const CustomParameters = require('./customparameters/customparameters');
const c = require('./customparameters/constants');

describe('Custom parameters', () => {
  beforeEach(() => {
    jest.setTimeout(30000);
  });

  // test('Auto join', async () => {
  //   const test = new CustomParameters();
  //   let response;
  //   try {
  //     console.log('before');
  //     response = await test.autoJoin(Page.getArgs(), undefined, c.autoJoin);
  //     console.log('after');
  //   } catch (e) {
  //     console.log(e);
  //   } finally {
  //     await test.closePage(test.page1);
  //   }
  //   expect(response).toBe(true);
  // });

  // test('Listen Only Mode', async () => {
  //   const test = new CustomParameters();
  //   let response;
  //   try {
  //     console.log('before');
  //     response = await test.listenOnlyMode(Page.getArgs(), undefined, c.listenOnlyMode);
  //     console.log('after');
  //   } catch (e) {
  //     console.log(e);
  //   } finally {
  //     await test.close(test.page1, test.page2);
  //   }
  //   expect(response).toBe(true);
  // });

  // test('Force Listen Only', async () => {
  //   const test = new CustomParameters();
  //   let response;
  //   try {
  //     console.log('before');
  //     response = await test.forceListenOnly(Page.getArgs(), undefined, c.forceListenOnly);
  //     console.log('after');
  //   } catch (e) {
  //     console.log(e);
  //   } finally {
  //     await test.close(test.page1, test.page2);
  //   }
  //   expect(response).toBe(true);
  // });

  test('Skip audio check', async () => {
    const test = new CustomParameters();
    let response;
    try {
      console.log('before');
      response = await test.skipCheck(Page.getArgs(), undefined, c.skipCheck);
      console.log('after');
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  // test('Skip audio check', async () => {
  //   const test = new CustomParameters();
  //   let response;
  //   try {
  //     console.log('before');
  //     response = await test.clientTitle(Page.getArgs(), undefined, c.clientTitle);
  //     console.log('after');
  //   } catch (e) {
  //     console.log(e);
  //   } finally {
  //     await test.closePage(test.page1);
  //   }
  //   expect(response).toBe(true);
  // });

  // test('ask For Feed back On Logout', async () => {
  //   const test = new CustomParameters();
  //   let response;
  //   try {
  //     console.log('before');
  //     response = await test.askForFeedbackOnLogout(Page.getArgs(), undefined, c.askForFeedbackOnLogout);
  //     console.log('after');
  //   } catch (e) {
  //     console.log(e);
  //   } finally {
  //     await test.closePage(test.page1);
  //   }
  //   expect(response).toBe(true);
  // });
});
