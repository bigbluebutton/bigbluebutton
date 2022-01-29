const { test, devices } = require('@playwright/test');
const { Status } = require('./status');
const { MultiUsers } = require('./multiusers');
const { GuestPolicy } = require('./guestPolicy');
const { MobileDevices } = require('./mobileDevices');
const motoG4 = devices['Moto G4'];
const iPhone11 = devices['iPhone 11'];

test.describe.parallel('User', () => {
  test.describe.parallel('Actions', () => {
    test('Raise and lower Hand Toast', async ({ browser, context, page }) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initPages(page);
      await multiusers.raiseHandTest();
      await multiusers.getAvatarColorAndCompareWithUserListItem();
      await multiusers.lowerHandTest();
    });
  });

  test.describe.parallel('List', () => {
    test('Change user status', async ({ browser, page }) => {
      const status = new Status(browser, page);
      await status.init(true, true);
      await status.changeUserStatus();
    });

    test('User presence check (multiple users)', async ({ browser, context, page }) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initPages(page);
      await multiusers.userPresence();
    });
  });

  test.describe.parallel('Manage', () => {
    test.describe.parallel('Guest policy', () => {
      test('ASK_MODERATOR', async ({ browser, context, page }) => {
        const guestPolicy = new GuestPolicy(browser, context);
        await guestPolicy.initModPage(page);
        await guestPolicy.askModerator();
      });

      test('ALWAYS_ACCEPT', async ({ browser, context, page }) => {
        const guestPolicy = new GuestPolicy(browser, context);
        await guestPolicy.initModPage(page);
        await guestPolicy.alwaysAccept();
      });

      test('ALWAYS_DENY', async ({ browser, context, page }) => {
        const guestPolicy = new GuestPolicy(browser, context);
        await guestPolicy.initModPage(page);
        await guestPolicy.alwaysDeny();
      });
    });
  });

  test.describe.parallel('Mobile devices', () => {
    test('Mobile Tag Name For Mobile User', async ({ browser }) => {
      const context = await browser.newContext({ ...iPhone11 });
      const mobilePage = await context.newPage();
      const mobileDevices = new MobileDevices(browser, context);
      await mobileDevices.initModPage(mobilePage);
      await mobileDevices.mobileTagName();
    });

    test('Whiteboard should not be accessible when chat panel or userlist are active on mobile devices', async ({ browser }) => {
      test.fixme();
      const iphoneContext = await browser.newContext({ ...iPhone11 });
      const motoContext = await browser.newContext({ ...motoG4 });
      const modPage = await iphoneContext.newPage();
      const mobileDevices = new MobileDevices(browser, iphoneContext);
      await mobileDevices.initModPage(modPage);
      await mobileDevices.initUserPage(true, motoContext);
      await mobileDevices.whiteboardNotAppearOnMobile();
    });

    test('Userslist should not appear when Chat Panel or Whiteboard are active on mobile devices', async ({ browser }) => {
      const iphoneContext = await browser.newContext({ ...iPhone11 });
      const motoContext = await browser.newContext({ ...motoG4 });
      const modPage = await iphoneContext.newPage();
      const mobileDevices = new MobileDevices(browser, iphoneContext);
      await mobileDevices.initModPage(modPage);
      await mobileDevices.initUserPage(true, motoContext);
      await mobileDevices.userlistNotAppearOnMobile();
    });

    test('Chat Panel should not appear when Userlist or Whiteboard are active on mobile devices', async ({ browser }) => {
      const iphoneContext = await browser.newContext({ ...iPhone11 });
      const motoContext = await browser.newContext({ ...motoG4 });
      const modPage = await iphoneContext.newPage();
      const mobileDevices = new MobileDevices(browser, iphoneContext);
      await mobileDevices.initModPage(modPage);
      await mobileDevices.initUserPage(true, motoContext);
      await mobileDevices.chatPanelNotAppearOnMobile();
    });
  });
});
