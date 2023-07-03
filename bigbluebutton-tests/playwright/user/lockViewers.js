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

  async lockShareWebcam(context) {
    await this.modPage.shareWebcam();
    await this.modPage.hasElement(e.webcamVideoItem);
    await this.userPage.hasElement(e.webcamVideoItem);
    //await this.userPage2.hasElement(e.webcamVideoItem);
    await this.userPage.shareWebcam();
    await this.modPage.hasNElements(e.webcamVideoItem, 2);
    await this.userPage.hasNElements(e.webcamVideoItem, 2);
    //await this.userPage2.hasNElements(e.webcamVideoItem, 2);
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockShareWebcam);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await waitAndClearNotification(this.modPage);
    //await this.modPage.wasNthElementRemoved(e.webcamVideoItem, 1);
    await this.userPage.checkElementCount(e.webcamContainer, 1);
    //await this.userPage2.wasNthElementRemoved(e.webcamVideoItem, 2);
    await this.initUserPage2(true, context);
    await this.userPage2.hasElementDisabled(e.joinVideo);
    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    await this.userPage2.waitAndClick(e.joinVideo);
    await this.userPage2.waitAndClick(e.startSharingWebcam);
    await this.modPage.checkElementCount(e.webcamContainer, 2);
    //await this.userPage2.waitForSelector(e.dropdownWebcamButton);
    //await this.userPage2.hasText(e.dropdownWebcamButton, this.modPage.username);
    await this.userPage.hasElementDisabled(e.joinVideo);
  }

  async lockSeeOtherViewersWebcams(context) {
    await this.modPage.shareWebcam();
    await this.userPage.shareWebcam();
    //await this.userPage2.shareWebcam();
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockSeeOtherViewersWebcam);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await sleep(500);
    const videoContainersCount = [
      await this.modPage.getSelectorCount(e.webcamVideoItem),
      await this.userPage.getSelectorCount(e.webcamVideoItem),
      //await this.userPage2.getSelectorCount(e.webcamVideoItem),
    ];
    expect(videoContainersCount).toStrictEqual([2, 2]);

    await this.initUserPage2(true, context);

    await this.userPage2.shareWebcam();

    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);

    await this.modPage.checkElementCount(e.webcamContainer, 3);
    await this.userPage.checkElementCount(e.webcamContainer, 2);
    await this.userPage2.checkElementCount(e.webcamContainer, 3);
  }

  async lockShareMicrophone(context) {
    await this.userPage.waitAndClick(e.joinAudio);
    await this.userPage.joinMicrophone();
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockShareMicrophone);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.userPage.wasRemoved(e.isTalking);
    await this.userPage.waitForSelector(e.unmuteMicButton);
    await this.initUserPage2(false, context);
    await this.userPage2.hasElement(e.leaveListenOnly, ELEMENT_WAIT_LONGER_TIME);

    
    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    await this.userPage2.waitAndClick(e.leaveListenOnly);
    await this.userPage2.waitAndClick(e.joinAudio);
    await this.userPage2.joinMicrophone();
    await this.userPage2.hasElement(e.isTalking);
  }

  async lockSendPublicChatMessages(context) {
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockPublicChat);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.userPage.hasElementDisabled(e.chatBox);
    await this.userPage.hasElementDisabled(e.sendButton);
    await this.initUserPage2(true, context);
    await this.userPage2.hasElementDisabled(e.chatBox);
    await this.userPage2.hasElementDisabled(e.sendButton);
    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    await this.userPage2.type(e.chatBox, e.message);
    await this.userPage2.waitAndClick(e.sendButton);
    await this.userPage.waitForSelector(e.chatUserMessageText);
    await this.userPage.checkElementCount(e.chatUserMessageText, 2);
  }

  async lockSendPrivateChatMessages(context) {
    const lastUserItemLocator = this.userPage.getLocatorByIndex(e.userListItem, -1);
    await this.userPage.clickOnLocator(lastUserItemLocator);
    const startPrivateChatButton = this.userPage.getLocatorByIndex(e.startPrivateChat, -1);
    await this.userPage.clickOnLocator(startPrivateChatButton);
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockPrivateChat);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.initUserPage2(true, context);
    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    
    await this.userPage2.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.userPage2.waitAndClick(`${e.startPrivateChat}>>nth=1`);
    await this.userPage2.type(e.chatBox, 'Test');
    await this.userPage2.waitAndClick(e.sendButton);
    
    await this.userPage.waitAndClick(`${e.chatButton}>>nth=1`);
    await this.userPage.hasElementDisabled(e.chatBox);
    await this.userPage.hasElementDisabled(e.sendButton);
  }

  async lockEditSharedNotes(context) {
    await this.userPage.waitAndClick(e.sharedNotes);
    await this.userPage.waitForSelector(e.hideNotesLabel);
    const sharedNotesLocator = getNotesLocator(this.userPage);
    await sharedNotesLocator.type(e.message, { timeout: ELEMENT_WAIT_LONGER_TIME });
    expect(sharedNotesLocator).toContainText(e.message, { timeout: ELEMENT_WAIT_TIME });

    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockEditSharedNotes);
    await this.modPage.waitAndClick(e.applyLockSettings);

    await this.initUserPage2(true, context);
    await this.userPage2.waitAndClick(e.sharedNotes);
    await this.userPage2.wasRemoved(e.etherpadFrame);

    await this.userPage.waitAndClick(e.sharedNotes);
    // tries to type, but the element is not editable
    await this.userPage.wasRemoved(e.etherpadFrame);

    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
  }

  async lockSeeOtherViewersUserList(context) {
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockUserList);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.initUserPage2(true, context);
    await this.userPage2.checkElementCount(e.userListItem, 1);
    await sleep(1000);
    expect(await this.userPage.getLocator(e.userListItem).count()).toBe(1);
    //await this.userPage2.hasText(e.userListItem, this.modPage.username);

    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);
    await this.userPage2.checkElementCount(e.userListItem, 2);
  }

  async unlockUser(context) {
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockShareWebcam);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.userPage.hasElementDisabled(e.joinVideo);

    await this.initUserPage2(true, context)
    await this.userPage2.hasElementDisabled(e.joinVideo);

    const lastUserItemLocator = this.modPage.getLocatorByIndex(e.userListItem, -1);
    await this.modPage.clickOnLocator(lastUserItemLocator);
    const unlockUserButton = this.modPage.getLocatorByIndex(e.unlockUserButton, -1);
    await this.modPage.clickOnLocator(unlockUserButton);
    await this.userPage.hasElementDisabled(e.joinVideo);
    await this.userPage2.hasElementEnabled(e.joinVideo);
  }

  async lockSeeOtherViewersAnnotations(context) {
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

    await this.initUserPage2(true, context);
    const userWbLocator = this.userPage2.getLocator(e.whiteboard);
    await expect(userWbLocator).toHaveScreenshot('viewer2-no-arrow.png', screenshotOptions);

    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);

    const userWbLocatorArrow = this.userPage2.getLocator(e.whiteboard);
    await expect(userWbLocatorArrow).toHaveScreenshot('viewer2-arrow.png', screenshotOptions);
  }

  async lockSeeOtherViewersCursor(context) {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.multiUsersWhiteboardOn);

    await this.userPage.waitForSelector(e.whiteboard);
    await drawArrow(this.userPage);

    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.hideViewersCursor);
    await this.modPage.waitAndClick(e.applyLockSettings);

    const screenshotOptions = {
      maxDiffPixels: 1000,
    };

    await this.initUserPage2(true, context);
    const userWbLocator = this.userPage2.getLocator(e.whiteboard);
    const wbBox = await userWbLocator.boundingBox();
    await this.userPage2.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await expect(userWbLocator).toHaveScreenshot('viewer2-no-cursor.png', screenshotOptions);

    await this.modPage.waitAndClick(`${e.userListItem}>>nth=1`);
    await this.modPage.waitAndClick(`${e.unlockUserButton}>>nth=1`);

    const userWbLocatorArrow = this.userPage2.getLocator(e.whiteboard);
    await expect(userWbLocatorArrow).toHaveScreenshot('viewer2-cursor.png', screenshotOptions);
  }
}

exports.LockViewers = LockViewers;
