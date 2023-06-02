const { expect, default: test } = require('@playwright/test');
const playwright = require("playwright");
const Page = require('../core/page');
const e = require('../core/elements');
const { waitAndClearDefaultPresentationNotification } = require('../notifications/util');
const { sleep } = require('../core/helpers');
const { checkTextContent, checkElementLengthEqualTo } = require('../core/util');
const { checkAvatarIcon, checkIsPresenter, checkMutedUsers } = require('./util');
const { getNotesLocator } = require('../sharednotes/util');
const { getSettings } = require('../core/settings');
const { ELEMENT_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

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
    await this.modPage.checkElementCount(e.currentUser, 1);
    await this.modPage.checkElementCount(e.userListItem, 1);
    await this.userPage.checkElementCount(e.currentUser, 1);
    await this.userPage.checkElementCount(e.userListItem, 1);
  }

  async makePresenter() {
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.makePresenter);
    await this.modPage.wasRemoved(e.wbToolbar);

    await this.userPage.hasElement(e.startScreenSharing);
    await this.userPage.hasElement(e.presentationToolbarWrapper);
    await this.userPage.hasElement(e.wbToolbar);
    await this.userPage.hasElement(e.actions);
    const isPresenter = await checkIsPresenter(this.userPage);
    expect(isPresenter).toBeTruthy();
  }

  async takePresenter() {
    await this.modPage2.waitAndClick(e.currentUser);
    await this.modPage2.waitAndClick(e.takePresenter);
    await this.modPage.wasRemoved(e.wbToolbar);

    await this.modPage2.hasElement(e.startScreenSharing);
    await this.modPage2.hasElement(e.wbToolbar);
    await this.modPage2.hasElement(e.presentationToolbarWrapper);
    const isPresenter = await checkIsPresenter(this.modPage2);
    expect(isPresenter).toBeTruthy();
    await this.modPage2.waitAndClick(e.actions);
    await this.modPage2.hasElement(e.managePresentations);
    await this.modPage2.hasElement(e.polling);
    await this.modPage2.hasElement(e.shareExternalVideoBtn);
  }

  async promoteToModerator() {
    await checkAvatarIcon(this.userPage, false);
    await this.userPage.wasRemoved(e.manageUsers);
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.promoteToModerator);
    await checkAvatarIcon(this.userPage);
    await this.userPage.hasElement(e.manageUsers);
  }

  async demoteToViewer() {
    await checkAvatarIcon(this.modPage2);
    await this.modPage2.hasElement(e.manageUsers);
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.demoteToViewer);
    await checkAvatarIcon(this.modPage2, false);
    await this.modPage2.wasRemoved(e.manageUsers);
  }

  async raiseAndLowerHand() {
    const { raiseHandButton } = getSettings();
    test.fail(!raiseHandButton, 'Raise/lower hand button is disabled');

    await waitAndClearDefaultPresentationNotification(this.modPage);
    await this.initUserPage();
    await this.userPage.waitAndClick(e.raiseHandBtn);
    await sleep(1000);
    await this.userPage.hasElement(e.lowerHandBtn);
    await this.modPage.comparingSelectorsBackgroundColor(e.avatarsWrapperAvatar, `${e.userListItem} > div ${e.userAvatar}`);
    await this.userPage.waitAndClick(e.lowerHandBtn);
    await this.userPage.hasElement(e.raiseHandBtn);
  }

  async raiseHandRejected() {
    const { raiseHandButton } = getSettings();
    test.fail(!raiseHandButton, 'Raise/lower hand button is disabled');

    await waitAndClearDefaultPresentationNotification(this.modPage);
    await this.initUserPage();
    await this.userPage.waitAndClick(e.raiseHandBtn);
    await sleep(1000);
    await this.userPage.hasElement(e.lowerHandBtn);
    await this.modPage.comparingSelectorsBackgroundColor(e.avatarsWrapperAvatar, `${e.userListItem} > div ${e.userAvatar}`);
    await this.modPage.waitAndClick(e.raiseHandRejection);
    await this.userPage.hasElement(e.raiseHandBtn);
  }

  async toggleUserList() {
    await this.modPage.hasElement(e.chatWelcomeMessageText);
    await this.modPage.hasElement(e.chatBox);
    await this.modPage.hasElement(e.chatButton);
    await this.modPage.waitAndClick(e.userListToggleBtn);
    await this.modPage.wasRemoved(e.chatWelcomeMessageText);
    await this.modPage.wasRemoved(e.chatBox);
    await this.modPage.wasRemoved(e.chatButton);
    await this.modPage.waitAndClick(e.userListToggleBtn);
    await this.modPage.wasRemoved(e.chatWelcomeMessageText);
    await this.modPage.wasRemoved(e.chatBox);
    await this.modPage.hasElement(e.chatButton);
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
    await checkTextContent(content, dataToCheck);
  }

  async selectRandomUser() {
    // check with no viewer joined
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.selectRandomUser);
    await this.modPage.hasElement(e.noViewersSelectedMessage);
    // check with only one viewer
    await this.modPage.waitAndClick(e.closeModal);
    await this.initUserPage();
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.selectRandomUser);
    await this.modPage.hasText(e.selectedUserName, this.userPage.username);
    // check with more users
    await this.modPage.waitAndClick(e.closeModal);
    await this.initUserPage2();
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.selectRandomUser);
    const nameSelected = await this.modPage.getLocator(e.selectedUserName).textContent();
    await this.userPage.hasText(e.selectedUserName, nameSelected);
    await this.userPage2.hasText(e.selectedUserName, nameSelected);
    // user close modal just for you
    await this.userPage.waitAndClick(e.closeModal);
    await this.userPage.wasRemoved(e.selectedUserName);
    await this.userPage2.hasElement(e.selectedUserName);
    await this.modPage.hasElement(e.selectedUserName);
    // moderator close modal
    await this.modPage.waitAndClick(e.selectAgainRadomUser);
    await sleep(500);
    await this.modPage.waitAndClick(e.closeModal);
    await this.userPage.wasRemoved(e.selectedUserName);
    await this.userPage2.wasRemoved(e.selectedUserName);
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
    await this.modPage.hasText(`:nth-match(${e.dropdownWebcamButton}, 1)`, this.modPage2.username);
    await this.modPage2.hasText(`:nth-match(${e.dropdownWebcamButton}, 1)`, this.modPage2.username);
    await this.userPage.hasText(`:nth-match(${e.dropdownWebcamButton}, 1)`, this.modPage2.username);
    // Pin second webcam (user)
    await this.modPage.waitAndClick(`:nth-match(${e.dropdownWebcamButton}, 3)`);
    await this.modPage.waitAndClick(`:nth-match(${e.pinWebcamBtn}, 3)`);
    await this.modPage.hasText(`:nth-match(${e.dropdownWebcamButton}, 1)`, this.userPage.username);
    await this.modPage.hasText(`:nth-match(${e.dropdownWebcamButton}, 2)`, this.modPage2.username);
    await this.userPage.hasText(`:nth-match(${e.dropdownWebcamButton}, 1)`, this.modPage2.username);
    await this.userPage.hasText(`:nth-match(${e.dropdownWebcamButton}, 2)`, this.userPage.username);
    await this.modPage2.hasText(`:nth-match(${e.dropdownWebcamButton}, 1)`, this.userPage.username);
    await this.modPage2.hasText(`:nth-match(${e.dropdownWebcamButton}, 2)`, this.modPage2.username);
  }

  async whiteboardAccess() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.changeWhiteboardAccess);
    await this.modPage.waitForSelector(e.multiUsersWhiteboardOff);
    const resp = await this.modPage.page.evaluate((multiUsersWbBtn) => {
      return document.querySelector(multiUsersWbBtn).parentElement.children[1].innerText;
    }, e.multiUsersWhiteboardOff);
    await expect(resp).toBeTruthy();
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
    
    await this.modPage.hasElement(e.isTalking);
    await checkMutedUsers(this.modPage2);
    await checkMutedUsers(this.userPage);
  }

  async giveAndRemoveWhiteboardAccess() {
    await this.whiteboardAccess();

    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.changeWhiteboardAccess);

    await this.modPage.hasElement(e.multiUsersWhiteboardOn);
  }

  async writeClosedCaptions() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage2.waitForSelector(e.whiteboard);
    
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.writeClosedCaptions);
    await this.modPage.waitAndClick(e.startWritingClosedCaptions);

    await this.modPage.waitAndClick(e.startViewingClosedCaptionsBtn);
    await this.modPage2.waitAndClick(e.startViewingClosedCaptionsBtn);

    await this.modPage.waitAndClick(e.startViewingClosedCaptions);
    await this.modPage2.waitAndClick(e.startViewingClosedCaptions);

    const notesLocator = getNotesLocator(this.modPage);
    await notesLocator.type(e.message);

    await this.modPage.hasText(e.liveCaptions, e.message);
    await this.modPage2.hasText(e.liveCaptions, e.message);
  }

  async removeUser() {
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.removeUser);
    await this.modPage.waitAndClick(e.removeUserConfirmationBtn);
    await this.modPage.wasRemoved(e.userListItem);

    //Will be modified when the issue is fixed and accept just one of both screens
    //https://github.com/bigbluebutton/bigbluebutton/issues/16463
    try {
      await this.modPage2.hasElement(e.errorScreenMessage);
    } catch (err) {
      await this.modPage2.hasElement(e.meetingEndedModalTitle);
    }
  }

  async removeUserAndPreventRejoining(context) {
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.removeUser);
    await this.modPage.waitAndClick(e.confirmationCheckbox);
    await this.modPage.waitAndClick(e.removeUserConfirmationBtn);
    await this.modPage.wasRemoved(e.userListItem);

    //Will be modified when the issue is fixed and accept just one of both screens
    //https://github.com/bigbluebutton/bigbluebutton/issues/16463
    try {
      await this.modPage2.hasElement(e.errorScreenMessage);
    } catch (err) {
      await this.modPage2.hasElement(e.meetingEndedModalTitle);
    }
    
    await this.initModPage2(false, context, {meetingId: this.modPage.meetingId, customParameter: 'userID=Moderator2'})
    await this.modPage2.hasText(e.userBannedMessage, /banned/);
  }

  async writeClosedCaptions() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage2.waitForSelector(e.whiteboard);
    
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.writeClosedCaptions);
    await this.modPage.waitAndClick(e.startWritingClosedCaptions);

    await this.modPage.waitAndClick(e.startViewingClosedCaptionsBtn);
    await this.modPage2.waitAndClick(e.startViewingClosedCaptionsBtn);

    await this.modPage.waitAndClick(e.startViewingClosedCaptions);
    await this.modPage2.waitAndClick(e.startViewingClosedCaptions);

    const notesLocator = getNotesLocator(this.modPage);
    await notesLocator.type(e.message);

    await this.modPage.hasText(e.liveCaptions, e.message);
    await this.modPage2.hasText(e.liveCaptions, e.message);
  }
}

exports.MultiUsers = MultiUsers;
