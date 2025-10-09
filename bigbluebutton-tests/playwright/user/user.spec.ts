import { devices } from '@playwright/test';

import { test } from '../core/setup/fixtures';
import { GuestPolicy } from './guestPolicy';
import { LockViewers } from './lockViewers';
import { MobileDevices } from './mobileDevices';
import { MultiUsers } from './multiusers';
import { Timer } from './timer';

const iPhone11 = devices['iPhone 11'];

test.describe.parallel('User', { tag: '@ci' }, () => {
  test.describe.parallel('Actions', () => {
    // https://docs.bigbluebutton.org/3.0/testing/release-testing/#set-status--raise-hand-automated
    test('Raise and lower Hand', async ({ browser, context, page }, testInfo) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page, { testInfo });
      await multiusers.raiseAndLowerHand();
    });

    test('Raise Hand Rejected', async ({ browser, context, page }, testInfo) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page, { testInfo });
      await multiusers.raiseHandRejected();
    });

    test('Toggle user list', async ({ browser, context, page }, testInfo) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page, { testInfo });
      await multiusers.toggleUserList();
    });

    test('Stopwatch', async ({ browser, context, page }, testInfo) => {
      const timer = new Timer(browser, context);
      await timer.initModPage(page, { testInfo });
      await timer.stopwatchTest();
    });

    test('Timer', async ({ browser, context, page }, testInfo) => {
      const timer = new Timer(browser, context);
      await timer.initModPage(page, { testInfo });
      await timer.timerTest();
    });

    test('Leave Meeting', async ({ browser, context, page }, testInfo) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page, { testInfo });
      await multiusers.initUserPage(context, { testInfo });
      await multiusers.initUserPage2(context, { testInfo });
      await multiusers.leaveMeeting();
    });
  });

  test.describe.parallel('Reactions', () => {
    test('Use reactions', async ({ browser, context, page }, testInfo) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page, { testInfo });
      await multiusers.initUserPage(context, { testInfo });
      await multiusers.reactionsTest();
    });

    test('Emoji rain', async ({ browser, context, page }, testInfo) => {
      const emojiRain = new MultiUsers(browser, context);
      await emojiRain.initModPage(page, { testInfo });
      await emojiRain.emojiRainTest();
    });
  });

  test.describe.parallel('List', () => {
    test('User presence check (multiple users)', async ({ browser, context, page }, testInfo) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initPages(page, testInfo);
      await multiusers.userPresence();
    });

    // https://docs.bigbluebutton.org/3.0/testing/release-testing/#make-viewer-a-presenter-automated
    test('Make presenter', async ({ browser, context, page }, testInfo) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initPages(page, testInfo);
      await multiusers.makePresenter();
    });

    // https://docs.bigbluebutton.org/3.0/testing/release-testing/#taking-presenter-status-back-automated
    test('Take presenter', async ({ browser, context, page }, testInfo) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page, { testInfo });
      await multiusers.initModPage2(context, { testInfo });
      await multiusers.takePresenter();
    });

    test('Promote to moderator', async ({ browser, context, page }, testInfo) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initPages(page, testInfo);
      await multiusers.promoteToModerator();
    });

    test('Demote to viewer', async ({ browser, context, page }, testInfo) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page, { testInfo });
      await multiusers.initModPage2(context, { testInfo });
      await multiusers.demoteToViewer();
    });

    test('Give and remove whiteboard access', async ({ browser, context, page }, testInfo) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initPages(page, testInfo);
      await multiusers.giveAndRemoveWhiteboardAccess();
    });

    test('Remove user', async ({ browser, context, page }, testInfo) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page, { testInfo });
      await multiusers.initModPage2(context, { testInfo });
      await multiusers.removeUser();
    });

    test('Remove user and prevent rejoining', async ({ browser, context, page }, testInfo) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page, { testInfo });
      await multiusers.initModPage2(context, { joinParameter: 'userID=Moderator2', testInfo });
      await multiusers.removeUserAndPreventRejoining();
    });
  });

  test.describe.parallel('Manage', () => {
    test.describe.parallel('Guest policy', () => {
      test.describe.parallel('ASK_MODERATOR', () => {
        // https://docs.bigbluebutton.org/3.0/testing/release-testing/#ask-moderator
        test('Message to guest lobby', async ({ browser, context, page }, testInfo) => {
          const guestPolicy = new GuestPolicy(browser, context);
          await guestPolicy.initModPage(page, { testInfo });
          await guestPolicy.messageToGuestLobby();
        });
        test('Allow Everyone', async ({ browser, context, page }, testInfo) => {
          const guestPolicy = new GuestPolicy(browser, context);
          await guestPolicy.initModPage(page, { testInfo });
          await guestPolicy.allowEveryone();
        });
        test('Deny Everyone', async ({ browser, context, page }, testInfo) => {
          const guestPolicy = new GuestPolicy(browser, context);
          await guestPolicy.initModPage(page, { testInfo });
          await guestPolicy.denyEveryone();
        });

        test('Remember choice', async ({ browser, context, page }, testInfo) => {
          const guestPolicy = new GuestPolicy(browser, context);
          await guestPolicy.initModPage(page, { testInfo });
          await guestPolicy.rememberChoice();
        });

        test.describe.parallel('Actions to specific pending user', () => {
          test('Message', async ({ browser, context, page }, testInfo) => {
            const guestPolicy = new GuestPolicy(browser, context);
            await guestPolicy.initModPage(page, { testInfo });
            await guestPolicy.messageToSpecificUser();
          });

          test('Accept', async ({ browser, context, page }, testInfo) => {
            const guestPolicy = new GuestPolicy(browser, context);
            await guestPolicy.initModPage(page, { testInfo });
            await guestPolicy.acceptSpecificUser();
          });

          test('Deny', async ({ browser, context, page }, testInfo) => {
            const guestPolicy = new GuestPolicy(browser, context);
            await guestPolicy.initModPage(page, { testInfo });
            await guestPolicy.denySpecificUser();
          });
        });
      });

      test('ALWAYS_ACCEPT', async ({ browser, context, page }, testInfo) => {
        const guestPolicy = new GuestPolicy(browser, context);
        await guestPolicy.initModPage(page, { testInfo });
        await guestPolicy.alwaysAccept();
      });
      // https://docs.bigbluebutton.org/3.0/testing/release-testing/#always-deny
      test('ALWAYS_DENY', async ({ browser, context, page }, testInfo) => {
        const guestPolicy = new GuestPolicy(browser, context);
        await guestPolicy.initModPage(page, { testInfo });
        await guestPolicy.alwaysDeny();
      });
    });

    test.describe.parallel('Lock viewers', () => {
      // https://docs.bigbluebutton.org/3.0/testing/release-testing/#webcam
      test('Lock Share webcam', async ({ browser, context, page }, testInfo) => {
        const lockViewers = new LockViewers(browser, context);
        await lockViewers.initPages(page, testInfo);
        await lockViewers.lockShareWebcam();
      });

      // https://docs.bigbluebutton.org/3.0/testing/release-testing/#see-other-viewers-webcams
      test('Lock See other viewers webcams', async ({ browser, context, page }, testInfo) => {
        const lockViewers = new LockViewers(browser, context);
        await lockViewers.initPages(page, testInfo);
        await lockViewers.lockSeeOtherViewersWebcams();
      });

      // https://docs.bigbluebutton.org/3.0/testing/release-testing/#microphone
      test('Lock Share microphone', async ({ browser, context, page, browserName }, testInfo) => {
        test.skip(browserName === 'firefox', 'It only workss in manual testing');
        const lockViewers = new LockViewers(browser, context);
        await lockViewers.initPages(page, testInfo);
        await lockViewers.lockShareMicrophone();
      });

      // https://docs.bigbluebutton.org/3.0/testing/release-testing/#public-chat
      test('Lock Send public chat messages', async ({ browser, context, page }, testInfo) => {
        const lockViewers = new LockViewers(browser, context);
        await lockViewers.initPages(page, testInfo);
        await lockViewers.lockSendPublicChatMessages();
      });

      // https://docs.bigbluebutton.org/3.0/testing/release-testing/#private-chat
      test('Lock Send private chat messages', async ({ browser, context, page }, testInfo) => {
        const lockViewers = new LockViewers(browser, context);
        await lockViewers.initPages(page, testInfo);
        await lockViewers.lockSendPrivateChatMessages();
      });

      // https://docs.bigbluebutton.org/3.0/testing/release-testing/#shared-notes-1
      test('Lock Edit Shared Notes', async ({ browser, context, page }, testInfo) => {
        const lockViewers = new LockViewers(browser, context);
        await lockViewers.initPages(page, testInfo);
        await lockViewers.lockEditSharedNotes();
      });

      // https://docs.bigbluebutton.org/3.0/testing/release-testing/#see-other-viewers-in-the-users-list
      test('Lock See other viewers in the Users list', async ({ browser, context, page }, testInfo) => {
        const lockViewers = new LockViewers(browser, context);
        await lockViewers.initPages(page, testInfo);
        await lockViewers.lockSeeOtherViewersUserList();
      });

      test('Lock see other viewers annotations', async ({ browser, context, page }, testInfo) => {
        const lockViewers = new LockViewers(browser, context);
        await lockViewers.initPages(page, testInfo);
        await lockViewers.lockSeeOtherViewersAnnotations();
      });

      test('Lock see other viewers cursor', async ({ browser, context, page, browserName }, testInfo) => {
        test.skip(browserName === 'firefox', 'The test is inconsistent on Firefox, due to the heavy browser.');
        const lockViewers = new LockViewers(browser, context);
        await lockViewers.initPages(page, testInfo);
        await lockViewers.lockSeeOtherViewersCursor();
      });
    });

    // https://docs.bigbluebutton.org/3.0/testing/release-testing/#saving-usernames
    test('Save user names', async ({ browser, context, page }, testInfo) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initPages(page, testInfo);
      await multiusers.saveUserNames();
    });

    test('Disable users join muted', async ({ browser, context, page }, testInfo) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page, { testInfo });
      await multiusers.disabledUsersJoinMuted();
    });

    test('Mute all users except presenter', async ({ browser, context, page }, testInfo) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page, { shouldCloseAudioModal: false, testInfo });
      await multiusers.initModPage2(context, { shouldCloseAudioModal: false, testInfo });
      await multiusers.initUserPage(context, { shouldCloseAudioModal: false, testInfo });
      await multiusers.muteAllUsersExceptPresenter();
    });

    test('Clear all status icon', async ({ browser, context, page }, testInfo) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page, { testInfo });
      await multiusers.initModPage2(context, { testInfo });
      await multiusers.clearAllStatusIcon();
    });

    test('End meeting', async ({ browser, context, page }, testInfo) => {
      const multiusers = new MultiUsers(browser, context);
      await multiusers.initModPage(page, { testInfo });
      await multiusers.initUserPage(context, { testInfo });
      await multiusers.endMeeting();
    });
  });

  test.describe.parallel('Mobile devices', () => {
    test.beforeEach(({ browserName }) => {
      test.skip(browserName === 'firefox', 'Mobile tests are not able in Firefox browser');
    });

    test('Mobile Tag Name For Mobile User', async ({ browser }, testInfo) => {
      const context = await browser.newContext({ ...iPhone11 });
      const mobilePage = await context.newPage();
      const mobileDevices = new MobileDevices(browser, context);
      await mobileDevices.initModPage(mobilePage, { testInfo });
      await mobileDevices.mobileTagName();
    });
  });
});
