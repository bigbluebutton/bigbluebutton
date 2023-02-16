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
    // https://docs.bigbluebutton.org/2.6/release-tests.html#set-status--raise-hand-automated
    test('Raise and lower Hand Toast', async ({ browser, context, page }) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page, true);
      await multiusers.raiseAndLowerHand();
    });

    test('Raise Hand Rejected', async ({ browser, context, page }) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page, true);
      await multiusers.raiseHandRejected();
    });

    test('Toggle user list @ci', async ({ browser, context, page }) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page);
      await multiusers.toggleUserList();
    });
  });

  test.describe.parallel('List', () => {
    // https://docs.bigbluebutton.org/2.6/release-tests.html#set-status--raise-hand-automated
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

    // https://docs.bigbluebutton.org/2.6/release-tests.html#make-viewer-a-presenter-automated
    test('Make presenter @ci', async ({ browser, context, page }) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initPages(page);
      await multiusers.makePresenter();
    });

    // https://docs.bigbluebutton.org/2.6/release-tests.html#taking-presenter-status-back-automated
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

    test('Give and remove whiteboard access', async ({ browser, context, page }) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page);
      await multiusers.initModPage2();
      await multiusers.giveAndRemoveWhiteboardAccess();
    });

    test('Remove user', async ({ browser, context, page }) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page, true);
      await multiusers.initModPage2(true);
      await multiusers.removeUser();
    });

    test('Remove user and prevent rejoining', async ({ browser, context, page }) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page, true);
      await multiusers.initModPage2(true, context, { customParameter: 'userID=Moderator2' });
      await multiusers.removeUserAndPreventRejoining(context);
    });
  });

  test.describe.parallel('Manage', () => {
    test.describe.parallel('Guest policy', () => {
      test.describe.parallel('ASK_MODERATOR', () => {
        // https://docs.bigbluebutton.org/2.6/release-tests.html#ask-moderator
        test('Message to guest lobby', async ({ browser, context, page }) => {
          const guestPolicy = new GuestPolicy(browser, context);
          await guestPolicy.initModPage(page);
          await guestPolicy.messageToGuestLobby();
        });
        test('Allow Everyone', async ({ browser, context, page }) => {
          const guestPolicy = new GuestPolicy(browser, context);
          await guestPolicy.initModPage(page);
          await guestPolicy.allowEveryone();
        });
        test('Deny Everyone', async ({ browser, context, page }) => {
          const guestPolicy = new GuestPolicy(browser, context);
          await guestPolicy.initModPage(page);
          await guestPolicy.denyEveryone();
        });

        test('Remember choice', async ({ browser, context, page }) => {
          const guestPolicy = new GuestPolicy(browser, context);
          await guestPolicy.initModPage(page);
          await guestPolicy.rememberChoice();
        });

        test.describe.parallel('Actions to specific pending user', () => {
          test('Message', async ({ browser, context, page }) => {
            const guestPolicy = new GuestPolicy(browser, context);
            await guestPolicy.initModPage(page);
            await guestPolicy.messageToSpecificUser();
          });

          test('Accept', async ({ browser, context, page }) => {
            const guestPolicy = new GuestPolicy(browser, context);
            await guestPolicy.initModPage(page);
            await guestPolicy.acceptSpecificUser();
          });

          test('Deny', async ({ browser, context, page }) => {
            const guestPolicy = new GuestPolicy(browser, context);
            await guestPolicy.initModPage(page);
            await guestPolicy.denySpecificUser();
          });
        });
      });

      test('ALWAYS_ACCEPT', async ({ browser, context, page }) => {
        const guestPolicy = new GuestPolicy(browser, context);
        await guestPolicy.initModPage(page);
        await guestPolicy.alwaysAccept();
      });
      // https://docs.bigbluebutton.org/2.6/release-tests.html#always-deny
      test('ALWAYS_DENY', async ({ browser, context, page }) => {
        const guestPolicy = new GuestPolicy(browser, context);
        await guestPolicy.initModPage(page);
        await guestPolicy.alwaysDeny();
      });
    });

    test.describe.parallel('Lock viewers @ci', () => {
      // https://docs.bigbluebutton.org/2.6/release-tests.html#webcam
      test('Lock Share webcam', async ({ browser, context, page }) => {
        const lockViewers = new LockViewers(browser, context);
        await lockViewers.initPages(page);
        await lockViewers.initUserPage2();
        await lockViewers.lockShareWebcam();
      });

      // https://docs.bigbluebutton.org/2.6/release-tests.html#see-other-viewers-webcams
      test('Lock See other viewers webcams', async ({ browser, context, page }) => {
        const lockViewers = new LockViewers(browser, context);
        await lockViewers.initPages(page);
        await lockViewers.initUserPage2();
        await lockViewers.lockSeeOtherViewersWebcams();
      });

      // https://docs.bigbluebutton.org/2.6/release-tests.html#microphone
      test('Lock Share microphone', async ({ browser, context, page }) => {
        const lockViewers = new LockViewers(browser, context);
        await lockViewers.initPages(page);
        await lockViewers.initUserPage2();
        await lockViewers.lockShareMicrophone();
      });

      // https://docs.bigbluebutton.org/2.6/release-tests.html#public-chat
      test('Lock Send public chat messages', async ({ browser, context, page }) => {
        const lockViewers = new LockViewers(browser, context);
        await lockViewers.initPages(page);
        await lockViewers.initUserPage2();
        await lockViewers.lockSendPublicChatMessages();
      });

      // https://docs.bigbluebutton.org/2.6/release-tests.html#private-chat
      test('Lock Send private chat messages', async ({ browser, context, page }) => {
        const lockViewers = new LockViewers(browser, context);
        await lockViewers.initPages(page);
        await lockViewers.initUserPage2();
        await lockViewers.lockSendPrivateChatMessages();
      });

      // https://docs.bigbluebutton.org/2.6/release-tests.html#shared-notes-1
      test('Lock Edit Shared Notes', async ({ browser, context, page }) => {
        const lockViewers = new LockViewers(browser, context);
        await lockViewers.initPages(page);
        await lockViewers.lockEditSharedNotes();
      });

      // https://docs.bigbluebutton.org/2.6/release-tests.html#see-other-viewers-in-the-users-list
      test('Lock See other viewers in the Users list', async ({ browser, context, page }) => {
        const lockViewers = new LockViewers(browser, context);
        await lockViewers.initPages(page);
        await lockViewers.initUserPage2();
        await lockViewers.lockSeeOtherViewersUserList();
      });

      // https://docs.bigbluebutton.org/2.6/release-tests.html#unlock-a-specific-user
      test('Unlock a user', async ({ browser, context, page }) => {
        const lockViewers = new LockViewers(browser, context);
        await lockViewers.initPages(page);
        await lockViewers.initUserPage2();
        await lockViewers.unlockUser();
      });
    });

    // https://docs.bigbluebutton.org/2.6/release-tests.html#saving-usernames
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

    test('Mute all users', async ({ browser, context, page }) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page, false);
      await multiusers.initModPage2(false);
      await multiusers.initUserPage(false);
      await multiusers.muteAllUsers();
    });

    test('Mute all users except presenter', async ({ browser, context, page }) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page, false);
      await multiusers.initModPage2(false);
      await multiusers.initUserPage(false);
      await multiusers.muteAllUsersExceptPresenter();
    });

    test('Write closed captions', async ({ browser, context, page }) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page, true);
      await multiusers.initModPage2(true);
      await multiusers.writeClosedCaptions();
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

    test('Whiteboard should not be accessible when chat panel or user list are active on mobile devices', async ({ browser }) => {
      test.fixme();
      const iphoneContext = await browser.newContext({ ...iPhone11 });
      const motoContext = await browser.newContext({ ...motoG4 });
      const modPage = await iphoneContext.newPage();
      const mobileDevices = new MobileDevices(browser, iphoneContext);
      await mobileDevices.initModPage(modPage);
      await mobileDevices.initUserPage(true, motoContext);
      await mobileDevices.whiteboardNotAppearOnMobile();
    });

    test('User List should not appear when Chat Panel or Whiteboard are active on mobile devices', async ({ browser }) => {
      const iphoneContext = await browser.newContext({ ...iPhone11 });
      const motoContext = await browser.newContext({ ...motoG4 });
      const modPage = await iphoneContext.newPage();
      const mobileDevices = new MobileDevices(browser, iphoneContext);
      await mobileDevices.initModPage(modPage);
      await mobileDevices.initUserPage(true, motoContext);
      await mobileDevices.userListNotAppearOnMobile();
    });

    test('Chat Panel should not appear when UserList or Whiteboard are active on mobile devices', async ({ browser }) => {
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
