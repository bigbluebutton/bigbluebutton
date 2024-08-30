const { default: test } = require('@playwright/test');
const { Create } = require('./create');
const utilScreenShare = require('../screenshare/util');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_EXTRA_LONG_TIME } = require('../core/constants');
const { getSettings } = require('../core/settings');
const { expect } = require('@playwright/test');
const { sleep } = require('../core/helpers');
const { getNotesLocator } = require('../sharednotes/util');
const { uploadMultiplePresentations } = require('../presentation/util.js');

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

  async joinRoomWithModerator() {
    await this.modPage.bringToFront();

    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.waitAndClick(e.askJoinRoom2);
    //await this.modPage.waitAndClick(e.joinRoom1);
    await this.modPage.waitForSelector(e.alreadyConnected, ELEMENT_WAIT_LONGER_TIME);

    const breakoutModPage = await this.modPage.getLastTargetPage(this.context);
    await breakoutModPage.bringToFront();

    await breakoutModPage.closeAudioModal();
    
    await breakoutModPage.waitForSelector(e.presentationTitle);
    return breakoutModPage;
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
    await breakoutUserPage.page.isClosed();

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
    // close all notifications displayed before ending rooms
    for (const closeButton of await this.modPage.getLocator(e.closeToastBtn).all()) {
      await closeButton.click();
    }
    await this.modPage.waitAndClick(e.endAllBreakouts);

    await this.modPage.hasElement(e.presentationUploadProgressToast);
    await this.modPage.waitAndClick(e.actions);
    const shareNotesPDF = await this.modPage.getLocatorByIndex(e.actionsItem, 1);
    await expect(shareNotesPDF).toHaveText(/Notes/, { timeout: 30000 });
    await expect(this.modPage.getLocatorByIndex(e.actionsItem, 2)).toHaveText("Upload/Manage presentations"); //This checks if no other content was exported.
    await this.modPage.checkElementCount(e.actionsItem, 9);
    await shareNotesPDF.click();

    const wbBox = await this.modPage.getLocator(e.whiteboard);
    await expect(wbBox).toHaveScreenshot('capture-breakout-notes.png', {
      maxDiffPixels: 1000,
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
    // close all notifications displayed before ending rooms
    for (const closeButton of await this.modPage.getLocator(e.closeToastBtn).all()) {
      await closeButton.click();
    }
    await this.modPage.waitAndClick(e.endAllBreakouts);

    await this.modPage.waitForSelector(e.presentationUploadProgressToast, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.actions);
    const whiteboardPDF = await this.modPage.getLocatorByIndex(e.actionsItem, 1);
    await expect(whiteboardPDF).toHaveText(/Whiteboard/, { timeout: 30000 });
    await expect(this.modPage.getLocatorByIndex(e.actionsItem, 2)).toHaveText("Upload/Manage presentations"); //This checks if no other content was exported.
    await this.modPage.checkElementCount(e.actionsItem, 9);
    await whiteboardPDF.click();
    await this.modPage.waitAndClick('i[type="info"]');
    await this.modPage.waitAndClick(e.currentPresentationToast);

    //! below lines commented due to https://github.com/bigbluebutton/bigbluebutton/issues/18233
    //! once it's fixed, re-add lines to the code
    // const wbBox = await this.modPage.getLocator(e.whiteboard);
    // await expect(wbBox).toHaveScreenshot('capture-breakout-whiteboard.png', {
    //   maxDiffPixels: 1000,
    // });
  }

  async userCanChooseRoom() {
    await this.userPage.bringToFront();

    await this.userPage.checkElementCount(e.roomOption, 2);

    await this.userPage.getLocator(`${e.fullscreenModal} >> select`).selectOption({index: 1});
    await this.userPage.waitAndClick(e.modalConfirmButton);

    const breakoutUserPage = await this.userPage.getLastTargetPage(this.context);
    await breakoutUserPage.bringToFront();
    await breakoutUserPage.waitForSelector(e.presentationTitle, ELEMENT_WAIT_LONGER_TIME);    
  }

  async breakoutWithDifferentPresentations() {
    await this.modPage.waitForSelector(e.whiteboard);
    await uploadMultiplePresentations(this.modPage, [e.uploadPresentationFileName, e.questionSlideFileName]);
    const closeToasBtnLocator = this.modPage.getLocator(e.closeToastBtn).last();
    await expect(closeToasBtnLocator).toBeHidden({ timeout: 15000});
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);
    await this.modPage.waitForSelector(e.randomlyAssign);
    await this.modPage.dragDropSelector(e.userTest, e.breakoutBox1);
    const changeSlideBreakoutLocator = await this.modPage.getLocator(e.changeSlideBreakoutRoom1).first();
    await changeSlideBreakoutLocator.selectOption({ index: 3 });
    await this.modPage.waitAndClick(e.modalConfirmButton);
    await this.userPage.waitAndClick(e.modalDismissButton);
    const breakoutUserPage = await this.joinRoom();
    await breakoutUserPage.hasElement(e.whiteboard, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.modPage.waitForSelector(e.breakoutRoomsItem);
    const breakoutModPage = await this.joinRoomWithModerator();
    await breakoutModPage.hasElement(e.presentationTitle);
    await breakoutModPage.hasElement(e.whiteboard, ELEMENT_WAIT_EXTRA_LONG_TIME);
    const modWbLocator = breakoutModPage.getLocator(e.whiteboard);
    await expect(modWbLocator).toHaveScreenshot('moderator-first-room-slide.png');
    const userWbLocator = breakoutUserPage.getLocator(e.whiteboard);
    await expect(userWbLocator).toHaveScreenshot('attendee-second-room-slide.png');
  }
}

exports.Join = Join;
