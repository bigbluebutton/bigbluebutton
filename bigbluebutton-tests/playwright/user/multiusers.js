const { expect } = require('@playwright/test');
const playwright = require("playwright");
const Page = require('../core/page');
const e = require('../core/elements');
const { waitAndClearDefaultPresentationNotification } = require('../notifications/util');
const { sleep } = require('../core/helpers');
const { checkTextContent, checkElementLengthEqualTo } = require('../core/util');
const { checkAvatarIcon, checkIsPresenter, checkMutedUsers } = require('./util');
const { getNotesLocator } = require('../sharednotes/util');
const { getSettings } = require('../core/settings');
const { ELEMENT_WAIT_TIME } = require('../core/constants');

class MultiUsers {
  constructor(browser, context) {
    this.browser = browser;
    this.context = context;
  }

  async initPages(page1, waitAndClearDefaultPresentationNotificationModPage = false) {
    await this.initModPage(page1);
    if (waitAndClearDefaultPresentationNotificationModPage) {
      await waitAndClearDefaultPresentationNotification(this.modPage);
    }
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
    await this.modPage.checkElementCount(e.currentUser, 1, 'should contain one current user for the moderator');
    await this.modPage.checkElementCount(e.userListItem, 1, 'should contain one user on user list for the moderator');
    await this.userPage.checkElementCount(e.currentUser, 1, 'should contain one current user for the attendee');
    await this.userPage.checkElementCount(e.userListItem, 1, 'should contain one user on user list for the attendee');
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
    await expect(isPresenter, 'should the attende be presenter').toBeTruthy();
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
    await this.userPage.waitAndClick(e.raiseHandBtn);
    await this.userPage.hasElement(e.raiseHandBtn);
    await this.modPage.comparingSelectorsBackgroundColor(e.avatarsWrapperAvatar, `${e.userListItem} div:first-child`);
    await sleep(1000);
    await this.userPage.waitAndClick(e.raiseHandBtn);
    await this.userPage.hasElement(e.raiseHandBtn, 'should display the raise hand button for the attendee');
  }

  async raiseHandRejected() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.initUserPage();
    await this.userPage.waitAndClick(e.raiseHandBtn);
    await this.userPage.hasElement(e.raiseHandBtn, 'should display the lower hand button for the attendee');
    await this.userPage.press('Escape');
    await this.modPage.comparingSelectorsBackgroundColor(e.avatarsWrapperAvatar, `${e.userListItem} div:first-child`);
    await this.modPage.waitAndClick(e.raiseHandRejection);
    await this.userPage.hasElement(e.raiseHandBtn, 'should display the raise hand button for the attendee');
  }

  async toggleUserList() {
    await this.modPage.hasElement(e.chatWelcomeMessageText, 'should display the public chat welcome message for the moderator ');
    await this.modPage.hasElement(e.chatBox, 'should display the public chat box for the moderator');
    await this.modPage.hasElement(e.chatButton, 'should display the public chat button for the moderator');
    await this.modPage.waitAndClick(e.userListToggleBtn);
    await this.modPage.wasRemoved(e.chatWelcomeMessageText, 'should not display the chat welcome message for the moderator');
    await this.modPage.wasRemoved(e.chatBox, 'should not display the public chat box for the moderator');
    await this.modPage.wasRemoved(e.chatButton, 'should not display the public chat button for the moderator');
    await this.modPage.waitAndClick(e.userListToggleBtn);
    await this.modPage.wasRemoved(e.chatWelcomeMessageText, 'should not display the chat welcome message for the moderator');
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
    await this.modPage.shareWebcam();
    await this.modPage2.shareWebcam();
    await this.userPage.shareWebcam();
    await this.modPage.page.waitForFunction(
      checkElementLengthEqualTo,
      [e.webcamVideoItem, 3],
      { timeout: ELEMENT_WAIT_TIME },
    );
    // Pin first webcam (Mod2)
    await this.modPage.waitAndClick(`:nth-match(${e.dropdownWebcamButton}, 3)`);
    await this.modPage.waitAndClick(`:nth-match(${e.pinWebcamBtn}, 2)`);
    await this.modPage.hasText(`:nth-match(${e.dropdownWebcamButton}, 1)`, this.modPage2.username, 'should the first webcam display the second moderator username for the first moderator');
    await this.modPage2.hasText(`:nth-match(${e.dropdownWebcamButton}, 1)`, this.modPage2.username, 'should the first webcam display the second moderator username for the second moderator');
    await this.userPage.hasText(`:nth-match(${e.dropdownWebcamButton}, 1)`, this.modPage2.username, 'should the first webcam display the second moderator username for the attendee');
    // Pin second webcam (user)
    await this.modPage.waitAndClick(`:nth-match(${e.dropdownWebcamButton}, 3)`);
    await this.modPage.waitAndClick(`:nth-match(${e.pinWebcamBtn}, 3)`);
    await this.modPage.hasText(`:nth-match(${e.dropdownWebcamButton}, 1)`, this.userPage.username, 'should the first webcam display the attendee username for the first moderator');
    await this.modPage.hasText(`:nth-match(${e.dropdownWebcamButton}, 2)`, this.modPage2.username, 'should the second webcam display the second moderator username for the first moderator');
    await this.userPage.hasText(`:nth-match(${e.dropdownWebcamButton}, 1)`, this.modPage2.username, 'should the first webcam display the second moderator username for the first attendee');
    await this.userPage.hasText(`:nth-match(${e.dropdownWebcamButton}, 2)`, this.userPage.username, 'should the second webcam display the attendee username for the attendee');
    await this.modPage2.hasText(`:nth-match(${e.dropdownWebcamButton}, 1)`, this.userPage.username, 'should the first webcam display the attendee username for the second moderator');
    await this.modPage2.hasText(`:nth-match(${e.dropdownWebcamButton}, 2)`, this.modPage2.username, 'should the second webcam display the second moderator username for the second moderator');
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

  async muteAllUsers() {
    await this.modPage.joinMicrophone();
    await this.modPage2.joinMicrophone();
    await this.userPage.joinMicrophone();
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.muteAll);
    
    await checkMutedUsers(this.modPage);
    await checkMutedUsers(this.modPage2);
    await checkMutedUsers(this.userPage);
  }

  async muteAllUsersExceptPresenter(){
    await this.modPage.joinMicrophone();
    await this.modPage2.joinMicrophone();
    await this.userPage.joinMicrophone();
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.muteAllExceptPresenter);
    
    await this.modPage.hasElement(e.isTalking, 'should display the is talking element for the moderator');
    await checkMutedUsers(this.modPage2);
    await checkMutedUsers(this.userPage);
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
      await this.modPage2.hasText(e.userBannedMessage2, /banned/, 'should display the banned message for the second moderator');
    } catch {
      await this.modPage2.hasText(e.userBannedMessage1, /removed/, 'should display the removed message for the second moderator');
    }
  }
}

exports.MultiUsers = MultiUsers;
