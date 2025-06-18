const { expect } = require('@playwright/test');
const playwright = require("playwright");
const Page = require('../core/page');
const e = require('../core/elements');
const { sleep } = require('../core/helpers');
const { checkTextContent } = require('../core/util');
const { checkAvatarIcon, checkIsPresenter, checkMutedUser } = require('./util');
const { getSettings } = require('../core/settings');
const { ELEMENT_WAIT_TIME } = require('../core/constants');

class MultiUsers {
  constructor(browser, context) {
    this.browser = browser;
    this.context = context;
  }

  async initPages(page1) {
    await this.initModPage(page1);
    await this.initUserPage();
  }

  async initModPage(page, shouldCloseAudioModal = true, { fullName = 'Moderator', ...restOptions } = {}) {
    const options = {
      ...restOptions,
      fullName,
    };

    this.modPage = new Page(this.browser, page);
    await this.modPage.init(true, shouldCloseAudioModal, options);
  }

  async initModPage2(shouldCloseAudioModal = true, context = this.context, { fullName = 'Moderator2', useModMeetingId = true, ...restOptions } = {}) {
    const options = {
      ...restOptions,
      fullName,
      meetingId: (useModMeetingId) ? this.modPage.meetingId : undefined,
    };
    const page = await context.newPage();
    this.modPage2 = new Page(this.browser, page);
    await this.modPage2.init(true, shouldCloseAudioModal, options);
  }
    
  async initUserPage(shouldCloseAudioModal = true, context = this.context, { fullName = 'Attendee', useModMeetingId = true, ...restOptions } = {}) {
    const options = {
      ...restOptions,
      fullName,
      meetingId: (useModMeetingId) ? this.modPage.meetingId : undefined,
    };

    const page = await context.newPage();
    this.userPage = new Page(this.browser, page);
    await this.userPage.init(false, shouldCloseAudioModal, options);
  }

  async initUserPage1(shouldCloseAudioModal = true, { fullName = 'Attendee', useModMeetingId = true, ...restOptions } = {}) {
    const options = {
      ...restOptions,
      fullName,
      meetingId: (useModMeetingId) ? this.modPage.meetingId : undefined,
    };

    const page = await (await playwright.chromium.launch()).newPage();
    this.userPage1 = new Page(this.browser, page);
    await this.userPage1.init(false, shouldCloseAudioModal, options);
  }

  async initUserPage2(shouldCloseAudioModal = true, context = this.context, { fullName = 'Attendee2', useModMeetingId = true, ...restOptions } = {}) {
    const options = {
      ...restOptions,
      fullName,
      meetingId: (useModMeetingId) ? this.modPage.meetingId : undefined,
    };

    const page = await context.newPage();
    this.userPage2 = new Page(this.browser, page);
    await this.userPage2.init(false, shouldCloseAudioModal, options);
  }

  async userPresence() {
    await this.modPage.hasElementCount(e.currentUser, 1, 'should contain one current user for the moderator');
    await this.modPage.hasElementCount(e.userListItem, 1, 'should contain one user on user list for the moderator');
    await this.userPage.hasElementCount(e.currentUser, 1, 'should contain one current user for the attendee');
    await this.userPage.hasElementCount(e.userListItem, 1, 'should contain one user on user list for the attendee');
  }

  async makePresenter() {
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.makePresenter);
    await this.modPage.wasRemoved(e.wbToolbar, 'should not display the whiteboard toolbar for the moderator');

    await this.userPage.hasElement(e.startScreenSharing, 'should display the start screenshare button for the attendee');
    await this.userPage.hasElement(e.presentationToolbarWrapper, 'should display the presentation toolbar for the attendee');
    await this.userPage.hasElement(e.wbToolbar, 'should display the whiteboard toolbar for the attendee');
    await this.userPage.hasElement(e.actions, 'should display the actions button for the attendee');
    await this.userPage.hasElement(e.userListItem, 'should display the user list item for the attendee');
    const isPresenter = await checkIsPresenter(this.userPage);
    await expect(isPresenter, 'should the attendee be presenter').toBeTruthy();
  }

  async takePresenter() {
    await this.modPage2.waitAndClick(e.currentUser);
    await this.modPage2.waitAndClick(e.takePresenter);
    await this.modPage.wasRemoved(e.wbToolbar, 'should not display the whiteboard toolbar for the moderator');

    await this.modPage2.hasElement(e.startScreenSharing, 'should display the start screenshare button for the second moderator');
    await this.modPage2.hasElement(e.wbToolbar, 'should display the whiteboard toolbar for the second moderator');
    await this.modPage2.hasElement(e.presentationToolbarWrapper, 'should presentation toolbar for the second moderator');
    await this.modPage2.hasElement(e.userListItem, 'should display the user list item for the second moderator');
    const isPresenter = await checkIsPresenter(this.modPage2);
    await expect(isPresenter, 'should the second moderator to be presenter').toBeTruthy();
    await this.modPage2.waitAndClick(e.actions);
    await this.modPage2.hasElement(e.managePresentations, 'should display the manage presentations for the second moderator');
    await this.modPage2.hasElement(e.polling, 'should display the polling option for the second moderator');
    await this.modPage2.hasElement(e.shareExternalVideoBtn, 'should display the share external video button for the second moderator');
  }

  async promoteToModerator() {
    await checkAvatarIcon(this.userPage, false);
    await this.userPage.wasRemoved(e.manageUsers, 'should not display the manage users  for the attendee');
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.promoteToModerator);
    await checkAvatarIcon(this.userPage);
    await this.userPage.hasElement(e.manageUsers, 'should display the manage users for the attendee');
  }

  async demoteToViewer() {
    await checkAvatarIcon(this.modPage2);
    await this.modPage2.hasElement(e.manageUsers, 'should display the manage users for the second moderator');
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.demoteToViewer);
    await checkAvatarIcon(this.modPage2, false);
    await this.modPage2.wasRemoved(e.manageUsers, 'should not display the manage users for the second moderator');
  }

  async raiseAndLowerHand() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.initUserPage();
    await this.userPage.waitForSelector(e.whiteboard);
    await this.userPage.waitAndClick(e.raiseHandBtn);
    await this.userPage.hasElement(e.lowerHandBtn, 'should display the lower hand button after raising the hand');
    await this.modPage.comparingSelectorsBackgroundColor(e.avatarsWrapperAvatar, `${e.userListItem} div:first-child`);
    await sleep(1000);
    await this.userPage.waitAndClick(e.lowerHandBtn);
    await this.userPage.hasElement(e.raiseHandBtn, 'should display the raise hand button after lowering the hand');
  }

  async raiseHandRejected() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.initUserPage();
    await this.userPage.waitAndClick(e.raiseHandBtn);
    await this.userPage.hasElement(e.lowerHandBtn, 'should display the lower hand button for the attendee');
    await this.userPage.press('Escape');
    await this.modPage.comparingSelectorsBackgroundColor(e.avatarsWrapperAvatar, `${e.userListItem} div:first-child`);
    await this.modPage.waitAndClick(e.raiseHandRejection);
    await this.userPage.hasElement(e.raiseHandBtn, 'should display the raise hand button after rejection');
  }

  async toggleUserList() {
    await this.modPage.hasElement(e.chatBox, 'should display the public chat box for the moderator');
    await this.modPage.hasElement(e.chatButton, 'should display the public chat button for the moderator');
    await this.modPage.waitAndClick(e.userListToggleBtn);
    await this.modPage.wasRemoved(e.chatBox, 'should not display the public chat box for the moderator');
    await this.modPage.wasRemoved(e.chatButton, 'should not display the public chat button for the moderator');
    await this.modPage.waitAndClick(e.userListToggleBtn);
    await this.modPage.wasRemoved(e.chatBox, 'should not display the public chat box for the moderator');
    await this.modPage.hasElement(e.chatButton, 'should display the public chat button for the moderator');
  }

  async saveUserNames(testInfo) {
    await this.modPage.waitAndClick(e.manageUsers);
    const downloadUserNamesListLocator = this.modPage.getLocator(e.downloadUserNamesList);
    const { content } = await this.modPage.handleDownload(downloadUserNamesListLocator, testInfo);

    const dataToCheck = [
      this.modPage.username,
      this.userPage.username,
      this.modPage.meetingId,
    ];
    await checkTextContent(content, dataToCheck, 'should the downloaded content match the user names');
  }

  async pinningWebcams() {
    // start webcam sharing
    await this.modPage.shareWebcam();
    await this.modPage2.shareWebcam();
    await this.userPage.shareWebcam();
    // check own webcam sharing
    await this.modPage.hasElement(e.webcamMirroredVideoContainer, 'should display mirrored webcam video container (own share) for Mod1');
    await this.modPage2.hasElement(e.webcamMirroredVideoContainer, 'should display mirrored webcam video container (own share) for Mod2');
    await this.userPage.hasElement(e.webcamMirroredVideoContainer, 'should display mirrored webcam video container (own share) for Attendee');
    // check other webcams sharing for each user
    await this.modPage.hasNElements(e.webcamContainer, 2, 'should display the other two webcams for Mod1');
    await this.modPage2.hasNElements(e.webcamContainer, 2, 'should display the other two webcams for Mod2');
    await this.userPage.hasNElements(e.webcamContainer, 2, 'should display the other two webcams for Attendee');
    // pin first webcam (Mod2)
    await this.modPage.getLocator(e.dropdownWebcamButton)
      .filter({ hasText: this.modPage2.username })
      .click();
    await this.modPage.getVisibleLocator(e.pinWebcamBtn).click();
    // check pinned webcam
    await this.modPage.hasText(`:nth-match(${e.dropdownWebcamButton}, 1)`, this.modPage2.username, 'should display the username of Mod2 on the pinned webcam for Mod1');
    await this.modPage2.hasText(`:nth-match(${e.dropdownWebcamButton}, 1)`, this.modPage2.username, 'should display the username of Mod2 on the pinned webcam for Mod2');
    await this.modPage2.hasText(`:nth-match(${e.dropdownWebcamButton}, 1)`, this.modPage2.username, 'should display the username of Mod2 on the pinned webcam for the Attendee');
    // pin second webcam (user)
    await this.modPage.getLocator(e.dropdownWebcamButton)
      .filter({ hasText: this.userPage.username })
      .click();
    await this.modPage.getVisibleLocator(e.pinWebcamBtn).click();
    // check pin webcam button number for mods
    await this.modPage.hasNElements(e.pinVideoButton, 2, 'should display two buttons of pinned video for Mod1');
    await this.modPage2.hasNElements(e.pinVideoButton, 2, 'should display two buttons of pinned video for Mod2');
    // check first pinned webcam
    await this.modPage.hasText(`:nth-match(${e.dropdownWebcamButton}, 1)`, this.userPage.username, 'should display the username of Attendee on the first pinned webcam for Mod1');
    await this.modPage2.hasText(`:nth-match(${e.dropdownWebcamButton}, 1)`, this.userPage.username, 'should display the username of Attendee on the first pinned webcam for Mod2');
    await this.userPage.hasText(`:nth-match(${e.dropdownWebcamButton}, 1)`, this.modPage2.username, 'should display the username of Mod2 on the first pinned webcam for Attendee (mods priority for viewers)');
    // check second pinned webcam
    await this.modPage.hasText(`:nth-match(${e.dropdownWebcamButton}, 2)`, this.modPage2.username, 'should display the username of Mod2 on the second pinned webcam for Mod1');
    await this.modPage2.hasText(`:nth-match(${e.dropdownWebcamButton}, 2)`, this.modPage2.username, 'should display the username of Mod2 on the second pinned webcam for Mod2');
    await this.userPage.hasText(`:nth-match(${e.dropdownWebcamButton}, 2)`, this.userPage.username, 'should display the username of Attendee on the second pinned webcam for Attendee');
  }

  async giveAndRemoveWhiteboardAccess() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.changeWhiteboardAccess);
    await this.modPage.hasElement(e.multiUsersWhiteboardOff);
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.changeWhiteboardAccess);
    await this.modPage.hasElement(e.multiUsersWhiteboardOn);
  }

  async disabledUsersJoinMuted() {
    // join user muted
    await this.initUserPage(false);
    await this.userPage.waitAndClick(e.microphoneButton);
    await this.userPage.waitAndClick(e.joinEchoTestButton);
    await this.userPage.wasRemoved(e.establishingAudioLabel, 'should stop displaying the establishing audio label when the first user joins audio');
    await this.userPage.hasElement(e.unmuteMicButton, 'should display the unmute microphone button for the first user - joined muted');
    // disabled user join muted
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.usersJoinMuted);
    // join user unmuted
    await this.initUserPage2(false);
    await this.userPage2.waitAndClick(e.microphoneButton);
    await this.userPage2.waitAndClick(e.joinEchoTestButton);
    await this.userPage2.wasRemoved(e.establishingAudioLabel, 'should stop displaying the establishing audio label when the second user joins audio');
    await this.userPage2.hasElement(e.muteMicButton, 'should display the mute microphone button for the second user - joined unmuted');
    // check if the talking indicator is displayed for everyone
    await this.modPage.hasElement(e.isTalking, 'should display the talking indicator for the moderator');
    await this.userPage.hasElement(e.isTalking, 'should display the talking indicator for the first user');
    await this.userPage2.hasElement(e.isTalking, 'should display the talking indicator for the second user');
  }

  async muteAllUsersExceptPresenter(){
    // join audio
    await this.modPage.joinMicrophone();
    await this.modPage2.joinMicrophone();
    await this.userPage.joinMicrophone();
    // mute all users except the presenter
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.muteAllExceptPresenter);
    // check if presenter is not muted
    await this.modPage.checkUserTalkingIndicator();
    // check number of talking indicator's element
    await this.modPage.hasElementCount(e.isTalking, 1, 'should display only the presenter talking indicator for the moderator');
    await this.modPage2.hasElementCount(e.isTalking, 1, 'should display only the presenter talking indicator for the second moderator');
    await this.userPage.hasElementCount(e.isTalking, 1, 'should display only the presenter talking indicator for the attendee');
    // check join audio buttons for the users
    await checkMutedUser(this.modPage2);
    await checkMutedUser(this.userPage);
  }

  async removeUser() {
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.removeUser);
    await this.modPage.waitAndClick(e.removeUserConfirmationBtn);
    await this.modPage.wasRemoved(e.userListItem, 'should not display a user on the user list for the moderator');

    //Will be modified when the issue is fixed and accept just one of both screens
    //https://github.com/bigbluebutton/bigbluebutton/issues/16463
    try {
      await this.modPage2.hasElement(e.errorScreenMessage, 'should display the error screen message for the second moderator');
    } catch (err) {
      await this.modPage2.hasElement(e.meetingEndedModalTitle, 'should display the meeting ended modal for the second moderator');
    }
  }

  async removeUserAndPreventRejoining(context) {
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.removeUser);
    await this.modPage.waitAndClick(e.confirmationCheckbox);
    await this.modPage.waitAndClick(e.removeUserConfirmationBtn);
    await this.modPage.wasRemoved(e.userListItem, 'should not display the user on the user list for the moderator');

    // Will be modified when the issue is fixed and accept just one of both screens
    // https://github.com/bigbluebutton/bigbluebutton/issues/16463
    try {
      await this.modPage2.hasElement(e.errorScreenMessage, 'should display the error screen message for the second moderator');
    } catch {
      await this.modPage2.hasElement(e.meetingEndedModalTitle, 'should display the meeting ended modal for the second moderator');
    }

    await this.initModPage2(false, context, { meetingId: this.modPage.meetingId, joinParameter: 'userID=Moderator2', shouldCheckAllInitialSteps: false });

    // Due to same reason above, sometimes it displays different messages
    try {
      await this.modPage2.hasText('body', /banned/, 'should display the banned message for the second moderator');
    } catch {
      await this.modPage2.hasText('body', /removed/, 'should display the removed message for the second moderator');
    }
  }

  // Reactions tests
  async reactionsTest() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);

    // use the smiling reaction
    await this.modPage.waitAndClick(e.reactionsButton);
    await this.modPage.waitAndClick(`${e.singleReactionButton}:nth-child(1)`);
    await this.modPage.hasText(e.moderatorAvatar, '😃', 'should display the smiling emoji in the moderator avatar for the moderator');
    await this.modPage.hasText(e.reactionsButton, '😃', 'should display the smiling emoji on the reactions button when used');
    await this.userPage.hasText(e.moderatorAvatar, '😃', 'should display the smiling emoji in the moderator avatar for the viewer');

    // change the reaction to the thumbs up
    await this.modPage.waitAndClick(e.reactionsButton);
    await this.modPage.waitAndClick(`${e.singleReactionButton}:nth-child(5)`);
    await this.modPage.hasText(e.moderatorAvatar, '👍', 'should display the thumbs up emoji in the moderator avatar for the moderator when changed');
    await this.modPage.hasText(e.reactionsButton, '👍', 'should display the smiling emoji on the reactions button when changed');
    await this.userPage.hasText(e.moderatorAvatar, '👍', 'should display the smiling emoji in the moderator avatar for the viewer when changed');
  }

  async emojiRainTest() {
    const { emojiRain } = getSettings();
    const smilingEmojiReaction = `${e.singleReactionButton}:nth-child(1)`;

    if (!emojiRain) {
      await this.modPage.waitForSelector(e.whiteboard);
      await this.modPage.waitAndClick(e.reactionsButton);
      await this.modPage.waitAndClick(smilingEmojiReaction);
      await this.modPage.wasRemoved(e.emojiRain, 'should not display the emoji rain when disabled');
      return
    }

    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.reactionsButton);
    await this.modPage.waitAndClick(smilingEmojiReaction);
    const emojiRainLocator = this.modPage.getLocator(e.emojiRain);
    await expect(emojiRainLocator, 'should display the emoji rain element when enabled').toHaveCount(5, { timeout: ELEMENT_WAIT_TIME });
    await sleep(1000);
    await expect(emojiRainLocator, 'should stop displaying the emoji rain element after a second').toHaveCount(0, { timeout: ELEMENT_WAIT_TIME });
  }

  async clearAllStatusIcon() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage2.waitForSelector(e.whiteboard);
    
    await this.modPage.waitAndClick(e.reactionsButton);
    await this.modPage.waitAndClick(`${e.singleReactionButton}:nth-child(1)`);
    await this.modPage.hasText(e.moderatorAvatar, '😃', 'should display the smiling emoji in the moderator avatar for the moderator');
    await this.modPage.hasText(e.reactionsButton, '😃', 'should display the smiling emoji on the reactions button when used');

    await this.modPage2.waitAndClick(e.reactionsButton);
    await this.modPage2.waitAndClick(`${e.singleReactionButton}:nth-child(1)`);
    await this.modPage2.hasText(e.moderatorAvatar, '😃', 'should display the smiling emoji in the moderator avatar for the moderator');
    await this.modPage2.hasText(e.reactionsButton, '😃', 'should display the smiling emoji on the reactions button when used');

    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.clearStatus);

    await this.modPage.hasText(e.moderatorAvatar, 'mo', 'should not display the emoji after clearing all icons');
    await this.modPage2.hasText(e.moderatorAvatar, 'mo', 'should not display the emoji after clearing all icons');
  }
}

exports.MultiUsers = MultiUsers;
