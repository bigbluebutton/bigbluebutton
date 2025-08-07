const { MultiUsers } = require("./multiusers");
const { openLockViewers, drawArrow } = require('./util');
const e = require('../core/elements');
const { expect } = require("@playwright/test");
const { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } = require("../core/constants");
const { getNotesLocator } = require("../sharednotes/util");
const { sleep } = require("../core/helpers");
const { hoverLastMessage } = require("../chat/util");

class LockViewers extends MultiUsers {
  constructor(browser, page) {
    super(browser, page);
  }

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

    await this.initUserPage2(true);
    await this.userPage2.hasElementDisabled(e.joinVideo, 'should the join video button to be disabled for the second attendee');
    await this.modPage.waitAndClick(`${e.moreOptionsUserItemButton}>>nth=1`);
    //await this.modPage.waitAndClick(e.moreOptionsUserItemButton);
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
    await sleep(500);
    const videoContainersCount = [
      await this.modPage.getSelectorCount(e.webcamVideoItem),
      await this.userPage.getSelectorCount(e.webcamVideoItem),
    ];
    await expect(videoContainersCount, 'should the videos containter count to be stricted equal to 2 for the moderator and the attendee').toStrictEqual([2, 2]);

    await this.initUserPage2(true);

    await this.userPage2.shareWebcam();

    await this.modPage.waitAndClick(`${e.moreOptionsUserItemButton}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);

    await this.modPage.hasElementCount(e.webcamContainer, 2, 'should display 2 webcams container for the moderator');
    await this.userPage.hasElementCount(e.webcamContainer, 1, 'should display 1 webcams container for the first attendee');
    await this.userPage2.hasElementCount(e.webcamContainer, 2, 'should display 2 webcam container for the second attendee');
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
    await this.initUserPage2(false);
    await this.userPage2.hasElement(e.audioDropdownMenu, 'should display the audio dropdown menu button for the second attendee when joined, indicating audio connected');
    // check if second user is locked after joining
    const unmuteMicButtonUser2 = this.userPage2.getLocator(e.unmuteMicButton);
    await this.userPage2.hasElement(e.unmuteMicButton, 'should display the unmute button for the second attendee when joined, indicating audio connected');
    await expect(unmuteMicButtonUser2, 'should display the unmute button disabled as the user is locked').toBeDisabled();
    // unlock second user
    await this.modPage.waitAndClick(`${e.moreOptionsUserItemButton}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    // check second user audio after unlocking
    await this.userPage2.waitAndClick(e.audioDropdownMenu);
    await this.userPage2.waitAndClick(e.leaveAudio);
    await this.userPage2.waitAndClick(e.joinAudio);
    await this.userPage2.joinMicrophone({ shouldUnmute: false });
    await expect(unmuteMicButtonUser2, 'should the unmute button be enabled as the user is unlocked').toBeEnabled();
    await this.userPage2.waitAndClick(e.unmuteMicButton);
    await this.userPage2.hasElement(e.stopHearingButton, 'should display the stop hearing button of the echo test when clicking to unmute button');
    // select the default microphone to enable voice activity detection - not listen only mode
    await this.userPage2.getLocator(e.selectMicrophoneButton).selectOption('default');
    await this.userPage2.waitAndClick(e.joinEchoTestButton);
    await this.userPage2.hasElement(e.muteMicButton, 'should connect with the mic unmuted');
    await this.userPage2.hasElement(e.isTalking, 'should display the is talking element for the second attendee');
  }

  async lockSendPublicChatMessages() {
    // mod send a message
    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasElement(e.chatUserMessageText);
    await this.userPage.hasElement(e.chatUserMessageText);
    // lock the public chat
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockPublicChat);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.userPage.hasElementDisabled(e.chatBox, 'should have the public chat disabled for the first attendee');
    await this.userPage.hasElementDisabled(e.sendButton, 'should have the send button on the public chat disabled for the first attendee');
    await hoverLastMessage(this.userPage);
    await this.userPage.wasRemoved(e.messageToolbar, 'should not display the chat message toolbar when locked viewer is hovering a message');
    // join second user and send message
    await this.initUserPage2(true);
    await this.userPage2.hasElementDisabled(e.chatBox, 'should have the public chat disabled for the second attendee');
    await this.userPage2.hasElementDisabled(e.sendButton, 'should have the send button on the public chat disabled for the second attendee');
    await this.modPage.waitAndClick(e.messagesSidebarButton);
    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    // unlock user2
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.waitAndClick(`${e.moreOptionsUserItemButton}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    // check enabled elements and send new message
    await this.userPage2.hasElementEnabled(e.chatBox, 'should have the public chat enabled for the second attendee', ELEMENT_WAIT_LONGER_TIME);
    await this.userPage2.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.messagesSidebarButton);
    await this.modPage.hasElement(e.typingIndicator, 'should display the typing indicator element for the moderator');
    await this.userPage2.waitAndClick(e.sendButton);
    await this.userPage2.hasElementCount(e.chatUserMessageText, 3, 'should display three chat messages on the public chat for the second attendee');
    const lastMessageSentUser2Locator = await this.userPage2.getLocator(e.chatMessageItem).last();
    await lastMessageSentUser2Locator.hover({ force: true });
    await expect(lastMessageSentUser2Locator.locator(e.messageToolbar), 'should display the chat message toolbar when the unlocked viewer is hovering a message').toBeVisible();
    await this.userPage.hasElementCount(e.chatUserMessageText, 3, 'should display all messages on the public chat for the first attendee');
  }

  async lockSendPrivateChatMessages() {
    // user start private chat with mod and send a message
    await this.userPage.waitAndClick(e.usersListSidebarButton);
    const lastUserItemLocator = this.userPage.getLocatorByIndex(e.userListItem, -1);
    await this.userPage.clickOnLocator(lastUserItemLocator);
    const startPrivateChatButton = this.userPage.getLocatorByIndex(e.startPrivateChat, -1);
    await this.userPage.clickOnLocator(startPrivateChatButton);
    // mod lock the private chat
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockPrivateChat);
    await this.modPage.waitAndClick(e.applyLockSettings);
    // join second user
    await this.initUserPage2();
    await this.modPage.waitAndClick(`${e.moreOptionsUserItemButton}>>nth=0`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=0`);
    await this.userPage.waitAndClick(e.usersListSidebarButton);
    await this.userPage.waitAndClick(`${e.startPrivateChat}>>nth=1`);
    await this.userPage.hasElementEnabled(e.chatBox, 'should have the private chat enabled for the first attendee');
    await this.userPage.hasElementEnabled(e.sendButton, 'should have the send button on the private chat enabled for the first attendee');
    await this.userPage.type(e.chatBox, 'Test');
    await this.userPage.waitAndClick(e.sendButton);
    // check message sent and toolbar
    await this.userPage.hasElement(e.chatUserMessageText);
    const privateChatMessaSentUser = await this.userPage.getLocator(e.chatMessageItem).last();
    await privateChatMessaSentUser.locator(e.chatUserMessageText).hover({ force: true });
    await expect(privateChatMessaSentUser.locator(e.messageToolbar), 'should display the chat message toolbar when hovering the message').toBeVisible();
    // check if the private chat is locked for the second attendee
    await this.userPage2.waitAndClick(e.privateChatButton);
    await this.userPage2.waitAndClick(e.privateChats);
    await this.userPage2.hasElementDisabled(e.chatBox, 'should have the private chat disabled for the second attendee');
    await this.userPage2.hasElementDisabled(e.sendButton, 'should have the send button on the private chat disabled for the second attendee');
    const privateChatMessaSentUser2 = await this.userPage2.getLocator(e.chatMessageItem).last();
    await privateChatMessaSentUser2.locator(e.chatUserMessageText).hover({ force: true });
    await expect(privateChatMessaSentUser2.locator(e.messageToolbar), 'should not display the chat message toolbar when locked user is hovering the message').not.toBeVisible();
  }

  async lockEditSharedNotes() {
    await this.userPage.waitAndClick(e.sharedNotesSidebarButton);
    await this.userPage.waitForSelector(e.hideNotesLabel);
    const sharedNotesLocator = getNotesLocator(this.userPage);
    await sharedNotesLocator.type(e.message, { timeout: ELEMENT_WAIT_LONGER_TIME });
    await expect(sharedNotesLocator, 'should the shared notes contain the text "Hello World!" for the first attendee').toContainText(e.message, { timeout: ELEMENT_WAIT_TIME });

    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockEditSharedNotes);
    await this.modPage.waitAndClick(e.applyLockSettings);

    await this.initUserPage2(true);
    await this.userPage2.waitAndClick(e.sharedNotesSidebarButton);
    await this.userPage2.wasRemoved(e.etherpadFrame, 'should not display the etherpad frame for the second attendee');

    await this.userPage.waitAndClick(e.sharedNotesSidebarButton);
    await this.userPage.wasRemoved(e.etherpadFrame, 'should not display the etherpad frame for the first attendee');

    await this.modPage.waitAndClick(`${e.moreOptionsUserItemButton}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
  }

  async lockSeeOtherViewersUserList() {
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockUserList);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.initUserPage2(true);
    await this.userPage2.waitAndClick(e.usersListSidebarButton);
    await this.userPage2.hasElementCount(e.userListItem, 1, 'should contain one user on the user list for the second attendee', 10000);
    await sleep(1000);
    await this.userPage.waitAndClick(e.usersListSidebarButton);
    await this.userPage.hasElementCount(e.userListItem, 1, 'should contain one user on the user list for the first attendee');

    await this.modPage.waitAndClick(`${e.moreOptionsUserItemButton}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    await this.userPage2.hasElementCount(e.userListItem, 2, 'should contain two users on the user list for the second attendee');
  }

  async lockSeeOtherViewersAnnotations() {
    // wait for whiteboard to load and no notifications
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);
    await this.modPage.waitForSelector(e.skipSlide);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.smallToastMsg);
    // turn on multi users whiteboard
    await this.modPage.waitAndClick(e.multiUsersWhiteboardOn);
    await sleep(1000);   // timeout to ensure that the userPage presentation is zoomed in stabilized
    await drawArrow(this.userPage);
    const screenshotOptions = {
      maxDiffPixels: 500,
    };
    // lock the viewers annotations
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.hideViewersAnnotation);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await sleep(1000);  // timeout to ensure the lock settings are applied
    // check if previous annotations is displayed for the viewer joining after the lock
    await this.initUserPage2(true, this.modPage.context);
    // wait for whiteboard to load and no notifications
    await this.userPage2.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage2.closeAllToastNotifications();
    await this.userPage2.wasRemoved(e.smallToastMsg);
    const user2WbLocator = this.userPage2.getLocator(e.whiteboard);
    await this.userPage2.hasElement(e.whiteboard);
    await sleep(1000);   // timeout to ensure the user2 presentation is zoomed correctly
    await this.userPage2.wasRemoved(e.wbDrawnArrow, 'should not display the other viewer annotation for the viewer who just joined');
    await this.modPage.getLocator(e.messagesSidebarButton).hover();
    await this.userPage.getLocator(e.messagesSidebarButton).hover(); // ensure userPage cursor won't be visible on the screenshot
    await sleep(1000);  // expected timeout for cursor indicator to disappear
    await expect(user2WbLocator, 'should not display the other viewer annotation for the viewer who just joined').toHaveScreenshot('viewer2-just-joined.png', screenshotOptions);
    // draw a rectangle and check if it is displayed
    await this.userPage.waitAndClick(e.wbShapesButton);
    await this.userPage.waitAndClick(e.wbRectangleShape);
    await this.userPage.waitAndClick(e.whiteboard);
    await this.modPage.getLocator(e.messagesSidebarButton).hover();
    await this.userPage.getLocator(e.messagesSidebarButton).hover(); // ensure userPage cursor won't be visible on the screenshot
    await this.userPage2.wasRemoved(e.wbDrawnShape, 'should not display the new annotation for the other viewer');
    await sleep(1000);  // expected timeout for cursor indicator to disappear
    await expect(user2WbLocator, 'should not display the new annotation for the other viewer').toHaveScreenshot('viewer2-no-rectangle.png', screenshotOptions);
    // unlock user2
    await this.modPage.waitAndClick(`${e.moreOptionsUserItemButton}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    // check if previous annotations is displayed after unlocking user
    await this.userPage2.hasElement(e.wbDrawnArrow, 'should display the arrow drawn before user join');
    await this.userPage2.hasElement(e.wbDrawnShape, 'should display the rectangle drawn before unlocking user');
    await this.modPage.getLocator(e.messagesSidebarButton).hover();
    await this.userPage2.getLocator(e.messagesSidebarButton).hover(); // ensure userPage cursor won't be visible on the screenshot
    await sleep(1000);  // expected timeout for cursor indicator to disappear
    await expect(user2WbLocator, 'should display the other viewer annotations when unlocking specific user').toHaveScreenshot('viewer2-previous-shapes.png', screenshotOptions);
    // check if new annotations is displayed after unlocking user
    await drawArrow(this.userPage);
    await this.modPage.getLocator(e.messagesSidebarButton).hover();
    await this.userPage.getLocator(e.messagesSidebarButton).hover(); // ensure userPage cursor will be visible on the screenshot
    await this.userPage2.hasElementCount(e.wbDrawnArrow, 2, 'should display all arrows drawn for unlocked user');
    await sleep(1000);  // expected timeout for cursor indicator to disappear
    await expect(user2WbLocator, 'should display all arrows drawn for unlocked user').toHaveScreenshot('viewer2-new-arrow.png', screenshotOptions);
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
    await this.modPage.hasElementCount(e.whiteboardCursorIndicator, 1, 'should contain one whiteboard cursor indicator for the moderator');
    // join the second user and check if joined locked
    await this.initUserPage2();
    await this.userPage2.hasElementCount(e.whiteboardCursorIndicator, 0,
      'should contain no whiteboard cursor indicator for the second attendee when joining a meeting with the setting locked'
    );
    // Unlock user2
    await this.modPage.waitAndClick(`${e.moreOptionsUserItemButton}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    await sleep(1000);  // ensure the unlock settings are applied
    await this.modPage.getLocator(e.whiteboard).hover(); // hover modPage cursor on the whiteboard to ensure a new location
    await this.modPage.getLocator(e.messagesSidebarButton).hover(); // ensure modPage cursor WILL NOT be visible on the screenshot
    await this.userPage.getLocator(e.whiteboard).hover(); // ensure userPage cursor WILL be visible on the screenshot
    await this.userPage.waitAndClick(e.whiteboard);
    await this.userPage2.hasElementCount(e.whiteboardCursorIndicator, 1, 'should be displayed the other viewer whiteboard cursor indicator when unlocking user is unlocked');
  }
}

exports.LockViewers = LockViewers;
