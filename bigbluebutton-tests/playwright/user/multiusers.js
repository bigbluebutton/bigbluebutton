const { expect, default: test } = require('@playwright/test');
const Page = require('../core/page');
const e = require('../core/elements');
const { waitAndClearDefaultPresentationNotification } = require('../notifications/util');
const { sleep } = require('../core/helpers');
const { checkAvatarIcon, checkIsPresenter } = require('./util');
const { checkTextContent } = require('../core/util');
const { getSettings } = require('../core/settings');

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
    const firstUserOnModPage = this.modPage.getLocator(e.currentUser);
    const secondUserOnModPage = this.modPage.getLocator(e.userListItem);
    const firstUserOnUserPage = this.userPage.getLocator(e.currentUser);
    const secondUserOnUserPage = this.userPage.getLocator(e.userListItem);
    await expect(firstUserOnModPage).toHaveCount(1);
    await expect(secondUserOnModPage).toHaveCount(1);
    await expect(firstUserOnUserPage).toHaveCount(1);
    await expect(secondUserOnUserPage).toHaveCount(1);
  }

  async makePresenter() {
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.makePresenter);

    await this.userPage.hasElement(e.startScreenSharing);
    await this.userPage.hasElement(e.presentationToolbarWrapper);
    await this.userPage.hasElement(e.toolsButton);
    await this.userPage.hasElement(e.actions);
    const isPresenter = await checkIsPresenter(this.userPage);
    expect(isPresenter).toBeTruthy();
  }

  async takePresenter() {
    await this.modPage2.waitAndClick(e.currentUser);
    await this.modPage2.waitAndClick(e.takePresenter);

    await this.modPage2.hasElement(e.startScreenSharing);
    await this.modPage2.hasElement(e.toolsButton);
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

    await this.userPage.waitAndClick(e.raiseHandBtn);
    await sleep(1000);
    await this.userPage.hasElement(e.lowerHandBtn);
    const getBackgroundColorComputed = (locator) => locator.evaluate((elem) => getComputedStyle(elem).backgroundColor);
    const avatarInToastElementColor = this.modPage.getLocator(e.avatarsWrapperAvatar);
    const avatarInUserListColor = this.modPage.getLocator(`${e.userListItem} > div ${e.userAvatar}`);
    await expect(getBackgroundColorComputed(avatarInToastElementColor)).toStrictEqual(getBackgroundColorComputed(avatarInUserListColor));
    await this.userPage.waitAndClick(e.lowerHandBtn);
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
    const { content } = await this.modPage.handleDownload(e.downloadUserNamesList, testInfo);

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

  async whiteboardAccess() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.changeWhiteboardAccess);
    await this.modPage.waitForSelector(e.multiWhiteboardTool);
    const resp = await this.modPage.page.evaluate((multiWhiteboardTool) => {
      return document.querySelector(multiWhiteboardTool).children[0].innerText === '1';
    }, e.multiWhiteboardTool);
    await expect(resp).toBeTruthy();
  }
}

exports.MultiUsers = MultiUsers;
