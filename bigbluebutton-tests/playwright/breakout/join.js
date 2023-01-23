const { default: test } = require('@playwright/test');
const { Create } = require('./create');
const utilScreenShare = require('../screenshare/util');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } = require('../core/constants');
const { getSettings } = require('../core/settings');
const { expect } = require('@playwright/test');
const { sleep } = require('../core/helpers');
const { getNotesLocator } = require('../sharednotes/util');

class Join extends Create {
  constructor(browser, context) {
    super(browser, context);
  }

  async joinRoom(shouldJoinAudio = false) {
    await this.userPage.bringToFront();
    if (shouldJoinAudio) {
      await this.userPage.waitAndClick(e.joinAudio);
      await this.userPage.joinMicrophone();
    }

    await this.userPage.waitAndClick(e.breakoutRoomsItem);
    await this.userPage.waitAndClick(e.joinRoom1);
    await this.userPage.waitForSelector(e.alreadyConnected, ELEMENT_WAIT_LONGER_TIME);

    const breakoutUserPage = await this.userPage.getLastTargetPage(this.context);
    await breakoutUserPage.bringToFront();

    if (shouldJoinAudio) {
      await this.userPage.waitForSelector(e.joinAudio);
    } else {
      await breakoutUserPage.closeAudioModal();
    }
    await breakoutUserPage.waitForSelector(e.presentationTitle);
    return breakoutUserPage;
  }

  async joinAndShareWebcam() {
    const breakoutPage = await this.joinRoom();

    const { videoPreviewTimeout } = getSettings();
    await breakoutPage.shareWebcam(true, videoPreviewTimeout);
  }

  async joinAndShareScreen() {
    const breakoutPage = await this.joinRoom();

    await utilScreenShare.startScreenshare(breakoutPage);
  }

  async joinWithAudio() {
    const breakoutUserPage = await this.joinRoom(true);

    await breakoutUserPage.waitForSelector(e.talkingIndicator);
    await breakoutUserPage.hasElement(e.isTalking);
  }

  async messageToAllRooms() {
    const breakoutUserPage = await this.joinRoom();
    await breakoutUserPage.hasElement(e.presentationTitle);

    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.type(e.chatBox, "test");
    await this.modPage.waitAndClick(e.sendButton);

    await breakoutUserPage.hasElement(e.chatUserMessageText);
  }

  async changeDurationTime() {
    const breakoutUserPage = await this.joinRoom();
    await breakoutUserPage.hasElement(e.presentationTitle);

    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.waitAndClick(e.breakoutOptionsMenu);
    await this.modPage.waitAndClick(e.openBreakoutTimeManager);
    await this.modPage.getLocator(e.inputSetTimeSelector).press('Backspace');
    await this.modPage.type(e.inputSetTimeSelector, '2');
    await this.modPage.waitAndClick(e.sendButtonDurationTime);
    await this.modPage.hasText(e.breakoutRemainingTime, /[11-12]:[0-5][0-9]/);

    await breakoutUserPage.hasText(e.timeRemaining, /[11-12]:[0-5][0-9]/);
  }

  async inviteUserAfterCreatingRooms() {
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.waitAndClick(e.breakoutOptionsMenu);
    await this.modPage.waitAndClick(e.openUpdateBreakoutUsersModal);
    await this.modPage.dragDropSelector(e.userTest, e.breakoutBox1);
    await this.modPage.hasText(e.breakoutBox1, /Attendee/);
    await this.modPage.waitAndClick(e.modalConfirmButton);

    await this.userPage.hasElement(e.modalConfirmButton);
    await this.userPage.waitAndClick(e.modalDismissButton);
  }

  async usernameShowsBelowRoomsName() {
    const breakoutUserPage = await this.joinRoom();
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.hasText(e.userNameBreakoutRoom, /Attendee/);
  }

  async showBreakoutRoomTimeRemaining() {
    const breakoutUserPage = await this.joinRoom();
    await breakoutUserPage.hasElement(e.presentationTitle);

    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.waitAndClick(e.breakoutOptionsMenu);
    await this.modPage.waitAndClick(e.openBreakoutTimeManager);
    await this.modPage.getLocator(e.inputSetTimeSelector).press('Backspace');
    await this.modPage.type(e.inputSetTimeSelector, '2');
    await this.modPage.waitAndClick(e.sendButtonDurationTime);
    await this.modPage.hasText(e.breakoutRemainingTime, /[11-12]:[0-5][0-9]/);

    await breakoutUserPage.hasText(e.timeRemaining, /[11-12]:[0-5][0-9]/);
  }

  async endAllBreakoutRooms() {
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.waitAndClick(e.breakoutOptionsMenu);
    await this.modPage.waitAndClick(e.endAllBreakouts);
    await this.modPage.wasRemoved(e.breakoutRoomsItem);
  }

  async moveUserToOtherRoom() {
    const breakoutUserPage = await this.joinRoom();
    await breakoutUserPage.hasElement(e.presentationTitle);

    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.hasText(e.userNameBreakoutRoom, /Attendee/);

    await this.modPage.waitAndClick(e.breakoutOptionsMenu);

    await this.modPage.waitAndClick(e.openUpdateBreakoutUsersModal);
    await this.modPage.dragDropSelector(e.moveUser, e.breakoutBox2);
    await this.modPage.waitAndClick(e.modalConfirmButton);

    await this.userPage.waitForSelector(e.modalConfirmButton);
    await breakoutUserPage.hasElement(e.errorScreenMessage);
    await breakoutUserPage.hasText(e.errorScreenMessage, e.error403removedLabel);

    await this.userPage.waitAndClick(e.modalConfirmButton);
    await this.modPage.hasText(e.userNameBreakoutRoom2, /Attendee/);
  }

  async exportBreakoutNotes() {
    const { sharedNotesEnabled } = getSettings();
    test.fail(!sharedNotesEnabled, 'Shared notes is disabled');

    const breakoutUserPage = await this.joinRoom();
    await breakoutUserPage.hasElement(e.presentationTitle);
    await breakoutUserPage.waitAndClick(e.sharedNotes);
    await breakoutUserPage.waitForSelector(e.hideNotesLabel);

    const notesLocator = getNotesLocator(breakoutUserPage);
    await notesLocator.type(e.message);
    await sleep(1000); // making sure there's enough time for the typing to finish

    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.waitAndClick(e.breakoutOptionsMenu);
    await this.modPage.waitAndClick(e.endAllBreakouts);

    await this.modPage.hasElement(e.presentationUploadProgressToast);
    await this.modPage.page.waitForSelector(e.presentationUploadProgressToast, { state: 'detached' });

    await this.modPage.waitAndClick(e.closeModal); // closing the audio modal
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.checkElementCount(e.actionsItem, 9);
    await this.modPage.getLocatorByIndex(e.actionsItem, 1).click();

    const wb = await this.modPage.page.$(e.whiteboard);
    const wbBox = await wb.boundingBox();
    const clipObj = {
      x: wbBox.x,
      y: wbBox.y,
      width: wbBox.width,
      height: wbBox.height,
    };
    await expect(this.modPage.page).toHaveScreenshot('capture-breakout-notes.png', {
      maxDiffPixels: 1000,
      clip: clipObj,
    });
  }

  async exportBreakoutWhiteboard() {
    const { sharedNotesEnabled } = getSettings();
    test.fail(!sharedNotesEnabled, 'Shared notes is disabled');

    const breakoutUserPage = await this.joinRoom();
    await breakoutUserPage.hasElement(e.presentationTitle);
    await breakoutUserPage.waitAndClick(e.sharedNotes);
    await breakoutUserPage.waitForSelector(e.hideNotesLabel);

    // draw a line
    await breakoutUserPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await breakoutUserPage.waitAndClick(e.wbShapesButton);
    await breakoutUserPage.waitAndClick(e.wbLineShape);
    const wbBreakout = await breakoutUserPage.page.$(e.whiteboard);
    const wbBoxBreakout = await wbBreakout.boundingBox();
    await breakoutUserPage.page.mouse.move(wbBoxBreakout.x + 0.3 * wbBoxBreakout.width, wbBoxBreakout.y + 0.3 * wbBoxBreakout.height);
    await breakoutUserPage.page.mouse.down();
    await breakoutUserPage.page.mouse.move(wbBoxBreakout.x + 0.7 * wbBoxBreakout.width, wbBoxBreakout.y + 0.7 * wbBoxBreakout.height);
    await breakoutUserPage.page.mouse.up();
    await sleep(1000); // making sure there's enough time for the typing to finish

    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.waitAndClick(e.breakoutOptionsMenu);
    await this.modPage.waitAndClick(e.endAllBreakouts);

    await this.modPage.waitForSelector(e.presentationUploadProgressToast, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.page.waitForSelector(e.presentationUploadProgressToast, { state: 'detached' });

    await this.modPage.waitAndClick(e.closeModal); // closing the audio modal
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.checkElementCount(e.actionsItem, 9);
    await this.modPage.getLocatorByIndex(e.actionsItem, 1).click();

    const wbMod = await this.modPage.page.$(e.whiteboard);
    const wbBoxMod = await wbMod.boundingBox();
    const clipObj = {
      x: wbBoxMod.x,
      y: wbBoxMod.y,
      width: wbBoxMod.width,
      height: wbBoxMod.height,
    };
    await expect(this.modPage.page).toHaveScreenshot('capture-breakout-whiteboard.png', {
      maxDiffPixels: 1000,
      clip: clipObj,
    });
  }
}

exports.Join = Join;
