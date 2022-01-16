const { test, devices } = require('@playwright/test');
const { Status } = require('./status');
const { MultiUsers } = require('./multiusers');
const motoG4 = devices['Moto G4'];
const iPhone11 = devices['iPhone 11'];

test.describe.parallel('User test suite', () => {
  test('Change status', async ({ browser, page }) => {
    const status = new Status(browser, page);
    await status.init(true, true);
    await status.changeStatus();
  });

  test('Mobile Tag Name For Mobile User', async ({ browser }) => {
    const context = await browser.newContext({ ...iPhone11 });
    const mobilePage = await context.newPage();
    const status = new Status(browser, mobilePage);
    await status.init(true, true);
    await status.mobileTagName();
  });

  test('User presence check (multiple users)', async ({ browser, context, page }) => {
    const multiusers = new MultiUsers(browser, context);
    await multiusers.initPages(page);
    await multiusers.userPresence();
  });

  test('Connections Status Modal', async ({ browser, page }) => {
    const status = new Status(browser, page);
    await status.init(true, true);
    await status.connectionStatusModal();
  });

  test('Disable Screenshare From Connection Status Modal', async ({ browser, page }) => {
    const status = new Status(browser, page);
    await status.init(true, true);
    await status.disableScreenshareFromConnectionStatus();
  });

  test('Report a User with bad connection in Connection Issues', async ({ browser, page }) => {
    const status = new Status(browser, page);
    await status.init(true, true);
    await status.reportUserInConnectionIssues();
  });

  test('Disable Webcams From Connection Status Modal', async ({ browser, context, page }) => {
    const multiusers = new MultiUsers(browser, context);
    await multiusers.initPages(page);
    await multiusers.disableWebcamsFromConnectionStatus();
  });

  test('Show network data in Connection Status', async ({ browser, context, page }) => {
    const multiusers = new MultiUsers(browser, context);
    await multiusers.initModPage(page);
    await multiusers.usersConnectionStatus();
  });

  test('Raise and lower Hand Toast', async ({ browser, context, page }) => {
    const multiusers = new MultiUsers(browser, context);
    await multiusers.initPages(page);
    await multiusers.raiseHandTest();
    await multiusers.getAvatarColorAndCompareWithUserListItem();
    await multiusers.lowerHandTest();
  });

  test('Guest policy: ASK_MODERATOR', async ({ browser, context, page }) => {
    const multiusers = new MultiUsers(browser, context);
    await multiusers.initModPage(page);
    await multiusers.askModeratorGuestPolicy();
  });

  test('Guest policy: ALWAYS_ACCEPT', async ({ browser, context, page }) => {
    const multiusers = new MultiUsers(browser, context);
    await multiusers.initModPage(page);
    await multiusers.alwaysAcceptGuestPolicy();
  });

  test('Guest policy: ALWAYS_DENY', async ({ browser, context, page }) => {
    const multiusers = new MultiUsers(browser, context);
    await multiusers.initModPage(page);
    await multiusers.alwaysDenyGuestPolicy();
  });

  test('Whiteboard should not be accessible when chat panel or userlist are active on mobile devices', async ({ browser }) => {
    test.fixme();
    const iphoneContext = await browser.newContext({ ...iPhone11 });
    const motoContext = await browser.newContext({ ...motoG4 });
    const modPage = await iphoneContext.newPage();
    const multiusers = new MultiUsers(browser, iphoneContext);
    await multiusers.initModPage(modPage);
    await multiusers.initUserPage(true, motoContext);
    await multiusers.whiteboardNotAppearOnMobile();
  });

  test('Userslist should not appear when Chat Panel or Whiteboard are active on mobile devices', async ({ browser, context, page }) => {
    const iphoneContext = await browser.newContext({ ...iPhone11 });
    const motoContext = await browser.newContext({ ...motoG4 });
    const modPage = await iphoneContext.newPage();
    const multiusers = new MultiUsers(browser, iphoneContext);
    await multiusers.initModPage(modPage);
    await multiusers.initUserPage(true, motoContext);
    await multiusers.userlistNotAppearOnMobile();
  });

  test('Chat Panel should not appear when Userlist or Whiteboard are active on mobile devices', async ({ browser, context, page }) => {
    const iphoneContext = await browser.newContext({ ...iPhone11 });
    const motoContext = await browser.newContext({ ...motoG4 });
    const modPage = await iphoneContext.newPage();
    const multiusers = new MultiUsers(browser, iphoneContext);
    await multiusers.initModPage(modPage);
    await multiusers.initUserPage(true, motoContext);
    await multiusers.chatPanelNotAppearOnMobile();
  });
});
