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
    await this.modPage.hasElement(e.webcamVideoItem);
    await this.userPage.hasElement(e.webcamVideoItem);
    await this.userPage.shareWebcam();

    await this.modPage.hasNElements(e.webcamVideoItem, 2);
    await this.userPage.hasNElements(e.webcamVideoItem, 2);
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockShareWebcam);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.modPage.closeAllToastNotifications();
    await this.userPage.checkElementCount(e.webcamContainer, 1);
    
    await this.initUserPage2(true);
    await this.userPage2.hasElementDisabled(e.joinVideo);
    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    await this.userPage2.waitAndClick(e.joinVideo);
    await this.userPage2.waitAndClick(e.startSharingWebcam);
    await this.modPage.checkElementCount(e.webcamContainer, 2);
    await this.userPage.hasElementDisabled(e.joinVideo);
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
    await expect(videoContainersCount).toStrictEqual([2, 2]);

    await this.initUserPage2(true);

    await this.userPage2.shareWebcam();

    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);

    await this.modPage.checkElementCount(e.webcamContainer, 3);
    await this.userPage.checkElementCount(e.webcamContainer, 2);
    await this.userPage2.checkElementCount(e.webcamContainer, 3);
  }

  async lockShareMicrophone() {
    await this.userPage.waitAndClick(e.joinAudio);
    await this.userPage.joinMicrophone();
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockShareMicrophone);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.userPage.wasRemoved(e.isTalking);
    await this.userPage.waitForSelector(e.unmuteMicButton);
    await this.initUserPage2(false);
    await this.userPage2.hasElement(e.leaveListenOnly, ELEMENT_WAIT_LONGER_TIME);

    
    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    await this.userPage2.waitAndClick(e.leaveListenOnly);
    await this.userPage2.waitAndClick(e.joinAudio);
    await this.userPage2.joinMicrophone();
    await this.userPage2.hasElement(e.isTalking);
  }

  async lockSendPublicChatMessages() {
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockPublicChat);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.userPage.hasElementDisabled(e.chatBox);
    await this.userPage.hasElementDisabled(e.sendButton);
    await this.initUserPage2(true);
    await this.userPage2.hasElementDisabled(e.chatBox);
    await this.userPage2.hasElementDisabled(e.sendButton);
    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    await this.userPage2.hasElementEnabled(e.chatBox, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage2.type(e.chatBox, e.message);
    await this.modPage.hasElement(e.typingIndicator);
    await this.userPage2.waitAndClick(e.sendButton);
    await this.userPage.waitForSelector(e.chatUserMessageText);
    await this.userPage.checkElementCount(e.chatUserMessageText, 2);
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
    await this.userPage.hasElementEnabled(e.chatBox);
    await this.userPage.hasElementEnabled(e.sendButton);
    await this.userPage.type(e.chatBox, 'Test');
    await this.userPage.waitAndClick(e.sendButton);

    await this.userPage2.getLocator(e.chatButton).filter({ hasText: this.userPage.username }).click();
    await this.userPage2.waitForSelector(e.closePrivateChat);
    await this.userPage2.hasElementDisabled(e.chatBox);
    await this.userPage2.hasElementDisabled(e.sendButton);
  }

  async lockEditSharedNotes() {
    await this.userPage.waitAndClick(e.sharedNotes);
    await this.userPage.waitForSelector(e.hideNotesLabel);
    const sharedNotesLocator = getNotesLocator(this.userPage);
    await sharedNotesLocator.type(e.message, { timeout: ELEMENT_WAIT_LONGER_TIME });
    await expect(sharedNotesLocator).toContainText(e.message, { timeout: ELEMENT_WAIT_TIME });

    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockEditSharedNotes);
    await this.modPage.waitAndClick(e.applyLockSettings);

    await this.initUserPage2(true);
    await this.userPage2.waitAndClick(e.sharedNotes);
    await this.userPage2.wasRemoved(e.etherpadFrame);

    await this.userPage.waitAndClick(e.sharedNotes);
    await this.userPage.wasRemoved(e.etherpadFrame);

    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
  }

  async lockSeeOtherViewersUserList() {
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockUserList);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.initUserPage2(true);
    await this.userPage2.checkElementCount(e.userListItem, 1);
    await sleep(1000);
    await expect(await this.userPage.getLocator(e.userListItem).count()).toBe(1);

    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    await this.userPage2.checkElementCount(e.userListItem, 2);
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

    await this.modPage.checkElementCount(e.whiteboardCursorIndicator, 1);

    await this.initUserPage2(true);
    await this.userPage2.checkElementCount(e.whiteboardCursorIndicator, 0);

    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);

    await drawArrow(this.userPage);
    await this.userPage2.checkElementCount(e.whiteboardCursorIndicator, 1);
  }
}

exports.LockViewers = LockViewers;
