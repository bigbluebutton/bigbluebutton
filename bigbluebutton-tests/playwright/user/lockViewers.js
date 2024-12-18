const { MultiUsers } = require("./multiusers");
const { openLockViewers, drawArrow } = require('./util');
const e = require('../core/elements');
const { expect } = require("@playwright/test");
const { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } = require("../core/constants");
const { getNotesLocator } = require("../sharednotes/util");
const { waitAndClearNotification } = require("../notifications/util");
const { sleep } = require("../core/helpers");

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
    await waitAndClearNotification(this.modPage);
    await this.userPage.checkElementCount(e.webcamContainer, 1, 'should display one webcam container for the attendee');
    
    await this.initUserPage2(true);
    await this.userPage2.hasElementDisabled(e.joinVideo, 'should the join video button to be disabled for the second attendee');
    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    await this.userPage2.waitAndClick(e.joinVideo);
    await this.userPage2.waitAndClick(e.startSharingWebcam);
    await this.modPage.checkElementCount(e.webcamContainer, 1, 'should display 1 webcams container for the moderator');
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

    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);

    await this.modPage.checkElementCount(e.webcamContainer, 2, 'should display 2 webcams container for the moderator');
    await this.userPage.checkElementCount(e.webcamContainer, 1, 'should display 1 webcams container for the first attendee');
    await this.userPage2.checkElementCount(e.webcamContainer, 2, 'should display 2 webcam container for the second attendee');
  }

  async lockShareMicrophone() {
    await this.userPage.waitAndClick(e.joinAudio);
    await this.userPage.joinMicrophone();
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockShareMicrophone);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.userPage.wasRemoved(e.isTalking, 'should not display the is talking element for the first attendee');
    await this.userPage.waitForSelector(e.unmuteMicButton);
    await this.initUserPage2(false);
    await this.userPage2.hasElement(e.leaveListenOnly, 'should display the leave listen only button for the second attendee', ELEMENT_WAIT_LONGER_TIME);

    
    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    await this.userPage2.waitAndClick(e.leaveListenOnly);
    await this.userPage2.waitAndClick(e.joinAudio);
    await this.userPage2.joinMicrophone();
    await this.userPage2.hasElement(e.isTalking, 'should display the is talking element for the second attendee');
  }

  async lockSendPublicChatMessages() {
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockPublicChat);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.userPage.hasElementDisabled(e.chatBox, 'should have the public chat disabled for the first attendee');
    await this.userPage.hasElementDisabled(e.sendButton, 'should have the send button on the public chat disabled for the first attendee');
    await this.initUserPage2(true);
    await this.userPage2.hasElementDisabled(e.chatBox, 'should have the public chat disabled for the second attendee');
    await this.userPage2.hasElementDisabled(e.sendButton, 'should have the send button on the public chat disabled for the second attendee');
    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    await this.userPage2.hasElementEnabled(e.chatBox, 'should have the public chat enabled for the second attendee', ELEMENT_WAIT_LONGER_TIME);
    await this.userPage2.type(e.chatBox, e.message);
    await this.modPage.hasElement(e.typingIndicator, 'should display the typing indicator element for the moderator');
    await this.userPage2.waitAndClick(e.sendButton);
    await this.userPage.waitForSelector(e.chatUserMessageText);
    await this.userPage.checkElementCount(e.chatUserMessageText, 2, 'should display two user messages on the public chat for the first attendee');
  }

  async lockSendPrivateChatMessages() {
    const lastUserItemLocator = this.userPage.getLocatorByIndex(e.userListItem, -1);
    await this.userPage.clickOnLocator(lastUserItemLocator);
    const startPrivateChatButton = this.userPage.getLocatorByIndex(e.startPrivateChat, -1);
    await this.userPage.clickOnLocator(startPrivateChatButton);
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockPrivateChat);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.initUserPage2();
    await this.modPage.getLocator(e.userListItem).filter({ hasNotText: this.userPage2.username }).click();
    await this.modPage.waitAndClick(e.unlockUserButton);

    await this.userPage.getLocator(e.userListItem).filter({ hasText: this.userPage2.username }).click();
    await this.userPage.waitAndClick(`${e.startPrivateChat} >> visible=true`);
    await this.userPage.hasElementEnabled(e.chatBox, 'should have the private chat enabled for the first attendee');
    await this.userPage.hasElementEnabled(e.sendButton, 'should have the send button on the private chat enabled for the first attendee');
    await this.userPage.type(e.chatBox, 'Test');
    await this.userPage.waitAndClick(e.sendButton);

    await this.userPage2.getLocator(e.chatButton).filter({ hasText: this.userPage.username }).click();
    await this.userPage2.waitForSelector(e.closePrivateChat);
    await this.userPage2.hasElementDisabled(e.chatBox, 'should have the private chat disabled for the second attendee');
    await this.userPage2.hasElementDisabled(e.sendButton, 'should have the send button on the private chat disabled for the second attendee');
  }

  async lockEditSharedNotes() {
    await this.userPage.waitAndClick(e.sharedNotes);
    await this.userPage.waitForSelector(e.hideNotesLabel);
    const sharedNotesLocator = getNotesLocator(this.userPage);
    await sharedNotesLocator.type(e.message, { timeout: ELEMENT_WAIT_LONGER_TIME });
    await expect(sharedNotesLocator, 'should the shared notes contain the text "Hello World!" for the first attende').toContainText(e.message, { timeout: ELEMENT_WAIT_TIME });

    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockEditSharedNotes);
    await this.modPage.waitAndClick(e.applyLockSettings);

    await this.initUserPage2(true);
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
    await this.initUserPage2(true);
    await this.userPage2.checkElementCount(e.userListItem, 1, 'should contain one user on the user list for the second attendee');
    await sleep(1000);
    await expect(await this.userPage.getLocator(e.userListItem).count(), 'should contain one user on the user list for the first attendee').toBe(1);

    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    await this.userPage2.checkElementCount(e.userListItem, 2, 'should contain two users on the user list for the second attendee');
  }

  async lockSeeOtherViewersAnnotations() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.multiUsersWhiteboardOn);
    await this.userPage.waitForSelector(e.whiteboard);
    await drawArrow(this.userPage);

    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.hideViewersAnnotation);
    await this.modPage.waitAndClick(e.applyLockSettings);

    const screenshotOptions = {
      maxDiffPixels: 1000,
    };

    await this.initUserPage2(true);
    const userWbLocator = this.userPage2.getLocator(e.whiteboard);
    await expect(userWbLocator).toHaveScreenshot('viewer2-no-arrow.png', screenshotOptions);

    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);

    const userWbLocatorArrow = this.userPage2.getLocator(e.whiteboard);
    await expect(userWbLocatorArrow).toHaveScreenshot('viewer2-arrow.png', screenshotOptions);
  }

  async lockSeeOtherViewersCursor() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.multiUsersWhiteboardOn);

    await this.userPage.waitForSelector(e.whiteboard);
    await drawArrow(this.userPage);

    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.hideViewersCursor);
    await this.modPage.waitAndClick(e.applyLockSettings);

    await this.modPage.checkElementCount(e.whiteboardCursorIndicator, 1, 'should contain one whiteboard cursor indicator for the moderator');

    await this.initUserPage2(true);
    await this.userPage2.checkElementCount(e.whiteboardCursorIndicator, 0, 'should contain zero whiteboard cursor indicator for the second attendee');

    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);

    await drawArrow(this.userPage);
    await this.userPage2.checkElementCount(e.whiteboardCursorIndicator, 1, 'should contain one whiteboard cursor indicator for the second attendee');
  }
}

exports.LockViewers = LockViewers;
