import { expect } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { hasCurrentPresentationToastElement, uploadSinglePresentation } from '../presentation/util';
import * as utilScreenShare from '../screenshare/util';
import { getNotesLocator } from '../sharednotes/etherpad/util';
import { Create } from './create';

export class Join extends Create {
  async joinRoom(shouldJoinAudio = false, shouldJoinVideo = false) {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.userPage.page.bringToFront();
    if (shouldJoinAudio) {
      await this.userPage.waitAndClick(e.joinAudio);
      await this.userPage.joinMicrophone();
    }

    if (shouldJoinVideo) {
      await this.userPage.shareWebcam();
    }

    await this.userPage.waitAndClick(e.breakoutRoomSidebarButton);
    await this.userPage.waitAndClick(e.joinFirstRoom);
    await this.userPage.hasElement(
      e.alreadyConnected,
      'should display the element alreadyConnected',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    const breakoutUserPage = await this.userPage.getLastTargetPage(this.context);
    await breakoutUserPage.page.bringToFront();

    if (shouldJoinAudio) {
      await this.userPage.hasElement(
        e.joinAudio,
        'should display the join audio button after user joins breakout rooms.',
      );
      await this.userPage.wasRemoved(
        e.isTalking,
        'Talking indicator should be removed after user joins breakout rooms.',
      );
      await this.userPage.hasText(
        e.smallToastMsg,
        e.leftAudioToast,
        `should appear the text "${e.leftAudioToast}" on the toast message after user joins breakout rooms.`,
      );
    } else {
      await breakoutUserPage.closeAudioModal();
    }

    if (shouldJoinVideo) {
      await this.userPage.hasElement(
        e.joinVideo,
        'should display the join video button after user joins breakout rooms.',
      );
      await this.userPage.wasRemoved(
        e.webcamMirroredVideoContainer,
        'Webcam video should be removed after user joins breakout rooms.',
      );
    }

    await breakoutUserPage.hasElement(
      e.presentationTitle,
      'should display the presentation title on the breakout room',
    );
    await breakoutUserPage.hasText(
      e.timeRemaining,
      /1[4-5]:[0-5][0-9]/,
      'should have the time remaining counting down on the breakout room',
    );

    return breakoutUserPage;
  }

  async joinAndShareAudio() {
    const breakoutUserPage = await this.joinRoom(false);

    await breakoutUserPage.waitAndClick(e.joinAudio);
    await breakoutUserPage.waitForSelector(e.audioModal);
    await breakoutUserPage.waitAndClick(e.microphoneButton);
    await breakoutUserPage.waitForSelector(e.stopHearingButton);
    await breakoutUserPage.waitAndClick(e.joinEchoTestButton);
    await breakoutUserPage.waitForSelector(e.establishingAudioLabel);
    await breakoutUserPage.wasRemoved(
      e.establishingAudioLabel,
      'should have audio established',
      ELEMENT_WAIT_LONGER_TIME,
    );

    await breakoutUserPage.hasText(
      e.smallToastMsg,
      e.joinAudioToast,
      `should appear the text "${e.joinAudioToast}" on the toast message after user joins audio in the breakout rooms.`,
    );
    await breakoutUserPage.hasElement(e.talkingIndicator, 'should display the talking indicator element');
    await breakoutUserPage.hasElement(e.isTalking, 'should have the element isTalking active');

    await breakoutUserPage.waitAndClick(e.leaveMeetingDropdown, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await breakoutUserPage.waitAndClick(e.returnToMainRoomButton);
    await breakoutUserPage.waitAndClick(e.redirectButton);

    await this.userPage.hasElement(
      e.joinAudio,
      'should display the join audio button after user leaves breakout rooms.',
    );
  }

  async joinAndShareWebcam() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    const breakoutPage = await this.joinRoom();

    const { videoPreviewTimeout } = this.userPage.settings || {};
    await breakoutPage.shareWebcam({ videoPreviewTimeout });
  }

  async joinAndShareScreen() {
    const breakoutPage = await this.joinRoomWithModerator();

    await utilScreenShare.startScreenshare(breakoutPage);
  }

  async joinWithAudio() {
    const breakoutUserPage = await this.joinRoom(true);

    await breakoutUserPage.hasText(
      e.smallToastMsg,
      e.joinAudioToast,
      `should appear the text "${e.joinAudioToast}" on the toast message after user joins breakout rooms.`,
    );
    await breakoutUserPage.hasElement(e.talkingIndicator, 'should display the talking indicator element');
    await breakoutUserPage.hasElement(e.isTalking, 'should have the element isTalking active');

    await breakoutUserPage.waitAndClick(e.leaveMeetingDropdown, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await breakoutUserPage.waitAndClick(e.returnToMainRoomButton);
    await breakoutUserPage.waitAndClick(e.redirectButton);

    await this.userPage.hasElement(
      e.isTalking,
      'should display the talking indicator active after user leaves breakout rooms.',
    );
    await this.userPage.hasText(
      e.smallToastMsg,
      e.joinAudioToast,
      `should appear the text "${e.joinAudioToast}" on the toast message after user joins breakout rooms.`,
    );
  }

  async joinWithAudioAndVideo() {
    const breakoutUserPage = await this.joinRoom(true, true);

    await breakoutUserPage.hasText(
      e.smallToastMsg,
      e.joinAudioToast,
      `should appear the text "${e.joinAudioToast}" on the toast message after user joins breakout rooms.`,
    );
    await breakoutUserPage.hasElement(e.talkingIndicator, 'should display the talking indicator element');
    await breakoutUserPage.hasElement(e.isTalking, 'should have the element isTalking active');

    await breakoutUserPage.hasElement(
      e.joinVideo,
      'should display the join video button after user joins breakout rooms.',
    );
    await breakoutUserPage.wasRemoved(e.webcamContainer, 'should not display the video element');
  }

  async joinRoomWithModerator() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.modPage.page.bringToFront();

    await this.modPage.waitAndClick(e.roomOptions2);
    await this.modPage.waitAndClick(e.askJoinRoom2);
    await this.modPage.waitAndClick(e.roomOptions2);
    await this.modPage.waitForSelector(e.alreadyConnected, ELEMENT_WAIT_LONGER_TIME);

    const breakoutModPage = await this.modPage.getLastTargetPage(this.context);
    await breakoutModPage.page.bringToFront();

    await breakoutModPage.closeAudioModal();

    await breakoutModPage.waitForSelector(e.presentationTitle);
    return breakoutModPage;
  }

  async messageToAllRooms() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    const breakoutUserPage = await this.joinRoom();
    await breakoutUserPage.hasElement(
      e.presentationTitle,
      'should have the presentation title once the user is on the breakout room.',
    );

    await this.modPage.hasElement(e.breakoutRemainingTime, 'should display the breakout room remaining time element');
    await this.modPage.waitAndClick(e.breakoutMegaphoneButton);
    await this.modPage.fill(e.breakoutMessageInput, 'Test message to all breakout rooms');
    await this.modPage.waitAndClick(e.sendButton);
    await breakoutUserPage.hasElement(e.chatUserMessageText, 'should have a test message on the public chat.');

    await breakoutUserPage.hasElement(
      `${e.chatMessageItem}[data-message-type="breakoutRoomModeratorMsg"]`,
      'should display a message from the moderator, html element will have data-message-type="breakoutRoomModeratorMsg"',
    );

    await this.modPage.waitAndClick(e.breakoutMegaphoneButton);
    await this.modPage.fill(e.breakoutMessageInput, 'Second Test message to all breakout rooms');
    await this.modPage.waitAndClick(e.sendButton);

    await breakoutUserPage.hasNElements(
      `${e.chatMessageItem}[data-message-type="breakoutRoomModeratorMsg"]`,
      2,
      'should display 2 messages with data-message-type="breakoutRoomModeratorMsg"',
    );

    const firstModeratorMsg = breakoutUserPage.page
      .locator(`${e.chatMessageItem}[data-message-type="breakoutRoomModeratorMsg"]`)
      .first();
    const chatWrapper = firstModeratorMsg.locator('> div').first();
    await expect(
      chatWrapper,
      'should have a highlighted background color for breakout room moderator messages',
    ).toHaveCSS('background-color', 'rgb(254, 249, 241)');
    await expect(chatWrapper, 'should have a left border highlight for breakout room moderator messages').toHaveCSS(
      'border-left-color',
      'rgb(245, 198, 127)',
    );
  }

  async changeDurationTime() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    const breakoutUserPage = await this.joinRoom();
    await breakoutUserPage.hasElement(
      e.presentationTitle,
      'should display the presentation title on the breakout room',
    );

    // Decrease from 15 to 5 minutes by clicking in the minus button 10 times
    for (let i = 0; i < 10; i += 1) {
      await this.modPage.waitAndClick(e.decreaseBreakoutTimeButton);
    }

    await this.modPage.hasValue(
      e.breakoutRoomTimerMinutesInput,
      '04',
      'should have the breakout room time remaining counting down on the main meeting',
    );

    await breakoutUserPage.hasText(
      e.timeRemaining,
      /[4-5]:[0-5][0-9]/,
      'should have the time remaining counting down on the breakout room',
    );
  }

  async inviteUserAfterCreatingRooms() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
    await this.modPage.hasText(
      e.smallToastMsg,
      e.inviteSentRoom1,
      `should appear the text "${e.inviteSentRoom1}" on the toast message after dropping the ` +
        `attendee into the breakout room.`,
    );

    await this.userPage.hasElement(
      e.modalConfirmButton,
      'should display the modal confirm button for the attendee to join the meeting',
    );
    await this.userPage.waitAndClick(e.modalDismissButton);
  }

  async usernameShowsBelowRoomsName() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.joinRoom();
    await this.modPage.hasElement(e.presentationTitle, 'should display the presentation title on the breakout room');
    await this.modPage.hasText(
      e.userNameBreakoutRoom,
      /Attendee/,
      'should have the attendee name on the breakout room below a room on the main breakout panel',
    );
  }

  async showBreakoutRoomTimeRemaining() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    const breakoutUserPage = await this.joinRoom();
    await breakoutUserPage.hasElement(
      e.presentationTitle,
      'should display the presentation title on the breakout room',
    );

    // Decrease from 15 to 5 minutes by clicking in the minus button 10 times
    for (let i = 0; i < 10; i += 1) {
      await this.modPage.waitAndClick(e.decreaseBreakoutTimeButton);
    }

    await this.modPage.hasValue(
      e.breakoutRoomTimerMinutesInput,
      '04',
      'should have the breakout room time remaining counting down on the main meeting',
    );

    await breakoutUserPage.hasText(
      e.timeRemaining,
      /[4-5]:[0-5][0-9]/,
      'should display the remaining time inside the breakout room',
    );
  }

  async endAllBreakoutRooms() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.modPage.waitAndClick(e.finishBreakoutButton);
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await this.modPage.hasElement(
      e.createBreakoutRoomsButton,
      'should display create breakout rooms button after ending all breakout rooms',
    );
  }

  async moveUserToOtherRoom() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    const breakoutUserPage = await this.joinRoom();
    await breakoutUserPage.hasElement(
      e.presentationTitle,
      'should display the presentation title inside the breakout room',
    );

    await this.modPage.hasText(
      e.userNameBreakoutRoom,
      /Attendee/,
      'should display the user name below the first breakout room name',
    );

    await this.modPage.dragDropSelector(e.moveUser, e.breakoutBox2);
    await this.modPage.hasText(
      e.smallToastMsg,
      e.inviteSentRoom2,
      `should appear the text "${e.inviteSentRoom2}" on the toast message after dropping the ` +
        `attendee into the breakout room.`,
    );

    await this.userPage.hasElement(
      e.modalConfirmButton,
      'should display the modal confirm button for the user to join the breakout room',
    );

    await breakoutUserPage.hasElement(
      e.meetingEndedModal,
      'should display the meeting ended modal for the breakout page after being moved to another room',
    );
    await breakoutUserPage.hasElement(
      e.redirectButton,
      'should display the redirect button in the meeting ended modal after being moved to another room',
    );

    await this.userPage.waitAndClick(e.modalConfirmButton);
    await this.modPage.hasText(
      e.userNameBreakoutRoom2,
      /Attendee/,
      'should display the user name below the second breakout room name',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  async exportBreakoutNotes() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');
    const { sharedNotesEnabled } = this.modPage.settings || {};

    if (!sharedNotesEnabled) {
      await this.modPage.hasElement(
        e.messagesSidebarButton,
        'should display the chat button to access the public chat',
      );
      await this.modPage.wasRemoved(
        e.sharedNotesSidebarButton,
        'should not display the shared notes when it is disabled',
      );
      return;
    }
    // join room and type on the shared notes
    const breakoutUserPage = await this.joinRoom();
    await breakoutUserPage.hasElement(
      e.presentationTitle,
      'should display the presentation title inside the breakout room',
    );
    await breakoutUserPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await breakoutUserPage.page.waitForTimeout(2000); // wait for the whiteboard to stabilize
    await breakoutUserPage.waitAndClick(e.sharedNotesSidebarButton);
    await breakoutUserPage.hasElement(
      e.hideNotesLabel,
      'should display the hide notes element when shared notes is opened',
    );
    const notesLocator = getNotesLocator(breakoutUserPage);
    await notesLocator.pressSequentially(e.message);
    // making sure there's enough time for the typing to finish
    await breakoutUserPage.page.waitForTimeout(1000);
    // end breakout rooms
    await this.modPage.closeAllToastNotifications();
    await this.modPage.waitAndClick(e.finishBreakoutButton);
    // check if the notes were exported
    await this.modPage.hasElement(
      e.presentationUploadProgressToast,
      'should display the presentation upload progress toast',
    );
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.managePresentations);
    const shareNotesPDF = await this.modPage.getLocatorByIndex(e.presentationNames, 1);
    await expect(shareNotesPDF, 'should have the Notes name on the share notes pdf').toHaveText(/Notes/, {
      timeout: 30000,
    });
    await this.modPage.hasElementCount(e.presentationNames, 2, 'should display 2 items'); // This checks if no other content was exported.
    const shareNotesPDFThumbnail = await this.modPage.getLocatorByIndex(e.presentationThumbnails, 1);
    await shareNotesPDFThumbnail.click();
    await this.modPage.waitAndClick(e.sharePresentationButton);
    await hasCurrentPresentationToastElement(this.modPage, {
      description: 'should display the current presentation toast when changing to the whiteboard exported file',
    });

    // visual assertion
    await this.modPage.page.waitForTimeout(2000); // ensure whiteboard zoom is stabilized
    const wbLocator = await this.modPage.page.locator(e.whiteboard);
    await expect(wbLocator).toHaveScreenshot('capture-breakout-notes.png', {
      maxDiffPixels: 1500,
    });
  }

  async exportBreakoutWhiteboard() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    const { sharedNotesEnabled } = this.modPage.settings || {};
    if (!sharedNotesEnabled) {
      await this.modPage.hasElement(
        e.messagesSidebarButton,
        'should display the chat button to access the public chat',
      );
      await this.modPage.wasRemoved(e.sharedNotesSidebarButton, 'should have removed the shared notes');
      return;
    }
    // join room and draw a line
    const breakoutUserPage = await this.joinRoom();
    await breakoutUserPage.hasElement(
      e.presentationTitle,
      'should have the presentation title displayed on the breakout room',
    );
    await breakoutUserPage.waitAndClick(e.sharedNotesSidebarButton);
    await breakoutUserPage.hasElement(
      e.hideNotesLabel,
      'should display the hide notes element when shared notes is opened',
    );
    await breakoutUserPage.hasElement(
      e.whiteboard,
      'should display the whiteboard on breakout room',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await breakoutUserPage.waitAndClick(e.wbShapesButton);
    await breakoutUserPage.waitAndClick(e.wbLineShape);
    const wbBreakout = await breakoutUserPage.page.$(e.whiteboard);
    if (!wbBreakout) throw Error('Failed to get whiteboard breakout element');
    const wbBoxBreakout = await wbBreakout.boundingBox();
    if (!wbBoxBreakout) throw Error('Failed to get the bounding box of whiteboard breakout element');

    await breakoutUserPage.page.mouse.move(
      wbBoxBreakout.x + 0.3 * wbBoxBreakout.width,
      wbBoxBreakout.y + 0.3 * wbBoxBreakout.height,
    );
    await breakoutUserPage.page.mouse.down();
    await breakoutUserPage.page.mouse.move(
      wbBoxBreakout.x + 0.7 * wbBoxBreakout.width,
      wbBoxBreakout.y + 0.7 * wbBoxBreakout.height,
    );
    await breakoutUserPage.page.mouse.up();
    // making sure there's enough time for the drawing to finish
    await breakoutUserPage.page.waitForTimeout(1000);
    // end breakout rooms
    await this.modPage.waitAndClick(e.finishBreakoutButton);

    await this.modPage.hasElement(
      e.presentationUploadProgressToast,
      'should display the presentation upload progress toast',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.managePresentations);
    const whiteboardPDF = await this.modPage.getLocatorByIndex(e.presentationNames, 1);
    await expect(whiteboardPDF).toHaveText(/Whiteboard/, { timeout: 30000 });
    await this.modPage.hasElementCount(e.presentationNames, 2, 'should display 2 items'); // This checks if no other content was exported.
    await this.modPage.press('Escape'); // close the media sharing menu
    await this.modPage.hasElement(
      e.presentationUploadProgressToast,
      'should display the presentation upload progress toast with the exported whiteboard',
    );
    await this.modPage.page.locator(e.presentationUploadProgressToast).click({
      position: {
        x: 0.5,
        y: 1,
      },
      timeout: ELEMENT_WAIT_TIME,
    });
    await this.modPage.wasRemoved(
      e.presentationUploadProgressToast,
      'should have removed the presentation upload progress toast after clicking on it',
    );
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.managePresentations);
    const whiteboardPDFThumbnail = await this.modPage.getLocatorByIndex(e.presentationThumbnails, 1);
    await whiteboardPDFThumbnail.click();
    await this.modPage.waitAndClick(e.sharePresentationButton);
    await this.modPage.press('Escape'); // close the media sharing menu
    await hasCurrentPresentationToastElement(this.modPage, {
      description: 'should display the current presentation toast when changing to the whiteboard exported file',
    });
    // visual assertion
    await this.modPage.page.waitForTimeout(2000); // ensure whiteboard zoom is stabilized
    const wbLocator = await this.modPage.page.locator(e.whiteboard);
    await expect(wbLocator).toHaveScreenshot('capture-breakout-whiteboard.png', {
      maxDiffPixels: 1500,
    });
  }

  async userCanChooseRoom() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.userPage.page.bringToFront();

    await this.userPage.hasElementEnabled(e.selectBreakoutRoomBtn, 'should display the select breakout room button');
    await this.userPage.hasElementEnabled(e.modalConfirmButton, 'should display the modal confirm button');
    await this.userPage.hasHiddenElementCount(e.roomOption, 2, 'should display 2 room options');

    await this.userPage.page.locator(e.selectBreakoutRoomBtn).selectOption({ index: 1 });
    await this.userPage.waitAndClick(e.modalConfirmButton);

    const breakoutUserPage = await this.userPage.getLastTargetPage(this.context);
    await breakoutUserPage.page.bringToFront();
    await breakoutUserPage.hasElement(
      e.presentationTitle,
      'should display the presentation title on the breakout room',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  async breakoutWithDifferentPresentations() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.closeAllToastNotifications();
    // upload presentations
    await uploadSinglePresentation(this.modPage, e.uploadPresentationFileName);
    await this.modPage.closeAllToastNotifications();
    // create breakouts
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await this.modPage.waitForSelector(e.randomlyAssign);
    // needed for better create breakout rooms button disposition
    await this.modPage.setHeightWidthViewPortSize({ width: 1920, height: 1080 });
    await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
    await this.modPage.setHeightWidthViewPortSize(); // reset to default size
    // select different presentation for the first breakout room
    const changeSlideBreakoutLocator = await this.modPage.page.locator(e.changeSlideBreakoutRoom1);
    // open the Select dropdown
    await changeSlideBreakoutLocator.click();
    const listbox = this.modPage.page.locator('ul[role="listbox"]');
    await expect(
      listbox.locator('li[role="option"]'),
      'should display 3 available option on presentation selection (current slide, default and uploaded presentation)',
    ).toHaveCount(3);
    // change to default, other breakout will have the uploaded one as it's the current presentation
    await listbox.locator('li[role="option"]', { hasText: 'default.pdf' }).click();
    await this.modPage.waitAndClick(e.createBreakoutRoomsButton);
    await this.userPage.waitAndClick(e.modalDismissButton);
    // join user to breakout room and check the presentation loaded
    const breakoutUserPage = await this.joinRoom();
    await breakoutUserPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.modPage.waitForSelector(e.breakoutRoomSidebarButton);
    const breakoutModPage = await this.joinRoomWithModerator();
    await breakoutModPage.waitForSelector(e.presentationTitle);
    await breakoutModPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await breakoutModPage.closeAllToastNotifications();
    // Wait for presentations to fully load and stabilize
    await breakoutModPage.page.waitForTimeout(2000);
    // visual assertion on the presentations
    await expect(breakoutModPage.page).toHaveScreenshot('moderator-page-first-room.png');
    await expect(breakoutUserPage.page).toHaveScreenshot('attendee-page-second-room.png');
  }

  async callModerator() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    const breakoutUserPage = await this.joinRoom();
    await breakoutUserPage.hasElement(
      e.presentationTitle,
      'should display the presentation title inside the breakout room',
    );

    // open breakout sidebar in the breakout room and click call moderator
    await breakoutUserPage.waitAndClick(e.breakoutRoomSidebarButton);
    await breakoutUserPage.waitAndClick(e.callModeratorButton);

    // verify success notification on breakout user page
    await breakoutUserPage.hasText(
      e.smallToastMsg,
      e.callModeratorSentToast,
      'should display the "Moderators have been notified." toast notification',
    );

    // verify chat message on moderator page
    await this.modPage.waitAndClick(e.messagesSidebarButton);
    await this.modPage.hasElement(
      `${e.chatMessageItem}[data-message-type="breakoutCallModeratorMsg"]`,
      'should display a chat message with data-message-type="breakoutCallModeratorMsg"',
    );
    await this.modPage.hasText(
      `${e.chatMessageItem}[data-message-type="breakoutCallModeratorMsg"] p`,
      e.requestingModeratorAssistance,
      'should display the call moderator message in the moderator public chat',
    );
  }

  async callModeratorCooldown() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    const breakoutUserPage = await this.joinRoom();
    await breakoutUserPage.hasElement(
      e.presentationTitle,
      'should display the presentation title inside the breakout room',
    );

    // open breakout sidebar and click call moderator
    await breakoutUserPage.waitAndClick(e.breakoutRoomSidebarButton);
    await breakoutUserPage.waitAndClick(e.callModeratorButton);
    await breakoutUserPage.hasText(
      e.smallToastMsg,
      e.callModeratorSentToast,
      'should display the "Moderators have been notified." toast notification',
    );

    // click again immediately to trigger cooldown
    await breakoutUserPage.waitAndClick(e.callModeratorButton);
    await breakoutUserPage.hasText(
      e.smallToastMsg,
      e.callModeratorCooldownToast,
      'should display the "Please wait before calling the moderators again." cooldown toast',
    );
  }

  async returnToMainSessionFromSidebar() {
    if (!this?.modPage) throw new Error('modPage not initialized');
    if (!this?.userPage) throw new Error('userPage not initialized');

    const breakoutUserPage = await this.joinRoom();
    await breakoutUserPage.hasElement(
      e.presentationTitle,
      'should display the presentation title inside the breakout room',
    );

    // click the return to main session button from the breakout sidebar
    await breakoutUserPage.waitAndClick(e.breakoutRoomSidebarButton);
    await breakoutUserPage.waitAndClick(e.returnToMainSessionButton);

    await breakoutUserPage.hasElement(
      e.meetingEndedModal,
      'should display the meeting ended modal after returning to main session',
    );
    await breakoutUserPage.waitAndClick(e.redirectButton);

    await this.userPage.hasElement(
      e.joinAudio,
      'should display the join audio button after returning to the main session',
    );
  }
}
