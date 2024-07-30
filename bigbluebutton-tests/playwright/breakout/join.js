const { default: test } = require('@playwright/test');
const { Create } = require('./create');
const utilScreenShare = require('../screenshare/util');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
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
    await this.userPage.hasElement(e.alreadyConnected, 'should display the element alreadyConnected', ELEMENT_WAIT_LONGER_TIME);

    const breakoutUserPage = await this.userPage.getLastTargetPage(this.context);
    await breakoutUserPage.bringToFront();

    if (shouldJoinAudio) {
      await this.userPage.hasElement(e.joinAudio, 'should display the join audio button');
    } else {
      await breakoutUserPage.closeAudioModal();
    }
    await breakoutUserPage.hasElement(e.presentationTitle, 'should display the presentation title on the breakout room');
    return breakoutUserPage;
  }

  async joinAndShareWebcam() {
    const breakoutPage = await this.joinRoom();

    const { videoPreviewTimeout } = this.userPage.settings;
    await breakoutPage.shareWebcam(true, videoPreviewTimeout);
  }

  async joinAndShareScreen() {
    const breakoutPage = await this.joinRoom();

    await utilScreenShare.startScreenshare(breakoutPage);
  }

  async joinWithAudio() {
    const breakoutUserPage = await this.joinRoom(true);

    await breakoutUserPage.hasElement(e.talkingIndicator, 'should display the talking indicator element');
    await breakoutUserPage.hasElement(e.isTalking, 'should have the element isTalking active');
  }

  async messageToAllRooms() {
    const breakoutUserPage = await this.joinRoom();
    await breakoutUserPage.hasElement(e.presentationTitle, 'should have the presentation title once the user is on the breakout room.');

    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.hasElement(e.breakoutRemainingTime);
    await this.modPage.type(e.chatBox, "test");
    await this.modPage.waitAndClick(e.sendButton);

    await breakoutUserPage.hasElement(e.chatUserMessageText, 'should have a test message on the public chat.');
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
    await this.modPage.hasText(e.breakoutRemainingTime, /[11-12]:[0-5][0-9]/, 'should have the breakout room time remaining counting down on the main meeting');

    await breakoutUserPage.hasText(e.timeRemaining, /[11-12]:[0-5][0-9]/, 'should have the time remaining counting down on the breakout room');
  }

  async inviteUserAfterCreatingRooms() {
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.waitAndClick(e.breakoutOptionsMenu);
    await this.modPage.waitAndClick(e.openUpdateBreakoutUsersModal);
    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
    await this.modPage.hasText(e.breakoutBox1, /Attendee/,  'should have the attende name on the second breakout room box.');
    await this.modPage.waitAndClick(e.modalConfirmButton);

    await this.userPage.hasElement(e.modalConfirmButton, 'should display the modal confirm button for the attende to join the meeting');
    await this.userPage.waitAndClick(e.modalDismissButton);
  }

  async usernameShowsBelowRoomsName() {
    const breakoutUserPage = await this.joinRoom();
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.hasText(e.userNameBreakoutRoom, /Attendee/, 'should have the attende name on the breakout room below a room on the main breakout panel');
  }

  async showBreakoutRoomTimeRemaining() {
    const breakoutUserPage = await this.joinRoom();
    await breakoutUserPage.hasElement(e.presentationTitle, 'should display the presentation title on the breakout room');

    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.waitAndClick(e.breakoutOptionsMenu);
    await this.modPage.waitAndClick(e.openBreakoutTimeManager);
    await this.modPage.getLocator(e.inputSetTimeSelector).press('Backspace');
    await this.modPage.type(e.inputSetTimeSelector, '2');
    await this.modPage.waitAndClick(e.sendButtonDurationTime);
    await this.modPage.hasText(e.breakoutRemainingTime, /[11-12]:[0-5][0-9]/, 'should have the breakout room time remaining counting down on the breakout main panel.');

    await breakoutUserPage.hasText(e.timeRemaining, /[11-12]:[0-5][0-9]/, 'should display the remaining time inside the breakout rooom');
  }

  async endAllBreakoutRooms() {
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.waitAndClick(e.breakoutOptionsMenu);
    await this.modPage.waitAndClick(e.endAllBreakouts);
    await this.modPage.wasRemoved(e.breakoutRoomsItem, 'should not have the breakout rooms item displayed anymore');
  }

  async moveUserToOtherRoom() {
    const breakoutUserPage = await this.joinRoom();
    await breakoutUserPage.hasElement(e.presentationTitle, 'should display the presentation title inside the breakout room');

    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.hasText(e.userNameBreakoutRoom, /Attendee/, 'should display the user name below the first breakout room name');

    await this.modPage.waitAndClick(e.breakoutOptionsMenu);

    await this.modPage.waitAndClick(e.openUpdateBreakoutUsersModal);
    await this.modPage.dragDropSelector(e.moveUser, e.breakoutBox2);
    await this.modPage.waitAndClick(e.modalConfirmButton);

    await this.userPage.hasElement(e.modalConfirmButton, 'should display the modal confirm button for the user to join the breakout room');
    await breakoutUserPage.page.isClosed();

    await this.userPage.waitAndClick(e.modalConfirmButton);
    await this.modPage.hasText(e.userNameBreakoutRoom2, /Attendee/, 'should display the user name below the first breakout room name', ELEMENT_WAIT_LONGER_TIME);
  }

  async exportBreakoutNotes() {
    const { sharedNotesEnabled } = getSettings();

    if(!sharedNotesEnabled) {
      await this.modPage.hasElement(e.chatButton, 'should display the chat button to access the public chat');
      return this.modPage.wasRemoved(e.sharedNotes, 'should have removed the shared notes.');
    }
    const breakoutUserPage = await this.joinRoom();
    await breakoutUserPage.hasElement(e.presentationTitle, 'should display the presentation title inside the breakout room.');
    await breakoutUserPage.waitAndClick(e.sharedNotes);
    await breakoutUserPage.hasElement(e.hideNotesLabel, 'should display the hide notes element when shared notes is opened');

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

    await this.modPage.hasElement(e.presentationUploadProgressToast, 'should display the presentation upload progress toast');
    await this.modPage.waitAndClick(e.actions);
    const shareNotesPDF = await this.modPage.getLocatorByIndex(e.actionsItem, 1);
    await expect(shareNotesPDF, 'should have the Notes name on the share notes pdf').toHaveText(/Notes/, { timeout: 30000 });
    await expect(this.modPage.getLocatorByIndex(e.actionsItem, 2)).toHaveText("Upload/Manage presentations"); //This checks if no other content was exported.
    await this.modPage.checkElementCount(e.actionsItem, 8);
    await shareNotesPDF.click();

    const wbBox = await this.modPage.getLocator(e.whiteboard);
    await expect(wbBox).toHaveScreenshot('capture-breakout-notes.png', {
      maxDiffPixels: 1000,
    });
  }

  async exportBreakoutWhiteboard() {
    const { sharedNotesEnabled } = getSettings();
    
    if(!sharedNotesEnabled) {
      await this.modPage.hasElement(e.chatButton, 'should display the chat button to access the public chat');
      return this.modPage.wasRemoved(e.sharedNotes, 'should have removed the shared notes');
    }

    const breakoutUserPage = await this.joinRoom();
    await breakoutUserPage.hasElement(e.presentationTitle, 'should have the presentation title displayed on the breakout room');
    await breakoutUserPage.waitAndClick(e.sharedNotes);
    await breakoutUserPage.hasElement(e.hideNotesLabel, 'should display the hide notes element when shared notes is opened');

    // draw a line
    await breakoutUserPage.hasElement(e.whiteboard, 'should display the whiteboard on breakout room', ELEMENT_WAIT_LONGER_TIME);
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

    await this.modPage.hasElement(e.presentationUploadProgressToast, 'should display the presentation upload progress toast', ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.actions);
    const whiteboardPDF = await this.modPage.getLocatorByIndex(e.actionsItem, 1);
    await expect(whiteboardPDF).toHaveText(/Whiteboard/, { timeout: 30000 });
    await expect(this.modPage.getLocatorByIndex(e.actionsItem, 2)).toHaveText("Upload/Manage presentations"); //This checks if no other content was exported.
    await this.modPage.checkElementCount(e.actionsItem, 8);
    await whiteboardPDF.click();
    await this.modPage.waitAndClick('i[type="info"]');
    await this.modPage.waitAndClick(e.currentPresentationToast);

    //! avoiding the following screenshot comparison due to https://github.com/microsoft/playwright/issues/18827
    // const wbBox = await this.modPage.getLocator(e.whiteboard);
    // await expect(wbBox).toHaveScreenshot('capture-breakout-whiteboard.png', {
    //   maxDiffPixels: 1500,
    // });
  }

  async userCanChooseRoom() {
    await this.userPage.bringToFront();

    await this.userPage.hasElementEnabled(e.selectBreakoutRoomBtn);
    await this.userPage.hasElementEnabled(e.modalConfirmButton);
    await this.userPage.checkElementCount(e.roomOption, 2);

    await this.userPage.getLocator(`${e.fullscreenModal} >> select`).selectOption({index: 1});
    await this.userPage.waitAndClick(e.modalConfirmButton);

    const breakoutUserPage = await this.userPage.getLastTargetPage(this.context);
    await breakoutUserPage.bringToFront();
    await breakoutUserPage.hasElement(e.presentationTitle, 'should display the presentation title on the breakout room', ELEMENT_WAIT_LONGER_TIME);    
  }
}

exports.Join = Join;
