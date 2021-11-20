const { toMatchImageSnapshot } = require('jest-image-snapshot');
const Page = require('../core/page');
const Status = require('./status');
const MultiUsers = require('./multiusers');
const { closePages } = require('../core/util');
const { MAX_MULTIUSERS_TEST_TIMEOUT, TEST_DURATION_TIME } = require('../core/constants'); // core constants (Timeouts vars imported)
const { NETWORK_PRESETS } = require('../core/profiles');
const devices = require('../core/devices');
const iPhonex = devices['iPhone X'];
const galaxyNote3 = devices['Galaxy Note 3'];

expect.extend({ toMatchImageSnapshot });

const userTest = () => {
  beforeEach(() => {
    jest.setTimeout(MAX_MULTIUSERS_TEST_TIMEOUT);
  });

  // Mobile User Should have 'Mobile' tag under his name in Userslist
  test('Mobile Tag Name For Mobile User', async () => {
    const test = new Status();
    let response;
    let screenshot;
    try {
      const testName = 'mobileTagName';
      await test.logger('begin of ', testName);
      await test.init(true, true, testName, 'Moderator', undefined, undefined, undefined, iPhonex);
      await test.startRecording(testName);
      response = await test.mobileTagName();
      await test.logger('end of ', testName);
      await test.stopRecording();
      screenshot = await test.page.screenshot();
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(2.0, screenshot);
  });

  // Change user status icon and check if it has changed
  test('Change status', async () => {
    const test = new Status();
    let response;
    let screenshot;
    try {
      const testName = 'changeUserStatus';
      await test.logger('begin of ', testName);
      await test.init(true, true, testName);
      await test.startRecording(testName);
      response = await test.test();
      await test.logger('end of ', testName);
      await test.stopRecording();
      screenshot = await test.page.screenshot();
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(2.0, screenshot);
  });

  // Connect with 2 users and check if User1 sees User2
  test('Multi user presence check', async () => {
    const test = new MultiUsers();
    let response;
    let screenshot;
    try {
      const testName = 'multiUsersPresenceCheck';
      await test.page1.logger('begin of ', testName);
      await test.init(testName);
      await test.page1.startRecording(testName);
      await test.page2.startRecording(testName);
      response = await test.test();
      await test.page1.stopRecording();
      await test.page2.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await test.page1.logger('end osf ', testName);
    } catch (err) {
      await test.page1.logger(err);
    } finally {
      await closePages(test.page1, test.page2);
    }
    expect(response).toBe(true);
    Page.checkRegression(2.0, screenshot);
  });

  // Open Connection Status Modal and check if appears
  test('Connections Status Modal', async () => {
    const test = new Status();
    let response;
    let screenshot;
    try {
      const testName = 'connectionStatusModal';
      await test.logger('begin of ', testName);
      await test.init(true, true, testName);
      await test.startRecording(testName);
      response = await test.findConnectionStatusModal();
      await test.stopRecording();
      screenshot = await test.page.screenshot();
      await test.logger('end of ', testName);
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(2.0, screenshot);
  });

  // Open Connection Status Modal, start Webcam Share, disable Webcams in
  // Connection Status Modal and check if webcam sharing is still available
  test('Disable Webcams From Connection Status Modal', async () => {
    const test = new MultiUsers();
    let response;
    let screenshot;
    try {
      const testName = 'disableWebcamsFromConnectionStatus';
      await test.page1.logger('begin of ', testName);
      await test.init(testName);
      await test.page1.startRecording(testName);
      response = await test.disableWebcamsFromConnectionStatus();
      await test.page1.stopRecording();
      screenshot = await test.page1.screenshot();
      await test.page1.logger('end of ', testName);
    } catch (err) {
      await test.page1.logger(err);
    } finally {
      await closePages(test.page1, test.page2);
    }
    expect(response).toBe(true);
    Page.checkRegression(2.0, screenshot);
  });

  // Open Connection Status Modal, start Screenshare, disable Screenshare in
  // Connection Status Modal and check if Screensharing is still available
  test('Disable Screenshare From Connection Status Modal', async () => {
    const test = new Status();
    let response;
    let screenshot;
    try {
      const testName = 'disableScreenshareFromConnectionStatus';
      await test.logger('begin of ', testName);
      await test.init(true, true, testName);
      await test.startRecording(testName);
      response = await test.disableScreenshareFromConnectionStatus();
      await test.stopRecording();
      screenshot = await test.page.screenshot();
      await test.logger('end of ', testName);
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(2.0, screenshot);
  });

  // Connect with a Good3G NETWORK_PRESET profil,  Open Connection Status Modal
  // and check if User1 appears in reported connection issues
  test('Report a User in Connection Issues', async () => {
    const test = new Status();
    let response;
    let screenshot;
    try {
      const testName = 'reportUserInConnectionIssues';
      await test.logger('begin of ', testName);
      await test.init(true, false, testName, 'Moderator', undefined, undefined, NETWORK_PRESETS.Regular4G);
      await test.startRecording(testName);
      response = await test.reportUserInConnectionIssues();
      await test.stopRecording();
      screenshot = await test.page.screenshot();
      await test.logger('end of ', testName);
    } catch (err) {
      await test.logger(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(2.0, screenshot);
  }, TEST_DURATION_TIME);

  // Force bad connection profile, force disconnection
  // and appear with offline status in Connection Status Modal
  test('User Offline due to connection problem appears in Connection Status Modal', async () => {
    const test = new MultiUsers();
    let response;
    let screenshot;
    try {
      const testName = 'userOfflineWithInternetProblem';
      await test.page1.logger('begin of ', testName);
      await test.init(testName);
      await test.page1.startRecording(testName);
      response = await test.userOfflineWithInternetProblem();
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await test.page1.logger('end of ', testName);
    } catch (err) {
      await test.page1.logger(err);
    } finally {
      await test.page1.close();
    }
    expect(response).toBe(true);
    Page.checkRegression(2.0, screenshot);
  }, TEST_DURATION_TIME);

  test('Show network data in Connection Status', async () => {
    const test = new MultiUsers();
    let response;
    let screenshot;
    try {
      const testName = 'connectionNetworkStatus';
      await test.page1.logger('begin of ', testName);
      await test.initMod1(testName);
      await test.page1.startRecording(testName);
      response = await test.usersConnectionStatus(testName);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await test.page1.logger('end of ', testName);
    } catch (err) {
      await test.page1.logger(err);
    } finally {
      await closePages(test.page1, test.userPage);
    }
    expect(response).toBe(true);
    Page.checkRegression(2.0, screenshot);
  });


  // Raise and Lower Hand and make sure that the User2 Avatar color
  // and its avatar in raised hand toast are the same
  test('Raise Hand Toast', async () => {
    const test = new MultiUsers();
    let response;
    let screenshot;
    try {
      const testName = 'raiseAndLowerHandToast';
      await test.page1.logger('begin of ', testName);
      await test.init(testName);
      await test.page1.startRecording(testName);
      await test.page2.startRecording(testName);
      const response1 = await test.raiseHandTest();
      const responseColors = await test.getAvatarColorAndCompareWithUserListItem();
      const response2 = await test.lowerHandTest();
      response = response1 && responseColors && response2;
      await test.page1.stopRecording();
      await test.page2.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await test.page1.logger('end of ', testName);
    } catch (err) {
      await test.page1.logger(err);
    } finally {
      await closePages(test.page1, test.page2);
    }
    expect(response).toBe(true);
    Page.checkRegression(2.0, screenshot);
  });

  // Set Guest policy to ASK_MODERATOR
  // and expect user in guest wait list
  test('Guest policy: ASK_MODERATOR', async () => {
    const test = new MultiUsers();
    let response;
    let screenshot;
    try {
      const testName = 'askModeratorGuestPolicy';
      await test.page1.logger('begin of ', testName);
      await test.page1.startRecording(testName);
      response = await test.askModeratorGuestPolicy(testName);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await test.page1.logger('end of ', testName);
    } catch (err) {
      await test.page1.logger(err);
    } finally {
      await closePages(test.page1, test.userPage);
    }
    expect(response).toBe(true);
    Page.checkRegression(2.0, screenshot);
  });

  // Set Guest policy to ALWAYS_ACCEPT
  // and expect user to get accepted automatically
  test('Guest policy: ALWAYS_ACCEPT', async () => {
    const test = new MultiUsers();
    let response;
    let screenshot;
    try {
      const testName = 'alwaysAcceptGuestPolicy';
      await test.page1.logger('begin of ', testName);
      await test.page1.startRecording(testName);
      response = await test.alwaysAcceptGuestPolicy(testName);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await test.page1.logger('end of ', testName);
    } catch (err) {
      await test.page1.logger(err);
    } finally {
      await closePages(test.page1, test.userPage);
    }
    expect(response).toBe(true);
    Page.checkRegression(2.0, screenshot);
  });

  // Set Guest policy to ALWAYS_DENY
  // and expect user to get denied
  test('Guest policy: ALWAYS_DENY', async () => {
    const test = new MultiUsers();
    let response;
    let screenshot;
    try {
      const testName = 'alwaysDenyGuestPolicy';
      await test.page1.logger('begin of ', testName);
      await test.page1.startRecording(testName);
      response = await test.alwaysDenyGuestPolicy(testName);
      await test.page1.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await test.page1.logger('end of ', testName);
    } catch (err) {
      await test.page1.logger(err);
    } finally {
      await closePages(test.page1, test.userPage);
    }
    expect(response).toBe(true);
    Page.checkRegression(2.0, screenshot);
  });

  // Whiteboard shouldn't be accessible when
  // chat panel or userlist are active
  test('Whiteboard should not be accessible when chat panel or userlist are active on mobile devices', async () => {
    const test = new MultiUsers();
    let response;
    let screenshot;
    try {
      const testName = 'whiteboardNotAppearOnMobile';
      await test.page1.logger('begin of ', testName);
      await test.page1.init(true, true, testName, 'Mod1', undefined, undefined, undefined, iPhonex);
      await test.page2.init(true, true, testName, 'Mod2', undefined, undefined, undefined, galaxyNote3);
      await test.page1.startRecording(testName);
      await test.page2.startRecording(testName);
      response = await test.whiteboardNotAppearOnMobile(testName);
      await test.page1.stopRecording();
      await test.page2.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await test.page1.logger('end of ', testName);
    } catch (err) {
      await test.page1.logger(err);
    } finally {
      await closePages(test.page1, test.page2);
    }
    expect(response).toBe(true);
    Page.checkRegression(2.0, screenshot);
  });

  // Userlist and chat panel should not appear at page
  // load in iPhone and Android Mobile devices
  test('Userlist does not appear at page load on iPhone and Android', async () => {
    const test = new MultiUsers();
    let response;
    let screenshot;
    try {
      const testName = 'userlistNotAppearOnMobile';
      await test.page1.logger('begin of ', testName);
      await test.page1.init(true, true, testName, 'Mod1', undefined, undefined, undefined, iPhonex);
      await test.page2.init(true, true, testName, 'Mod2', undefined, undefined, undefined, galaxyNote3);
      await test.page1.startRecording(testName);
      await test.page2.startRecording(testName);
      response = await test.userlistNotAppearOnMobile(testName);
      await test.page1.stopRecording();
      await test.page2.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await test.page1.logger('end of ', testName);
    } catch (err) {
      await test.page1.logger(err);
    } finally {
      await closePages(test.page1, test.page2);
    }
    expect(response).toBe(true);
    Page.checkRegression(2.0, screenshot);
  });

  // Userslist shouldn't appear when Chat Panel or Whiteboard
  // are active on small mobile devices
  test('Userslist should not appear when Chat Panel or Whiteboard are active on small mobile devices', async () => {
    const test = new MultiUsers();
    let response;
    let screenshot;
    try {
      const testName = 'userlistNotAppearOnMobile';
      await test.page1.logger('begin of ', testName);
      await test.page1.init(true, true, testName, 'Mod1', undefined, undefined, undefined, iPhonex);
      await test.page2.init(true, true, testName, 'Mod2', undefined, undefined, undefined, galaxyNote3);
      await test.page1.startRecording(testName);
      await test.page2.startRecording(testName);
      response = await test.userlistNotAppearOnMobile();
      await test.page1.stopRecording();
      await test.page2.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await test.page1.logger('end of ', testName);
    } catch (err) {
      await test.page1.logger(err);
    } finally {
      await closePages(test.page1, test.page2);
    }
    expect(response).toBe(true);
    Page.checkRegression(2.0, screenshot);
  });

  // Chat Panel shouldn't appear when Userlist or Whiteboard
  // are active on small mobile devices
  test('Chat Panel should not appear when Userlist or Whiteboard are active on small mobile devices', async () => {
    const test = new MultiUsers();
    let response;
    let screenshot;
    try {
      const testName = 'chatPanelNotAppearOnMobile';
      await test.page1.logger('begin of ', testName);
      await test.page1.init(true, true, testName, 'Mod1', undefined, undefined, undefined, iPhonex);
      await test.page2.init(true, true, testName, 'Mod2', undefined, undefined, undefined, galaxyNote3);
      await test.page1.startRecording(testName);
      await test.page2.startRecording(testName);
      response = await test.chatPanelNotAppearOnMobile();
      await test.page1.stopRecording();
      await test.page2.stopRecording();
      screenshot = await test.page1.page.screenshot();
      await test.page1.logger('end of ', testName);
    } catch (err) {
      await test.page1.logger(err);
    } finally {
      await closePages(test.page1, test.page2);
    }
    expect(response).toBe(true);
    Page.checkRegression(2.0, screenshot);
  });
};

module.exports = exports = userTest;