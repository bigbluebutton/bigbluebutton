const { MultiUsers } = require("./multiusers");
const { openLockViewers } = require('./util');
const e = require('../core/elements');
const { expect } = require("@playwright/test");
const { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } = require("../core/constants");
const { getNotesLocator } = require("../sharednotes/util");
const { waitAndClearNotification } = require("../notifications/util");

class LockViewers extends MultiUsers {
  constructor(browser, page) {
    super(browser, page);
  }

  async lockShareWebcam() {
    await this.modPage.shareWebcam();
    await this.userPage.hasElement(e.webcamVideoItem);
    await this.userPage2.hasElement(e.webcamVideoItem);
    await this.userPage.shareWebcam();
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockShareWebcam);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await waitAndClearNotification(this.modPage);
    const videoContainerLockedCount = await this.userPage2.getSelectorCount(e.webcamVideoItem);
    expect(videoContainerLockedCount).toBe(1);

    await this.userPage2.waitForSelector(e.dropdownWebcamButton);
    await this.userPage2.hasText(e.dropdownWebcamButton, this.modPage.username);
    await this.userPage.hasElementDisabled(e.joinVideo);
  }

  async lockSeeOtherViewersWebcams() {
    await this.modPage.shareWebcam();
    await this.userPage.shareWebcam();
    await this.userPage2.shareWebcam();
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockSeeOtherViewersWebcam);
    await this.modPage.waitAndClick(e.applyLockSettings);
    const videoContainersCount = [
      await this.modPage.getSelectorCount(e.webcamVideoItem),
      await this.userPage.getSelectorCount(e.webcamVideoItem),
      await this.userPage2.getSelectorCount(e.webcamVideoItem),
    ];
    expect(videoContainersCount).toStrictEqual([3, 2, 2]);
  }

  async lockShareMicrophone() {
    await this.userPage.waitAndClick(e.joinAudio);
    await this.userPage.joinMicrophone();
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockShareMicrophone);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.userPage.wasRemoved(e.toggleMicrophoneButton);
    await this.userPage2.waitAndClick(e.joinAudio);
    await this.userPage2.waitForSelector(e.connecting);
    await this.userPage2.hasElement(e.leaveAudio, ELEMENT_WAIT_LONGER_TIME);
  }

  async lockSendPublicChatMessages() {
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockPublicChat);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.userPage.hasElementDisabled(e.chatBox);
    await this.userPage.hasElementDisabled(e.sendButton);
    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.userPage.waitForSelector(e.chatUserMessageText);
    const messagesCount = this.userPage.getLocator(e.chatUserMessageText);
    await expect(messagesCount).toHaveCount(1);
  }

  async lockSendPrivateChatMessages() {
    const lastUserItemLocator = this.userPage.getLocator(e.userListItem).last();
    await this.userPage.clickOnLocator(lastUserItemLocator);
    const startPrivateChatButton = this.userPage.getLocator(e.startPrivateChat).last();
    await this.userPage.clickOnLocator(startPrivateChatButton);
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockPrivateChat);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.userPage.hasElementDisabled(e.chatBox);
    await this.userPage.hasElementDisabled(e.sendButton);
  }

  async lockEditSharedNotes() {
    await this.userPage.waitAndClick(e.sharedNotes);
    await this.userPage.waitForSelector(e.hideNoteLabel);
    const sharedNotesLocator = getNotesLocator(this.userPage);
    await sharedNotesLocator.type(e.message);
    expect(sharedNotesLocator).toContainText(e.message);

    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockEditSharedNotes);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.userPage.waitAndClick(e.sharedNotes);
    await this.userPage.waitAndClick(e.sharedNotes);
    // tries to type, but the element is not editable
    await sharedNotesLocator.type(e.testMessage);
    await expect(sharedNotesLocator).not.toContainText(e.testMessage);
  }

  async lockSeeOtherViewersUserList() {
    const usersCount = this.userPage.getLocator(e.userListItem);
    expect(await usersCount.count()).toBe(2);
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockUserList);
    await this.modPage.waitAndClick(e.applyLockSettings);

    expect(await usersCount.count()).toBe(1);
    await this.userPage2.hasText(e.userListItem, this.modPage.username);
  }

  async unlockUser() {
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.lockShareWebcam);
    await this.modPage.waitAndClick(e.applyLockSettings);
    await this.userPage.hasElementDisabled(e.joinVideo);
    await this.userPage2.hasElementDisabled(e.joinVideo);

    const lastUserItemLocator = this.modPage.getLocator(e.userListItem).last();
    await this.modPage.clickOnLocator(lastUserItemLocator);
    const unlockUserButton = this.modPage.getLocator(e.unlockUserButton).last();
    await this.modPage.clickOnLocator(unlockUserButton);
    await this.userPage.hasElementDisabled(e.joinVideo);
    await this.userPage2.hasElementEnabled(e.joinVideo);
  }
}

exports.LockViewers = LockViewers;
