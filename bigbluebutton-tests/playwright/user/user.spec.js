const { test, devices } = require('@playwright/test');
const { Status } = require('./status');
const { MultiUsers } = require('./multiusers');
const { GuestPolicy } = require('./guestPolicy');
const { LockViewers } = require('./lockViewers');
const { MobileDevices } = require('./mobileDevices');
const motoG4 = devices['Moto G4'];
const iPhone11 = devices['iPhone 11'];

test.describe.parallel('User', () => {
  test.describe.parallel('Actions', () => {
    // https://docs.bigbluebutton.org/2.5/release-tests.html#set-status--raise-hand-automated
    test('Raise and lower Hand Toast', async ({ browser, context, page }) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initPages(page, true);
      await multiusers.raiseAndLowerHand();
    });

    test('Toggle user list @ci', async ({ browser, context, page }) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page);
      await multiusers.toggleUserList();
    });
  });

  test.describe.parallel('List', () => {
    // https://docs.bigbluebutton.org/2.5/release-tests.html#set-status--raise-hand-automated
    test('Change user status @ci', async ({ browser, page }) => {
      const status = new Status(browser, page);
      await status.init(true, true);
      await status.changeUserStatus();
    });

    test('User presence check (multiple users)', async ({ browser, context, page }) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initPages(page);
      await multiusers.userPresence();
    });

    test('Make presenter @ci', async ({ browser, context, page }) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initPages(page);
      await multiusers.makePresenter();
    });

    test('Take presenter @ci', async ({ browser, context, page }) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page);
      await multiusers.initModPage2();
      await multiusers.takePresenter();
    });

    test('Promote to moderator @ci', async ({ browser, context, page }) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initPages(page);
      await multiusers.promoteToModerator();
    });

    test('Demote to viewer @ci', async ({ browser, context, page }) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page);
      await multiusers.initModPage2();
      await multiusers.demoteToViewer();
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

    test.describe.parallel('Lock viewers @ci', () => {
      test('Lock Share webcam', async ({ browser, context, page }) => {
        const lockViewers = new LockViewers(browser, context);
        await lockViewers.initPages(page);
        await lockViewers.initUserPage2();
        await lockViewers.lockShareWebcam();
      });

      test('Lock See other viewers webcams', async ({ browser, context, page }) => {
        const lockViewers = new LockViewers(browser, context);
        await lockViewers.initPages(page);
        await lockViewers.initUserPage2();
        await lockViewers.lockSeeOtherViewersWebcams();
      });

      test('Lock Share microphone', async ({ browser, context, page }) => {
        const lockViewers = new LockViewers(browser, context);
        await lockViewers.initPages(page);
        await lockViewers.initUserPage2();
        await lockViewers.lockShareMicrophone();
      });

      test('Lock Send public chat messages', async ({ browser, context, page }) => {
        const lockViewers = new LockViewers(browser, context);
        await lockViewers.initPages(page);
        await lockViewers.initUserPage2();
        await lockViewers.lockSendPublicChatMessages();
      });

      test('Lock Send private chat messages', async ({ browser, context, page }) => {
        const lockViewers = new LockViewers(browser, context);
        await lockViewers.initPages(page);
        await lockViewers.initUserPage2();
        await lockViewers.lockSendPrivateChatMessages();
      });

      test('Lock Edit Shared Notes', async ({ browser, context, page }) => {
        const lockViewers = new LockViewers(browser, context);
        await lockViewers.initPages(page);
        await lockViewers.lockEditSharedNotes();
      });

      test('Lock See other viewers in the Users list', async ({ browser, context, page }) => {
        const lockViewers = new LockViewers(browser, context);
        await lockViewers.initPages(page);
        await lockViewers.initUserPage2();
        await lockViewers.lockSeeOtherViewersUserList();
      });

      test('Unlock a user', async ({ browser, context, page }) => {
        const lockViewers = new LockViewers(browser, context);
        await lockViewers.initPages(page);
        await lockViewers.initUserPage2();
        await lockViewers.unlockUser();
      });
    });

    test('Save user names', async ({ browser, context, page }, testInfo) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initPages(page);
      await multiusers.saveUserNames(testInfo);
    });

    test('Select random user @ci', async ({ browser, context, page }) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page);
      await multiusers.selectRandomUser();
    });
  });

  test.describe.parallel('Mobile devices', () => {
    test.beforeEach(({ browserName }) => {
      test.skip(browserName === 'firefox', 'Mobile tests are not able in Firefox browser');
    });

    test('Mobile Tag Name For Mobile User @ci', async ({ browser }) => {
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
