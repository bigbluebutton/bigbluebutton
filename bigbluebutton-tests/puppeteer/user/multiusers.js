const Page = require('../core/page');
const params = require('../params');
const util = require('../chat/util');
const utilUser = require('./util');
const e = require('../core/elements');
const { ELEMENT_WAIT_TIME } = require('../core/constants');
const { sleep } = require('../core/helper');
const { getElementLength, checkElementLengthEqualTo, checkElementLengthDifferentTo } = require('../core/util');

class MultiUsers {
  constructor() {
    this.page1 = new Page();
    this.page2 = new Page();
    this.page3 = new Page();
  }

  // Join BigBlueButton meeting
  async init(meetingId, testFolderName) {
    await this.page1.init(Page.getArgs(), meetingId, params, undefined, testFolderName);
    await this.page2.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'User2' }, undefined, testFolderName);
  }

  // Join BigBlueButton meeting
  async initUser3(testFolderName) {
    await this.page3.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'User3' }, undefined, testFolderName);
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

  async multiUsersPublicChat() {
    try {
      const chat0 = await this.page1.page.evaluate(getElementLength, e.chatUserMessageText);
      await util.sendPublicChatMessage(this.page1, this.page2);
      const chat1 = await this.page1.page.evaluate(getElementLength, e.chatUserMessageText);
      return chat0 !== chat1;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async multiUsersPrivateChat() {
    try {
      await util.openPrivateChatMessage(this.page1, this.page2);
      const chat0 = await this.page1.page.evaluate(checkElementLengthEqualTo, e.chatUserMessageText, 0);

      await util.sendPrivateChatMessage(this.page1, this.page2);
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

  async randomPoll(testName) {
    try {
      await this.page1.startRecording(testName);
      await this.page1.closeAudioModal();
      await this.page2.startRecording(testName);
      await this.page2.closeAudioModal();
      await this.page1.waitAndClick(e.actions);
      await this.page1.waitAndClick(e.polling);
      await this.page1.waitForSelector(e.pollQuestionArea);
      await this.page1.page.focus(e.pollQuestionArea);
      await this.page1.page.keyboard.type(e.pollQuestion);

      const chosenRandomNb = await this.page1.page.evaluate((responseTypes) => {
        const responseTypesDiv = document.querySelector(responseTypes);
        const buttons = responseTypesDiv.querySelectorAll('button');
        const countButtons = buttons.length;
        const randomNb = Math.floor(Math.random() * countButtons) + 1;
        const chosenRandomNb = randomNb - 1;
        responseTypesDiv.querySelectorAll('button')[chosenRandomNb].click();
        return chosenRandomNb;
      }, e.responseTypes);

      const customs = {
        0: e.uncertain,
        1: 0,
        2: 'ABSTENTION',
        3: 'All good!',
      };
      switch (chosenRandomNb) {
        case 0:
          // Adding a poll option
          await this.page1.waitForSelector(e.responseChoices);
          await this.page1.waitAndClick(e.addItem);
          await this.page1.waitAndClick(e.pollOptionItem);
          await this.page1.tab(2);
          await this.page1.page.keyboard.type(customs[0]);
          break;

        case 1:
          // Deleting a poll option
          await this.page1.waitForSelector(e.deletePollOption);
          await this.page1.clickNItem(e.deletePollOption, true, customs[1]);
          break;

        case 2:
          // Editing a poll option
          await this.page1.waitForSelector(e.responseChoices);
          await this.page1.clickNItem(e.pollOptionItem, true, 2);
          await this.page1.hold('Control');
          await this.page1.press('KeyA');
          await this.page1.release('Control');
          await this.page1.page.keyboard.type(customs[2]);
          await this.page1.tab(1);
          break;

        case 3:
          // Do nothing to let Users write their single response answer
          await this.page1.waitForSelector(e.responseChoices);
          break;
      }
      const condition = chosenRandomNb === 0 || chosenRandomNb === 1 || chosenRandomNb === 2;
      await this.page1.waitAndClick(e.startPoll);
      await this.page2.waitForSelector(e.pollingContainer);
      switch (condition) {
        case true:
          await this.page2.clickNItem(e.pollAnswerOptionBtn, false, 2);
          break;
        case false:
          await this.page2.page.focus(e.pollAnswerOptionInput);
          await this.page2.page.keyboard.type(customs[3]);
          await this.page2.waitAndClick(e.pollSubmitAnswer);
          break;
      }
      const receivedAnswerFound = await this.page1.hasElement(e.receivedAnswer, true);
      await this.page1.waitAndClick(e.publishLabel, ELEMENT_WAIT_TIME, true);
      await this.page1.waitForSelector(e.restartPoll);
      const isPollResultsPublished = await this.page1.hasElement(e.pollResults, true);
      return receivedAnswerFound && isPollResultsPublished;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async testWhiteboardAccess() {
    try {
      await this.page1.closeAudioModal();
      await this.page2.closeAudioModal();
      await this.page3.closeAudioModal();
      await this.page1.waitForSelector(e.whiteboard);
      await this.page1.clickNItem(e.userListItem, true, 1);
      await this.page1.clickNItem(e.changeWhiteboardAccess, true, 1);
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
      await this.page1.closeAudioModal();
      await this.page2.closeAudioModal();
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
      await this.page1.closeAudioModal();
      await this.page2.closeAudioModal();
      await this.page2.page.evaluate(() => window.dispatchEvent(new CustomEvent('socketstats', { detail: { rtt: 2000 } })));
      await this.page2.page.setOfflineMode(true);
      await this.page2.close();
      await utilUser.connectionStatus(this.page1);
      const connectionStatusItemEmpty = await this.page1.wasRemoved(e.connectionStatusItemEmpty);
      const connectionStatusOfflineUser = await this.page1.hasElement(e.connectionStatusOfflineUser, true);

      return connectionStatusItemEmpty && connectionStatusOfflineUser;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async userlistNotAppearOnMobile() {
    try {
      await this.page1.closeAudioModal();
      await this.page2.closeAudioModal();
      const userlistPanel = await this.page1.page.evaluate(checkElementLengthEqualTo, e.chatButtonKey, 0);
      const chatPanel = await this.page2.page.evaluate(checkElementLengthEqualTo, e.chatButtonKey, 0);
      return userlistPanel && chatPanel;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async whiteboardNotAppearOnMobile() {
    try {
      await this.page1.closeAudioModal();
      await this.page2.closeAudioModal();
      await this.page1.waitAndClick(e.userListButton);
      await this.page2.waitAndClick(e.userListButton);
      await this.page2.waitAndClick(e.chatButtonKey);
      const onUserListPanel = await this.page1.isNotVisible(e.hidePresentation);
      const onChatPanel = await this.page2.isNotVisible(e.hidePresentation);

      return onUserListPanel && onChatPanel;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async chatPanelNotAppearOnMobile() {
    try {
      await this.page1.closeAudioModal();
      await this.page2.closeAudioModal();
      await this.page2.waitAndClick(e.userListButton);
      await this.page2.waitAndClick(e.chatButtonKey);
      const whiteboard = await this.page1.page.evaluate(checkElementLengthEqualTo, e.chatButtonKey, 0);
      const onChatPanel = await this.page2.isNotVisible(e.chatButtonKey);

      return whiteboard && onChatPanel;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  // Close all Pages
  async close(page1, page2) {
    try {
      await page1.close();
      await page2.close();
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async closePage(page) {
    try {
      await page.close();
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }
}

module.exports = exports = MultiUsers;
