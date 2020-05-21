const Page = require('./core/page');
const CustomParameters = require('./customparameters/customparameters');
const c = require('./customparameters/constants');

describe('Custom parameters', () => {
  beforeEach(() => {
    jest.setTimeout(30000);
  });

  // This test spec sets the userdata-autoJoin parameter to false
  // and checks that the users don't get audio modal on login
  test('Auto join', async () => {
    const test = new CustomParameters();
    let response;
    try {
      console.log('before');
      const testName = 'autoJoin';
      response = await test.autoJoin(testName, Page.getArgs(), undefined, c.autoJoin);
      console.log('after');
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-listenOnlyMode parameter to false
  // and checks that the users can't see or use listen Only mode
  test('Listen Only Mode', async () => {
    const test = new CustomParameters();
    let response;
    try {
      console.log('before');
      const testName = 'listenOnlyMode';
      response = await test.listenOnlyMode(testName, Page.getArgs(), undefined, c.listenOnlyMode);
      console.log('after');
    } catch (e) {
      console.log(e);
    } finally {
      await test.close(test.page1, test.page2);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-forceListenOnly parameter to false
  // and checks that the Viewers can only use listen only mode
  test('Force Listen Only', async () => {
    const test = new CustomParameters();
    let response;
    try {
      console.log('before');
      const testName = 'forceListenOnly';
      response = await test.forceListenOnly(testName, Page.getArgs(), undefined, c.forceListenOnly);
      console.log('after');
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePage(test.page2);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-skipCheck parameter to true
  // and checks that the users automatically skip audio check when clicking on Microphone
  test('Skip audio check', async () => {
    const test = new CustomParameters();
    let response;
    try {
      console.log('before');
      const testName = 'skipCheck';
      response = await test.skipCheck(testName, Page.getArgs(), undefined, c.skipCheck);
      console.log('after');
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-clientTitle parameter to some value
  // and checks that the meeting window name starts with that value
  test('Client title', async () => {
    const test = new CustomParameters();
    let response;
    try {
      console.log('before');
      const testName = 'clientTitle';
      response = await test.clientTitle(testName, Page.getArgs(), undefined, c.clientTitle);
      console.log('after');
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-askForFeedbackOnLogout parameter to true
  // and checks that the users automatically get asked for feedback on logout page
  test('Ask For Feed back On Logout', async () => {
    const test = new CustomParameters();
    let response;
    try {
      console.log('before');
      const testName = 'askForFeedbackOnLogout';
      response = await test.askForFeedbackOnLogout(testName, Page.getArgs(), undefined, c.askForFeedbackOnLogout);
      console.log('after');
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-displayBrandingArea parameter to true and add a logo link
  // and checks that the users see the logo displaying in the meeting
  test('Display Branding Area', async () => {
    const test = new CustomParameters();
    let response;
    try {
      console.log('before');
      const testName = 'displayBrandingArea';
      const parameterWithLogo = `${c.displayBrandingArea}&${c.logo}`;
      response = await test.displayBrandingArea(testName, Page.getArgs(), undefined, parameterWithLogo);
      console.log('after');
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-shortcuts parameter to one or a list of shortcuts parameters
  // and checks that the users can use those shortcuts
  test('Shortcuts', async () => {
    const test = new CustomParameters();
    let response;
    try {
      console.log('before');
      const testName = 'shortcuts';
      response = await test.shortcuts(testName, Page.getArgs(), undefined, c.shortcuts);
      console.log('after');
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });

  // This test spec sets the userdata-enableScreensharing parameter to false
  // and checks that the Moderator can not see the Screen sharing button
  test('Enable Screensharing', async () => {
    const test = new CustomParameters();
    let response;
    try {
      console.log('before');
      const testName = 'enableScreensharing';
      response = await test.enableScreensharing(testName, Page.getArgs(), undefined, c.enableScreensharing);
      console.log('after');
    } catch (e) {
      console.log(e);
    } finally {
      await test.closePage(test.page1);
    }
    expect(response).toBe(true);
  });
});
