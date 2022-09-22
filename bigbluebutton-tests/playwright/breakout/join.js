const { Create } = require('./create');
const utilScreenShare = require('../screenshare/util');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { getSettings } = require('../core/settings');

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

    await breakoutUserPage.hasText(e.breakoutRemainingTime, /12:00/);
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
    //await breakoutUserPage.waitForSelector(e.presentationTitle);
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
    await this.modPage.hasText(e.breakoutRemainingTime, /12:00/);

    await breakoutUserPage.hasText(e.breakoutRemainingTime, /12:00/);
  }

  async endAllBreakoutRooms() {
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.waitAndClick(e.breakoutOptionsMenu);
    await this.modPage.waitAndClick(e.endAllBreakouts);
    await this.modPage.wasRemoved(e.breakoutRoomsItem);
  }
}

exports.Join = Join;
