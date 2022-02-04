const { expect } = require('@playwright/test');
const Page = require('../core/page');
const e = require('../core/elements');
const { waitAndClearNotification } = require('../notifications/util');
const { sleep } = require('../core/helpers');

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
      fullName,
      ...restOptions,
    };

    this.modPage = new Page(this.browser, page);
    await this.modPage.init(true, shouldCloseAudioModal, options);
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
    const firstUserOnModPage = this.modPage.getLocator(e.firstUser);
    const secondUserOnModPage = this.modPage.getLocator(e.userListItem);
    const firstUserOnUserPage = this.userPage.getLocator(e.firstUser);
    const secondUserOnUserPage = this.userPage.getLocator(e.userListItem);
    await expect(firstUserOnModPage).toHaveCount(1);
    await expect(secondUserOnModPage).toHaveCount(1);
    await expect(firstUserOnUserPage).toHaveCount(1);
    await expect(secondUserOnUserPage).toHaveCount(1);
  }

  async raiseHandTest() {
    await this.userPage.waitAndClick(e.raiseHandBtn);
    await this.userPage.hasElement(e.lowerHandBtn);
  }

  async getAvatarColorAndCompareWithUserListItem() {
    const getBackgroundColorComputed = (locator) => locator.evaluate((elem) => getComputedStyle(elem).backgroundColor);

    const avatarInToastElementColor = this.modPage.getLocator(e.avatarsWrapperAvatar);
    const avatarInUserListColor = this.modPage.getLocator(`${e.userListItem} > div ${e.userAvatar}`);
    await expect(getBackgroundColorComputed(avatarInToastElementColor)).toStrictEqual(getBackgroundColorComputed(avatarInUserListColor));
  }

  async lowerHandTest() {
    await waitAndClearNotification(this.userPage);
    await this.userPage.waitAndClick(e.lowerHandBtn);
    await this.userPage.hasElement(e.raiseHandBtn);
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
