const Page = require('./core/page');
const CustomParameters = require('./customparameters/customparameters');
const c = require('./customparameters/constants');

describe('Custom parameters', () => {
  beforeEach(() => {
    jest.setTimeout(30000);
  });

  // This test spec sets the userdata-autoJoin parameter to false 
  // and checks if the users don't get audio modal on login
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

  // This test spec sets the userdata-listenOnlyMode parameter to false 
  // and checks if the users can't see or use listen Only mode
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

  // This test spec sets the userdata-forceListenOnly parameter to false 
  // and checks if the Viewers can only use listen only mode
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

  // This test spec sets the userdata-skipCheck parameter to true 
  // and checks if the users automatically skip audio check when clicking on Microphone
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

  // This test spec sets the userdata-clientTitle parameter to some value 
  // and checks if the meeting window contains that value
  test('Client title', async () => {
    const test = new CustomParameters();
    let response;
    try {
      console.log('before');
      response = await test.clientTitle(Page.getArgs(), undefined, c.clientTitle);
      console.log('after');
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-askForFeedbackOnLogout parameter to true 
  // and checks if the users automatically get asked for feedback on logout page
  test('Ask For Feed back On Logout', async () => {
    const test = new CustomParameters();
    let response;
    try {
      console.log('before');
      response = await test.askForFeedbackOnLogout(Page.getArgs(), undefined, c.askForFeedbackOnLogout);
      console.log('after');
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });
});
