const Page = require('../core/page');
const params = require('../params');
const util = require('../chat/util');
const utilUser = require('./util');
const pe = require('../core/elements');
const ne = require('../notifications/elements');
const ple = require('../polling/elemens');
const we = require('../whiteboard/elements');
const ue = require('./elements');
const ce = require('../chat/elements');
const cu = require('../customparameters/elements');
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
    const firstCheck = await this.page1.page.evaluate(getElementLength, ue.userListItem) > 0;
    const secondCheck = await this.page1.page.evaluate(getElementLength, ue.userListItem) > 0;
    return {
      firstCheck,
      secondCheck,
    };
  }

  async multiUsersPublicChat() {
    try {
      const chat0 = await this.page1.page.evaluate(getElementLength, ce.chatUserMessageText);
      await util.sendPublicChatMessage(this.page1, this.page2);
      const chat1 = await this.page1.page.evaluate(getElementLength, ce.chatUserMessageText);
      return chat0 !== chat1;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async multiUsersPrivateChat() {
    try {
      await util.openPrivateChatMessage(this.page1, this.page2);
      const chat0 = await this.page1.page.evaluate(getElementLength, ce.chatUserMessageText);
      await util.sendPrivateChatMessage(this.page1, this.page2);
      await sleep(2000);
      const chat1 = await this.page1.page.evaluate(getElementLength, ce.chatUserMessageText);
      return chat0 !== chat1;
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
      await this.page1.waitForSelector(pe.actions, ELEMENT_WAIT_TIME);
      await this.page1.click(pe.actions, true);
      await this.page1.waitForSelector(ne.polling, ELEMENT_WAIT_TIME);
      await this.page1.click(ne.polling, true);
      await this.page1.waitForSelector(ple.pollQuestionArea, ELEMENT_WAIT_TIME);
      await this.page1.page.focus(ple.pollQuestionArea);
      await this.page1.page.keyboard.type(ple.pollQuestion);

      const chosenRandomNb = await this.page1.page.evaluate((responseTypes) => {
        const responseTypesDiv = document.querySelector(responseTypes);
        const buttons = responseTypesDiv.querySelectorAll('button');
        const countButtons = buttons.length;
        const randomNb = Math.floor(Math.random() * countButtons) + 1;
        const chosenRandomNb = randomNb - 1;
        responseTypesDiv.querySelectorAll('button')[chosenRandomNb].click();
        return chosenRandomNb;
      }, ple.responseTypes);

      const customs = {
        0: ple.uncertain,
        1: 0,
        2: 'ABSTENTION',
        3: 'All good!',
      };
      switch (chosenRandomNb) {
        case 0:
          // Adding a poll option
          await this.page1.waitForSelector(ple.responseChoices, ELEMENT_WAIT_TIME);
          await this.page1.waitForSelector(ple.addItem, ELEMENT_WAIT_TIME);
          await this.page1.click(ple.addItem, true);
          await this.page1.click(ple.pollOptionItem, true);
          await this.page1.tab(2);
          await this.page1.page.keyboard.type(customs[0]);
          break;

        case 1:
          // Deleting a poll option
          await this.page1.waitForSelector(ple.deletePollOption, ELEMENT_WAIT_TIME);
          await this.page1.clickNItem(ple.deletePollOption, true, customs[1]);
          break;

        case 2:
          // Editing a poll option
          await this.page1.waitForSelector(ple.responseChoices, ELEMENT_WAIT_TIME);
          await this.page1.clickNItem(ple.pollOptionItem, true, 2);
          await this.page1.hold('Control');
          await this.page1.press('KeyA');
          await this.page1.release('Control');
          await this.page1.page.keyboard.type(customs[2]);
          await this.page1.tab(1);
          break;

        case 3:
          // Do nothing to let Users write their single response answer
          await this.page1.waitForSelector(ple.responseChoices, ELEMENT_WAIT_TIME);
          await sleep(2000);
          break;
      }
      const condition = chosenRandomNb === 0 || chosenRandomNb === 1 || chosenRandomNb === 2;
      await this.page1.waitForSelector(ple.startPoll, ELEMENT_WAIT_TIME);
      await this.page1.click(ple.startPoll, true);
      await this.page2.waitForSelector(ple.pollingContainer, ELEMENT_WAIT_TIME);
      switch (condition) {
        case true:
          await this.page2.clickNItem(ple.pollAnswerOptionBtn, true, 2);
          break;
        case false:
          await this.page2.page.focus(ple.pollAnswerOptionInput);
          await this.page2.page.keyboard.type(customs[3]);
          await this.page2.waitForSelector(ple.pollSubmitAnswer, ELEMENT_WAIT_TIME);
          await this.page2.click(ple.pollSubmitAnswer, true);
          break;
      }
      await this.page1.waitForSelector(ple.publishLabel, ELEMENT_WAIT_TIME);
      await this.page1.click(ple.publishLabel, true);
      await this.page1.waitForSelector(ple.restartPoll, ELEMENT_WAIT_TIME);
      const receivedAnswerFound = await this.page1.page.evaluate(checkElementLengthDifferentTo, ple.receivedAnswer, 0);
      return receivedAnswerFound;
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
      await this.page1.waitForSelector(we.whiteboard, ELEMENT_WAIT_TIME);
      await this.page1.clickNItem(we.userListItem, true, 1);
      await this.page1.clickNItem(we.changeWhiteboardAccess, true, 1);
      await sleep(2000);
      const resp = await this.page1.page.evaluate((multiWhiteboardTool) => {
        return document.querySelector(multiWhiteboardTool).children[0].innerText === '1';
      }, ue.multiWhiteboardTool);
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
      await this.page2.waitForSelector(we.raiseHandLabel, ELEMENT_WAIT_TIME);
      await this.page2.click(we.raiseHandLabel, true);
      await sleep(2000);
      const resp = await this.page2.page.evaluate(checkElementLengthDifferentTo, we.lowerHandLabel, 0);
      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  // Lower Hand
  async lowerHandTest() {
    try {
      await this.page2.waitForSelector(we.lowerHandLabel, ELEMENT_WAIT_TIME);
      await this.page2.click(we.lowerHandLabel, true);
      await sleep(2000);
      const resp = await this.page2.page.evaluate(checkElementLengthDifferentTo, we.raiseHandLabel, 0);
      return resp === true;
    } catch (err) {
      await this.page2.logger(err);
      return false;
    }
  }

  // Get Avatars Colors from Userlist and Notification toast
  async getAvatarColorAndCompareWithUserListItem() {
    try {
      const avatarInToastElementColor = await this.page1.page.$eval(we.avatarsWrapperAvatar, (elem) => getComputedStyle(elem).backgroundColor);
      const avatarInUserListColor = await this.page1.page.$eval(`${ue.userListItem} > div ${ue.statusIcon}`, (elem) => getComputedStyle(elem).backgroundColor);
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
      await sleep(3000);
      await this.page2.close();
      await sleep(5000);
      await utilUser.connectionStatus(this.page1);
      await sleep(5000);
      const connectionStatusItemEmpty = await this.page1.page.evaluate(checkElementLengthEqualTo, ue.connectionStatusItemEmpty, 0);
      const connectionStatusOfflineUser = await this.page1.page.evaluate(checkElementLengthDifferentTo, ue.connectionStatusOfflineUser, 0) === true;
      return connectionStatusOfflineUser && connectionStatusItemEmpty;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async userlistNotAppearOnMobile() {
    try {
      await this.page1.closeAudioModal();
      await this.page2.closeAudioModal();
      const userlistPanel = await this.page1.page.evaluate(checkElementLengthEqualTo, ue.chatButton, 0);
      const chatPanel = await this.page2.page.evaluate(checkElementLengthEqualTo, ue.chatButton, 0);
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
      await this.page1.click(ue.userListButton, true);
      await this.page2.click(ue.userListButton, true);
      await this.page2.click(ue.chatButton, true);
      const onUserListPanel = await this.page1.isNotVisible(cu.hidePresentation, ELEMENT_WAIT_TIME) === true;
      const onChatPanel = await this.page2.page.evaluate(checkElementLengthEqualTo, cu.hidePresentation, 0);
      await sleep(2000);
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
      await this.page2.click(ue.userListButton, true);
      await this.page2.click(ue.chatButton, true);
      const whiteboard = await this.page1.page.evaluate(checkElementLengthEqualTo, ue.chatButton, 0);
      const onChatPanel = await this.page2.isNotVisible(ue.chatButton, ELEMENT_WAIT_TIME) === true;
      await sleep(2000);
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
