import { expect } from '@playwright/test';

import { hoverLastMessage } from '../chat/util';
import { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME, UPLOAD_PDF_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { enableUserJoinPopup, enableUserLeavePopup, saveSettings } from '../notifications/util';
import { openSettings } from '../options/util';
import { getNotesLocator } from '../sharednotes/etherpad/util';
import { MultiUsers } from './multiusers';
import { drawArrow, openLockViewers } from './util';

export class LockViewers extends MultiUsers {
  async lockShareWebcam() {
    await this.modPage.shareWebcam();
    await this.modPage.hasElement(e.webcamVideoItem, 'should display the webcam video item for the moderator');
    await this.userPage.hasElement(e.webcamVideoItem, 'should display the webcam video item for the attendee');
    await this.userPage.shareWebcam();

    await this.modPage.hasNElements(e.webcamVideoItem, 2, 'should display two webcam video item for the moderator');
    await this.userPage.hasNElements(e.webcamVideoItem, 2, 'should display two webcam video item for the attendee');
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockShareWebcam);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.modPage.closeAllToastNotifications();
    await this.userPage.hasElementCount(e.webcamContainer, 1, 'should display one webcam container for the attendee');

    await this.initUserPage2();
    await this.userPage2.hasElementDisabled(
      e.joinVideo,
      'should the join video button to be disabled for the second attendee',
    );
    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    await this.userPage2.waitAndClick(e.joinVideo);
    await this.userPage2.waitAndClick(e.startSharingWebcam);
    await this.modPage.hasElementCount(e.webcamContainer, 1, 'should display 1 webcams container for the moderator');
    await this.userPage.hasElementDisabled(e.joinVideo, 'should the join video button to be disabled');
  }

  async lockSeeOtherViewersWebcams() {
    await this.modPage.shareWebcam();
    await this.userPage.shareWebcam();
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockSeeOtherViewersWebcam);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.modPage.page.waitForTimeout(500);
    const videoContainersCount = [
      await this.modPage.getSelectorCount(e.webcamVideoItem),
      await this.userPage.getSelectorCount(e.webcamVideoItem),
    ];
    expect(
      videoContainersCount,
      'should the video containers count be strictly equal to 2 for the moderator and the attendee',
    ).toStrictEqual([2, 2]);

    await this.initUserPage2();

    await this.userPage2.shareWebcam();

    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);

    await this.modPage.hasElementCount(e.webcamContainer, 2, 'should display 2 webcams container for the moderator');
    await this.userPage.hasElementCount(
      e.webcamContainer,
      1,
      'should display 1 webcams container for the first attendee',
    );
    await this.userPage2.hasElementCount(
      e.webcamContainer,
      2,
      'should display 2 webcam container for the second attendee',
    );
  }

  async lockShareMicrophone() {
    await this.userPage.waitAndClick(e.joinAudio);
    await this.userPage.joinMicrophone();
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockShareMicrophone);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.userPage.wasRemoved(e.isTalking, 'should not display the is talking element for the first attendee');
    await this.userPage.waitForSelector(e.unmuteMicButton);
    // join second user
    await this.initUserPage2(this.modPage.context, { shouldCloseAudioModal: false });
    await this.userPage2.hasElement(
      e.audioDropdownMenu,
      'should display the audio dropdown menu button for the second attendee when joined, indicating audio connected',
    );
    // check if second user is locked after joining
    const unmuteMicButtonUser2 = this.userPage2.page.locator(e.unmuteMicButton);
    await this.userPage2.hasElement(
      e.unmuteMicButton,
      'should display the unmute button for the second attendee when joined, indicating audio connected',
    );
    await expect(
      unmuteMicButtonUser2,
      'should display the unmute button disabled as the user is locked',
    ).toBeDisabled();
    // unlock second user
    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    // check second user audio after unlocking
    await this.userPage2.waitAndClick(e.audioDropdownMenu);
    await this.userPage2.waitAndClick(e.leaveAudio);
    await this.userPage2.waitAndClick(e.joinAudio);
    await this.userPage2.joinMicrophone({ shouldUnmute: false });
    await expect(unmuteMicButtonUser2, 'should the unmute button be enabled as the user is unlocked').toBeEnabled();
    await this.userPage2.waitAndClick(e.unmuteMicButton);
    await this.userPage2.hasElement(
      e.stopHearingButton,
      'should display the stop hearing button of the echo test when clicking to unmute button',
    );
    // select the default microphone to enable voice activity detection - not listen only mode
    await this.userPage2.page.locator(e.selectMicrophoneButton).selectOption('default');
    await this.userPage2.waitAndClick(e.joinEchoTestButton);
    await this.userPage2.hasElement(e.muteMicButton, 'should connect with the mic unmuted');
    await this.userPage2.hasElement(e.isTalking, 'should display the is talking element for the second attendee');
  }

  async lockSendPublicChatMessages() {
    // mod send a message
    await this.modPage.fill(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasElement(
      e.chatUserMessageText,
      'should display the chat message text on the public chat for the moderator',
    );
    await this.userPage.hasElement(
      e.chatUserMessageText,
      'should display the chat message text on the public chat for the attendee',
    );
    // lock the public chat
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockPublicChat);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.userPage.hasElementDisabled(e.chatBox, 'should have the public chat disabled for the first attendee');
    await this.userPage.hasElementDisabled(
      e.sendButton,
      'should have the send button on the public chat disabled for the first attendee',
    );
    await hoverLastMessage(this.userPage);
    await this.userPage.wasRemoved(
      e.messageToolbar,
      'should not display the chat message toolbar when locked viewer is hovering a message',
    );
    // join second user and send message
    await this.initUserPage2();
    await this.userPage2.hasElementDisabled(e.chatBox, 'should have the public chat disabled for the second attendee');
    await this.userPage2.hasElementDisabled(
      e.sendButton,
      'should have the send button on the public chat disabled for the second attendee',
    );
    await this.modPage.fill(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    // unlock user2
    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    // check enabled elements and send new message
    await this.userPage2.hasElementEnabled(
      e.chatBox,
      'should have the public chat enabled for the second attendee',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.userPage2.fill(e.chatBox, e.message);
    await this.modPage.hasElement(e.typingIndicator, 'should display the typing indicator element for the moderator');
    await this.userPage2.waitAndClick(e.sendButton);
    await this.userPage2.hasElementCount(
      e.chatUserMessageText,
      3,
      'should display three chat messages on the public chat for the second attendee',
    );
    const lastMessageSentUser2Locator = this.userPage2.page.locator(e.chatMessageItem).last();
    await lastMessageSentUser2Locator.locator(e.chatUserMessageText).hover();
    await expect(
      lastMessageSentUser2Locator.locator(e.messageToolbar),
      'should display the chat message toolbar when the unlocked viewer is hovering a message',
    ).toBeVisible();
    await this.userPage.hasElementCount(
      e.chatUserMessageText,
      3,
      'should display all messages on the public chat for the first attendee',
    );
  }

  async lockSendPrivateChatMessages() {
    // user start private chat with mod and send a message
    const lastUserItemLocator = this.userPage.getLocatorByIndex(e.userListItem, -1);
    await lastUserItemLocator.click();
    const startPrivateChatButton = this.userPage.getLocatorByIndex(e.startPrivateChat, -1);
    await startPrivateChatButton.click();
    // mod lock the private chat
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockPrivateChat);
    await this.modPage.waitAndClick(e.applyLockSettings);
    // join second user
    await this.initUserPage2();
    await this.modPage.page.locator(e.userListItem).filter({ hasNotText: this.userPage2.username }).click();
    await this.modPage.waitAndClick(e.unlockUserButton);
    await this.userPage.page.locator(e.userListItem).filter({ hasText: this.userPage2.username }).click();
    await this.userPage.waitAndClick(`${e.startPrivateChat} >> visible=true`);
    await this.userPage.hasElementEnabled(e.chatBox, 'should have the private chat enabled for the first attendee');
    await this.userPage.hasElementEnabled(
      e.sendButton,
      'should have the send button on the private chat enabled for the first attendee',
    );
    await this.userPage.fill(e.chatBox, 'Test');
    await this.userPage.waitAndClick(e.sendButton);
    // check message sent and toolbar
    await this.userPage.hasElement(
      e.chatUserMessageText,
      'should display the chat message text on the private chat for the first attendee',
    );
    const privateChatMessaSentUser = this.userPage.page.locator(e.chatMessageItem).last();
    await privateChatMessaSentUser.locator(e.chatUserMessageText).hover();
    await expect(
      privateChatMessaSentUser.locator(e.messageToolbar),
      'should display the chat message toolbar when hovering the message',
    ).toBeVisible();
    // check if the private chat is locked for the second attendee
    await this.userPage2.page.locator(e.chatButton).filter({ hasText: this.userPage.username }).click();
    await this.userPage2.waitForSelector(e.closePrivateChat);
    await this.userPage2.hasElementDisabled(e.chatBox, 'should have the private chat disabled for the second attendee');
    await this.userPage2.hasElementDisabled(
      e.sendButton,
      'should have the send button on the private chat disabled for the second attendee',
    );
    const privateChatMessaSentUser2 = this.userPage2.page.locator(e.chatMessageItem).last();
    await privateChatMessaSentUser2.locator(e.chatUserMessageText).hover();
    await expect(
      privateChatMessaSentUser2.locator(e.messageToolbar),
      'should not display the chat message toolbar when locked user is hovering the message',
    ).not.toBeVisible();
  }

  async lockEditSharedNotes() {
    await this.userPage.waitAndClick(e.sharedNotes);
    await this.userPage.waitForSelector(e.hideNotesLabel);
    const sharedNotesLocator = getNotesLocator(this.userPage);
    await sharedNotesLocator.pressSequentially(e.message, { timeout: ELEMENT_WAIT_LONGER_TIME });
    await expect(
      sharedNotesLocator,
      'should the shared notes contain the text "Hello World!" for the first attendee',
    ).toContainText(e.message, { timeout: ELEMENT_WAIT_TIME });

    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockEditSharedNotes);
    await this.modPage.waitAndClick(e.applyLockSettings);

    await this.initUserPage2();
    await this.userPage2.waitAndClick(e.sharedNotes);
    await this.userPage2.wasRemoved(e.etherpadFrame, 'should not display the etherpad frame for the second attendee');

    await this.userPage.waitAndClick(e.sharedNotes);
    await this.userPage.wasRemoved(e.etherpadFrame, 'should not display the etherpad frame for the first attendee');

    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
  }

  async lockSeeOtherViewersUserList() {
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockUserList);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.initUserPage2();
    await this.userPage2.hasElementCount(
      e.userListItem,
      1,
      'should contain one user on the user list for the second attendee',
    );
    await this.modPage.page.waitForTimeout(1000);
    await this.userPage.hasElementCount(
      e.userListItem,
      1,
      'should contain one user on the user list for the first attendee',
    );

    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    await this.userPage2.hasElementCount(
      e.userListItem,
      2,
      'should contain two users on the user list for the second attendee',
    );
  }

  async lockSeeOtherViewersAnnotations() {
    // wait for whiteboard to load and no notifications
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);
    await this.modPage.waitForSelector(e.skipSlide);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(
      e.smallToastMsg,
      'should not display any toast notification for the moderator after closing all',
    );
    // turn on multi users whiteboard
    await this.modPage.waitAndClick(e.multiUsersWhiteboardOn);
    // timeout to ensure that the userPage presentation is zoomed in stabilized
    await this.modPage.page.waitForTimeout(1000);
    await drawArrow(this.userPage);
    const screenshotOptions = {
      maxDiffPixels: 500,
    };
    // lock the viewers annotations
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.hideViewersAnnotation);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.modPage.page.waitForTimeout(1000); // timeout to ensure the lock settings are applied
    // check if previous annotations is displayed for the viewer joining after the lock
    await this.initUserPage2();
    // wait for whiteboard to load and no notifications
    await this.userPage2.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage2.closeAllToastNotifications();
    await this.userPage2.wasRemoved(
      e.smallToastMsg,
      'should not display any toast notification for the second attendee after closing all',
    );
    const user2WbLocator = this.userPage2.page.locator(e.whiteboard);
    await this.userPage2.hasElement(e.whiteboard, 'should display the whiteboard for the second attendee');
    await this.modPage.page.waitForTimeout(1000); // timeout to ensure the user2 presentation is zoomed correctly
    await this.userPage2.wasRemoved(
      e.wbDrawnArrow,
      'should not display the other viewer annotation for the viewer who just joined',
    );
    await this.modPage.page.locator(e.chatButton).hover();
    await this.userPage.page.locator(e.chatButton).hover(); // ensure userPage cursor won't be visible on the screenshot
    await this.modPage.page.waitForTimeout(1000); // expected timeout for cursor indicator to disappear
    await expect(
      user2WbLocator,
      'should not display the other viewer annotation for the viewer who just joined',
    ).toHaveScreenshot('viewer2-just-joined.png', screenshotOptions);
    // draw a rectangle and check if it is displayed
    await this.userPage.waitAndClick(e.wbShapesButton);
    await this.userPage.waitAndClick(e.wbRectangleShape);
    await this.userPage.waitAndClick(e.whiteboard);
    await this.modPage.page.locator(e.chatButton).hover();
    await this.userPage.page.locator(e.chatButton).hover(); // ensure userPage cursor won't be visible on the screenshot
    await this.userPage2.wasRemoved(e.wbDrawnShape, 'should not display the new annotation for the other viewer');
    await this.modPage.page.waitForTimeout(1000); // expected timeout for cursor indicator to disappear
    await expect(user2WbLocator, 'should not display the new annotation for the other viewer').toHaveScreenshot(
      'viewer2-no-rectangle.png',
      screenshotOptions,
    );
    // unlock user2
    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    // check if previous annotations is displayed after unlocking user
    await this.userPage2.hasElement(e.wbDrawnArrow, 'should display the arrow drawn before user join');
    await this.userPage2.hasElement(e.wbDrawnShape, 'should display the rectangle drawn before unlocking user');
    await this.modPage.page.locator(e.chatButton).hover();
    // ensure userPage cursor won't be visible on the screenshot
    await this.userPage2.page.locator(e.chatButton).hover();
    await this.modPage.page.waitForTimeout(1000); // expected timeout for cursor indicator to disappear
    await expect(
      user2WbLocator,
      'should display the other viewer annotations when unlocking specific user',
    ).toHaveScreenshot('viewer2-previous-shapes.png', screenshotOptions);
    // check if new annotations is displayed after unlocking user
    await drawArrow(this.userPage);
    await this.modPage.page.locator(e.chatButton).hover();
    await this.userPage.page.locator(e.chatButton).hover(); // ensure userPage cursor will be visible on the screenshot
    await this.userPage2.hasElementCount(e.wbDrawnArrow, 2, 'should display all arrows drawn for unlocked user');
    await this.modPage.page.waitForTimeout(1000); // expected timeout for cursor indicator to disappear
    await expect(user2WbLocator, 'should display all arrows drawn for unlocked user').toHaveScreenshot(
      'viewer2-new-arrow.png',
      screenshotOptions,
    );
  }

  async lockSeeOtherViewersCursor() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.multiUsersWhiteboardOn);
    // user draw an arrow
    await this.userPage.waitForSelector(e.whiteboard);
    await drawArrow(this.userPage);
    // lock the viewers cursor
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.hideViewersCursor);
    await this.modPage.waitAndClick(e.applyLockSettings);
    // check if the cursor is not displayed for the viewer
    await this.modPage.hasElementCount(
      e.whiteboardCursorIndicator,
      1,
      'should contain one whiteboard cursor indicator for the moderator',
    );
    // join the second user and check if joined locked
    await this.initUserPage2();
    await this.userPage2.hasElementCount(
      e.whiteboardCursorIndicator,
      0,
      'should contain no whiteboard cursor indicator for the second attendee when joining a meeting with the setting locked',
    );
    // Unlock user2
    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    await this.modPage.page.waitForTimeout(1000); // ensure the unlock settings are applied

    // hover modPage cursor on the whiteboard to ensure a new location
    await this.modPage.page.locator(e.whiteboard).hover();
    // ensure modPage cursor WILL NOT be visible on the screenshot
    await this.modPage.page.locator(e.chatButton).hover();
    // ensure userPage cursor WILL be visible on the screenshot
    await this.userPage.page.locator(e.whiteboard).hover();

    await this.userPage.waitAndClick(e.whiteboard);
    await this.userPage2.hasElementCount(
      e.whiteboardCursorIndicator,
      1,
      'should be displayed the other viewer whiteboard cursor indicator when unlocking user is unlocked',
    );
  }

  /**
   * Regression test for issue #24888:
   * When hideUserList (lockUserList) is active, a locked viewer must NOT receive
   * join notifications for other users — those names were leaking via the
   * notification stream even though the user list was hidden.
   *
   * Fix (PR #24924): when hideUserList=true the backend sends per-user
   * NotifyUserInMeetingEvtMsg only to moderators and unlocked viewers, instead of
   * broadcasting NotifyAllInMeetingEvtMsg to everyone.
   *
   * Flow that reproduces the original bug:
   *   1. Mod joins.
   *   2. Mod enables lockUserList (hideUserList=true, lockOnJoin=true).
   *   3. Viewer1 joins → automatically locked (lockOnJoin=true).
   *   4. Both mod and Viewer1 enable "user join" push alerts.
   *   5. Viewer2 joins.
   *   Expected: Viewer1 sees NO toast; Mod DOES see the toast.
   */
  async hideUserListSuppressesJoinNotification() {
    // Step 2: apply hideUserList lock BEFORE the viewer joins so that the
    // viewer gets locked=true via lockOnJoin.
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockUserList);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.modPage.closeAllToastNotifications();

    // Step 3: Viewer1 joins after lock is active → locked=true.
    await this.initUserPage();

    // Step 4: both pages enable join push alerts.
    await openSettings(this.modPage);
    await enableUserJoinPopup(this.modPage);
    await saveSettings(this.modPage);

    await openSettings(this.userPage);
    await enableUserJoinPopup(this.userPage);
    await saveSettings(this.userPage);

    // Clear any notifications that appeared during setup.
    await this.modPage.closeAllToastNotifications();
    await this.userPage.closeAllToastNotifications();

    // Step 5: Viewer2 joins.
    await this.initUserPage2();

    // Wait until Viewer2 is confirmed as present in the mod's user list before
    // asserting the absence of a notification on Viewer1's page.
    await expect(
      this.modPage.page.locator(e.userListItem, { hasText: this.userPage2.username }),
      'Viewer2 should appear in the moderator user list after joining',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });

    // Locked viewer must NOT receive the join notification (regression for #24888).
    await this.userPage.wasRemoved(
      e.smallToastMsg,
      'Locked viewer must not receive a join notification when hideUserList is active',
      ELEMENT_WAIT_TIME,
    );

    // Moderator MUST still receive the join notification (per-user route after fix).
    await this.modPage.hasText(
      e.smallToastMsg,
      `${this.userPage2.username} joined the session`,
      'Moderator must still receive the join notification when hideUserList is active',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  /**
   * Regression test for issue #24888 — leave notification variant.
   * Same root cause: the leave notification also used NotifyAllInMeetingEvtMsg,
   * leaking the departing user's name to locked viewers.
   *
   * Flow:
   *   1. Mod joins.
   *   2. Mod enables lockUserList.
   *   3. Viewer1 joins (locked).
   *   4. Viewer2 joins (locked).
   *   5. Both mod and Viewer1 enable "user leave" push alerts.
   *   6. Viewer2 leaves.
   *   Expected: Viewer1 sees NO toast; Mod DOES see the toast.
   */
  async hideUserListSuppressesLeaveNotification() {
    // Step 2: enable hideUserList before viewers join.
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockUserList);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.modPage.closeAllToastNotifications();

    // Steps 3 & 4: both viewers join while lockOnJoin=true → locked=true.
    await this.initUserPage();
    await this.initUserPage2();

    // Wait for Viewer2 to fully join before setting up notifications.
    await expect(
      this.modPage.page.locator(e.userListItem, { hasText: this.userPage2.username }),
      'Viewer2 should appear in the moderator user list',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });

    // Step 5: enable leave push alerts on mod and Viewer1.
    await openSettings(this.modPage);
    await enableUserLeavePopup(this.modPage);
    await saveSettings(this.modPage);

    await openSettings(this.userPage);
    await enableUserLeavePopup(this.userPage);
    await saveSettings(this.userPage);

    // Clear any notifications accumulated during setup.
    await this.modPage.closeAllToastNotifications();
    await this.userPage.closeAllToastNotifications();

    // Step 6: Viewer2 leaves the meeting.
    const leavingUsername = this.userPage2.username;
    await this.userPage2.waitAndClick(e.leaveMeetingDropdown, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage2.waitAndClick(e.directLogoutButton, ELEMENT_WAIT_LONGER_TIME);

    // Moderator MUST receive the notification. The leave notification is deferred:
    // the backend sets a userLeftFlag on V2, then after a 10s expiry the periodic
    // audit removes the user and sends the notification (monitor ticks every 10s),
    // so the toast can take up to ~20s to arrive — use a 30s timeout.
    await this.modPage.hasText(
      e.smallToastMsg,
      `${leavingUsername} left the session`,
      'Moderator must still receive the leave notification when hideUserList is active',
      UPLOAD_PDF_WAIT_TIME,
    );

    // Locked viewer must NOT have received any notification (regression for #24888).
    await this.userPage.wasRemoved(
      e.smallToastMsg,
      'Locked viewer must not receive a leave notification when hideUserList is active',
      ELEMENT_WAIT_TIME,
    );
  }

  /**
   * Regression test for issue #24888, including the unlocked-viewer route.
   *
   * Expected behavior when hideUserList is active:
   * - locked viewer: no join notification
   * - unlocked viewer: receives join notification
   * - moderator: receives join notification
   */
  async hideUserListJoinNotificationVisibleForUnlockedAndModOnly() {
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockUserList);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.modPage.closeAllToastNotifications();

    // Viewer1 joins locked.
    await this.initUserPage();
    // Viewer2 joins locked, then is explicitly unlocked.
    await this.initUserPage2();

    const unlockedViewerName = this.userPage2.username;
    await this.modPage.page.locator(e.userListItem).filter({ hasText: unlockedViewerName }).click();
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    const unlockedViewer = this.userPage2;

    await openSettings(this.modPage);
    await enableUserJoinPopup(this.modPage);
    await saveSettings(this.modPage);

    await openSettings(this.userPage);
    await enableUserJoinPopup(this.userPage);
    await saveSettings(this.userPage);

    await openSettings(unlockedViewer);
    await enableUserJoinPopup(unlockedViewer);
    await saveSettings(unlockedViewer);

    await this.modPage.closeAllToastNotifications();
    await this.userPage.closeAllToastNotifications();
    await unlockedViewer.closeAllToastNotifications();

    // Viewer3 joins after subscriptions are active.
    await this.initUserPage2(undefined, { fullName: 'Attendee3' });
    const viewer3 = this.userPage2;

    await expect(
      this.modPage.page.locator(e.userListItem, { hasText: viewer3.username }),
      'Viewer3 should appear in moderator user list after joining',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await this.userPage.wasRemoved(
      e.smallToastMsg,
      'Locked viewer must not receive join notification when hideUserList is active',
      ELEMENT_WAIT_TIME,
    );

    await this.modPage.hasText(
      e.smallToastMsg,
      `${viewer3.username} joined the session`,
      'Moderator must receive join notification when hideUserList is active',
      ELEMENT_WAIT_LONGER_TIME,
    );

    await unlockedViewer.hasText(
      e.smallToastMsg,
      `${viewer3.username} joined the session`,
      'Unlocked viewer must receive join notification when hideUserList is active',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  /**
   * Regression test for issue #24888, including the unlocked-viewer route.
   *
   * Expected behavior when hideUserList is active:
   * - locked viewer: no leave notification
   * - unlocked viewer: receives leave notification
   * - moderator: receives leave notification
   */
  async hideUserListLeaveNotificationVisibleForUnlockedAndModOnly() {
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockUserList);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.modPage.closeAllToastNotifications();

    // Viewer1 joins locked.
    await this.initUserPage();
    // Viewer2 joins locked, then is explicitly unlocked.
    await this.initUserPage2();
    const unlockedViewerName = this.userPage2.username;
    await this.modPage.page.locator(e.userListItem).filter({ hasText: unlockedViewerName }).click();
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    const unlockedViewer = this.userPage2;

    // Viewer3 stays locked and will leave.
    await this.initUserPage2(undefined, { fullName: 'Attendee3' });
    const leavingViewer = this.userPage2;

    await expect(
      this.modPage.page.locator(e.userListItem, { hasText: leavingViewer.username }),
      'Viewer3 should appear in moderator user list before leaving',
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await openSettings(this.modPage);
    await enableUserLeavePopup(this.modPage);
    await saveSettings(this.modPage);

    await openSettings(this.userPage);
    await enableUserLeavePopup(this.userPage);
    await saveSettings(this.userPage);

    await openSettings(unlockedViewer);
    await enableUserLeavePopup(unlockedViewer);
    await saveSettings(unlockedViewer);

    await this.modPage.closeAllToastNotifications();
    await this.userPage.closeAllToastNotifications();
    await unlockedViewer.closeAllToastNotifications();

    await leavingViewer.waitAndClick(e.leaveMeetingDropdown, ELEMENT_WAIT_LONGER_TIME);
    await leavingViewer.waitAndClick(e.directLogoutButton, ELEMENT_WAIT_LONGER_TIME);

    await this.modPage.hasText(
      e.smallToastMsg,
      `${leavingViewer.username} left the session`,
      'Moderator must receive leave notification when hideUserList is active',
      UPLOAD_PDF_WAIT_TIME,
    );

    await unlockedViewer.hasText(
      e.smallToastMsg,
      `${leavingViewer.username} left the session`,
      'Unlocked viewer must receive leave notification when hideUserList is active',
      UPLOAD_PDF_WAIT_TIME,
    );

    await this.userPage.wasRemoved(
      e.smallToastMsg,
      'Locked viewer must not receive leave notification when hideUserList is active',
      ELEMENT_WAIT_TIME,
    );
  }
}
