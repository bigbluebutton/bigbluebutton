const Page = require('../core/page');
const e = require('../core/elements');
const util = require('./util');
const utilChat = require('../chat/util');
const { ELEMENT_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { getElementLength, checkElementLengthEqualTo } = require('../core/util');

class MultiUsers {
  constructor() {
    this.page1 = new Page();
    this.page2 = new Page();
    this.userPage = new Page();
  }

  // Join BigBlueButton meeting
  async init(testFolderName) {
    await this.initMod1(testFolderName);
    await this.page2.init(true, true, testFolderName, 'Mod2', this.page1.meetingId);
  }

  async initMod1(testFolderName) {
    await this.page1.init(true, true, testFolderName, 'Mod1')
  }

  // Join BigBlueButton meeting
  async initUserPage(shouldCloseAudioModal, testFolderName) {
    await this.userPage.init(false, shouldCloseAudioModal, testFolderName, 'Attendee', this.page1.meetingId);
  }

  // Run the test for the page
  async checkForOtherUser() {
    const firstCheck = await this.page1.page.evaluate(getElementLength, e.userListItem) > 0;
    const secondCheck = await this.page1.page.evaluate(getElementLength, e.userListItem) > 0;
    return {
      firstCheck,
      secondCheck,
    };
  }

  async multiUsersPublicChat(testName) {
    try {
      const chat0 = await this.page1.page.evaluate(getElementLength, e.chatUserMessageText);
      await utilChat.sendPublicChatMessage(this.page1, this.page2, testName);
      const chat1 = await this.page1.page.evaluate(getElementLength, e.chatUserMessageText);

      return chat0 !== chat1;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async multiUsersPrivateChat(testName) {
    try {
      await utilChat.openPrivateChatMessage(this.page1, this.page2);
      const chat0 = await this.page1.page.evaluate(checkElementLengthEqualTo, e.chatUserMessageText, 0);

      await utilChat.sendPrivateChatMessage(this.page1, this.page2, testName);
      const receivedMessages = await this.page1.hasElement(e.chatUserMessageText, true) && await this.page2.hasElement(e.chatUserMessageText, true);

      return chat0 && receivedMessages;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async test() {
    try {
      const checks = await this.checkForOtherUser();
      return checks.firstCheck !== false && checks.secondCheck !== false;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async askModeratorGuestPolicy(testName) {
    try {
      await this.initMod1(testName);
      await this.page1.screenshot(`${testName}`, `01-after-closing-audio-modal-[${this.page1.meetingId}]`);

      await this.page1.waitAndClick(e.manageUsers);
      await this.page1.screenshot(`${testName}`, `02-opened-users-managing-[${this.page1.meetingId}]`);

      await this.page1.waitAndClick(e.guestPolicyLabel);
      await this.page1.screenshot(`${testName}`, `03-opened-guest-policy-[${this.page1.meetingId}]`);

      await this.page1.waitAndClick(e.askModerator);
      await this.page1.screenshot(`${testName}`, `04-clicked-askModerator-[${this.page1.meetingId}]`);
      await this.initUserPage(false, testName);
      await this.page1.bringToFront();

      const responseLoggedIn = await this.page1.hasElement(e.waitingUsersBtn);
      await this.page1.screenshot(`${testName}`, `05-after-viewer-acceptance-[${this.page1.meetingId}]`);
      return responseLoggedIn;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async alwaysAcceptGuestPolicy(testName) {
    try {
      await this.initMod1(testName);
      await this.page1.screenshot(`${testName}`, `01-after-closing-audio-modal-[${this.page1.meetingId}]`);

      await this.page1.waitAndClick(e.manageUsers);
      await this.page1.screenshot(`${testName}`, `02-opened-users-managing-[${this.page1.meetingId}]`);

      await this.page1.waitAndClick(e.guestPolicyLabel);
      await this.page1.screenshot(`${testName}`, `03-opened-guest-policy-[${this.page1.meetingId}]`);

      await this.page1.waitAndClick(e.alwaysAccept);
      await this.page1.screenshot(`${testName}`, `04-clicked-alwaysAccept-[${this.page1.meetingId}]`);
      await this.initUserPage(false, testName);

      const responseLoggedIn = await this.userPage.hasElement(e.whiteboard);
      await this.userPage.screenshot(`${testName}`, `05-after-viewer-connection-[${this.page1.meetingId}]`);
      return responseLoggedIn;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async alwaysDenyGuestPolicy(testName) {
    try {
      await this.initMod1(testName);
      await this.page1.screenshot(`${testName}`, `01-after-closing-audio-modal-[${this.page1.meetingId}]`);

      await this.page1.waitAndClick(e.manageUsers);
      await this.page1.screenshot(`${testName}`, `02-opened-users-managing-[${this.page1.meetingId}]`);

      await this.page1.waitAndClick(e.guestPolicyLabel);
      await this.page1.screenshot(`${testName}`, `03-opened-guest-policy-[${this.page1.meetingId}]`);

      await this.page1.waitAndClick(e.alwaysDeny);
      await this.page1.screenshot(`${testName}`, `04-clicked-alwaysAccept-[${this.page1.meetingId}]`);
      await this.initUserPage(false, testName);

      const responseLoggedIn = await this.userPage.hasElement(e.joinMeetingDemoPage);
      await this.userPage.screenshot(`${testName}`, `05-after-viewer-gets-denied-[${this.page1.meetingId}]`);
      return responseLoggedIn;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async testWhiteboardAccess() {
    try {
      await this.page1.waitForSelector(e.whiteboard);
      await this.page1.waitAndClick(e.userListItem);
      await this.page1.waitAndClick(e.changeWhiteboardAccess);
      await this.page1.waitForSelector(e.multiWhiteboardTool);
      const resp = await this.page1.page.evaluate((multiWhiteboardTool) => {
        return document.querySelector(multiWhiteboardTool).children[0].innerText === '1';
      }, e.multiWhiteboardTool);
      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  // Raise Hand
  async raiseHandTest() {
    try {
      await this.page2.waitAndClick(e.raiseHandLabel);
      const resp = await this.page2.hasElement(e.lowerHandLabel, true);

      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  // Lower Hand
  async lowerHandTest() {
    try {
      await this.page2.waitAndClick(e.lowerHandLabel);
      await this.page2.waitAndClick(e.lowerHandLabel, ELEMENT_WAIT_TIME, true);
      const resp = await this.page2.hasElement(e.raiseHandLabel, true);

      return resp === true;
    } catch (err) {
      await this.page2.logger(err);
      return false;
    }
  }

  // Get Avatars Colors from Userlist and Notification toast
  async getAvatarColorAndCompareWithUserListItem() {
    try {
      const avatarInToastElementColor = await this.page1.page.$eval(e.avatarsWrapperAvatar, (elem) => getComputedStyle(elem).backgroundColor);
      const avatarInUserListColor = await this.page1.page.$eval(`${e.userListItem} > div ${e.userAvatar}`, (elem) => getComputedStyle(elem).backgroundColor);
      return avatarInToastElementColor === avatarInUserListColor;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async userOfflineWithInternetProblem() {
    try {
      await this.page2.page.evaluate(() => window.dispatchEvent(new CustomEvent('socketstats', { detail: { rtt: 2000 } })));
      await this.page2.page.setOfflineMode(true);
      await this.page2.close();
      await util.connectionStatus(this.page1);
      const connectionStatusItemEmpty = await this.page1.wasRemoved(e.connectionStatusItemEmpty);
      const connectionStatusOfflineUser = await this.page1.hasElement(e.connectionStatusOfflineUser, true, ELEMENT_WAIT_LONGER_TIME);

      return connectionStatusItemEmpty && connectionStatusOfflineUser;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async userlistNotAppearOnMobile() {
    try {
      const userlistPanel = await this.page1.page.evaluate(checkElementLengthEqualTo, e.chatButtonKey, 0);
      const chatPanel = await this.page2.page.evaluate(checkElementLengthEqualTo, e.chatButtonKey, 0);
      return userlistPanel && chatPanel;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async usersConnectionStatus(testName) {
    try {
      await this.page1.shareWebcam(true);
      await this.page1.screenshot(testName, '01-page1-after-share-webcam');
      await this.initUserPage(false, testName);
      await this.userPage.joinMicrophone();
      await this.userPage.screenshot(testName, '02-userPage-after-join-microhpone');
      await this.userPage.shareWebcam(true);
      await this.userPage.screenshot(testName, '03-userPage-after-share-webcam');
      await this.userPage.waitAndClick(e.connectionStatusBtn);
      try {
        await this.userPage.page.waitForFunction(util.checkNetworkStatus, { timeout: ELEMENT_WAIT_TIME },
          e.connectionDataContainer, e.connectionNetwordData
        );
        await this.userPage.screenshot(testName, '04-connection-network-success');
        return true;
      } catch (er) {
        await this.userPage.screenshot(testName, '04-connection-network-failed');
        this.userPage.logger(er);
        return false;
      }
    } catch (err) {
      this.page1.logger(err);
      return false;
    }
  }

  async disableWebcamsFromConnectionStatus() {
    try {
      await this.page1.shareWebcam(true, ELEMENT_WAIT_LONGER_TIME);
      await this.page2.shareWebcam(true, ELEMENT_WAIT_LONGER_TIME);
      await util.connectionStatus(this.page1);
      await this.page1.waitAndClickElement(e.dataSavingWebcams);
      await this.page1.waitAndClickElement(e.closeConnectionStatusModal);
      await this.page1.waitForSelector(e.smallToastMsg);
      const checkUserWhoHasDisabled = await this.page1.page.evaluate(checkElementLengthEqualTo, e.videoContainer, 1);
      const checkSecondUser = await this.page2.page.evaluate(checkElementLengthEqualTo, e.videoContainer, 2);

      return checkUserWhoHasDisabled && checkSecondUser;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async whiteboardNotAppearOnMobile() {
    try {
      await this.page1.waitAndClick(e.userListButton);
      await this.page2.waitAndClick(e.userListButton);
      await this.page2.waitAndClick(e.chatButtonKey);
      const onUserListPanel = await this.page1.wasRemoved(e.minimizePresentation);
      const onChatPanel = await this.page2.wasRemoved(e.minimizePresentation);

      return onUserListPanel && onChatPanel;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async chatPanelNotAppearOnMobile() {
    try {
      await this.page2.waitAndClick(e.userListButton);
      await this.page2.waitAndClick(e.chatButtonKey);
      const whiteboard = await this.page1.page.evaluate(checkElementLengthEqualTo, e.chatButtonKey, 0);
      const onChatPanel = await this.page2.hasElement(e.chatButtonKey, false);

      return whiteboard && onChatPanel;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }
}

module.exports = exports = MultiUsers;