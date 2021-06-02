const Page = require('../core/page');
const params = require('../params');
const util = require('../chat/util');
const utilUser = require('./util');
const utilCustomParams = require('../customparameters/util');
const pe = require('../core/elements');
const ne = require('../notifications/elements');
const ple = require('../polling/elemens');
const we = require('../whiteboard/elements');
const ue = require('./elements');
const cu = require('../customparameters/elements');
const pre = require('../presentation/elements');
const { ELEMENT_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { sleep } = require('../core/helper');

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
    const firstCheck = await this.page1.page.evaluate(() => document.querySelectorAll('[data-test="userListItem"]').length > 0);
    const secondCheck = await this.page2.page.evaluate(() => document.querySelectorAll('[data-test="userListItem"]').length > 0);
    return {
      firstCheck,
      secondCheck,
    };
  }

  async multiUsersPublicChat() {
    const chat0 = await this.page1.page.evaluate(() => document.querySelectorAll('p[data-test="chatUserMessageText"]').length);
    await util.sendPublicChatMessage(this.page1, this.page2);
    const chat1 = await this.page1.page.evaluate(() => document.querySelectorAll('p[data-test="chatUserMessageText"]').length);
    return chat0 !== chat1;
  }

  async multiUsersPrivateChat() {
    await util.openPrivateChatMessage(this.page1, this.page2);
    const chat0 = await this.page1.page.evaluate(() => document.querySelectorAll('p[data-test="chatUserMessageText"]').length);
    await util.sendPrivateChatMessage(this.page1, this.page2);
    await sleep(2000);
    const chat1 = await this.page1.page.evaluate(() => document.querySelectorAll('p[data-test="chatUserMessageText"]').length);
    return chat0 !== chat1;
  }

  async test() {
    const checks = await this.checkForOtherUser();
    return checks.firstCheck !== false && checks.secondCheck !== false;
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

      const chosenRandomNb = await this.page1.page.evaluate(() => {
        const responseTypesDiv = document.querySelector('div[data-test="responseTypes"]');
        const buttons = responseTypesDiv.querySelectorAll('button');
        const countButtons = buttons.length;
        const randomNb = Math.floor(Math.random() * countButtons) + 1;
        const chosenRandomNb = randomNb - 1;
        responseTypesDiv.querySelectorAll('button')[chosenRandomNb].click();
        return chosenRandomNb;
      });

      const customs = {
        0: ple.uncertain,
        1: 0,
        2: 'ABSTENTION',
        3: 'All good!',
      };
      switch (chosenRandomNb) {
        case 0:
          // Adding a poll option
          console.log({ chosenRandomNb }, ' <= True / False');
          await this.page1.waitForSelector(ple.responseChoices, ELEMENT_WAIT_TIME);
          await this.page1.waitForSelector(ple.addItem, ELEMENT_WAIT_TIME);
          await this.page1.click(ple.addItem, true);
          await this.page1.click(ple.pollOptionItem, true);
          await this.page1.tab(2);
          await this.page1.page.keyboard.type(customs[0]);
          break;

        case 1:
          // Deleting a poll option
          console.log({ chosenRandomNb }, ' <= A / B / C / D');
          await this.page1.waitForSelector(ple.deletePollOption, ELEMENT_WAIT_TIME);
          await this.page1.clickNItem(ple.deletePollOption, true, customs[1]);
          break;

        case 2:
          // Editing a poll option
          console.log({ chosenRandomNb }, ' <= Yes / No / Abstention');
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
          console.log({ chosenRandomNb }, ' <= User Response');
          await this.page1.waitForSelector(ple.responseChoices, ELEMENT_WAIT_TIME);
          await sleep(2000);
          break;
      }
      const condition = chosenRandomNb === 0 || chosenRandomNb === 1 || chosenRandomNb === 2;
      await this.page1.waitForSelector(ple.startPoll, ELEMENT_WAIT_TIME);
      await this.page1.click(ple.startPoll, true);
      await this.page2.waitForSelector(ple.pollingContainer, ELEMENT_WAIT_TIME);
      console.log({ condition });
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
      await sleep(2000);
      const receivedAnswerFound = await this.page1.page.evaluate(utilCustomParams.countTestElements, ple.receivedAnswer);
      await sleep(2000);
      return receivedAnswerFound;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async testWhiteboardAccess() {
    await this.page1.closeAudioModal();
    await this.page2.closeAudioModal();
    await this.page3.closeAudioModal();
    await this.page1.waitForSelector(we.whiteboard, ELEMENT_WAIT_TIME);
    await this.page1.clickNItem(we.userListItem, true, 1);
    await this.page1.clickNItem(we.changeWhiteboardAccess, true, 1);
    await sleep(2000);
    const resp = await this.page1.page.evaluate(async () => await document.querySelector('[data-test="multiWhiteboardTool"]').children[0].innerText === '1');
    return resp;
  }

  // Raise Hand
  async raiseHandTest() {
    await this.page1.closeAudioModal();
    await this.page2.closeAudioModal();
    await this.page2.waitForSelector(we.raiseHandLabel, ELEMENT_WAIT_TIME);
    await this.page2.click(we.raiseHandLabel, true);
    await sleep(2000);
    const resp = await this.page2.page.evaluate(utilCustomParams.countTestElements, we.lowerHandLabel);
    return resp;
  }

  // Lower Hand
  async lowerHandTest() {
    await this.page2.waitForSelector(we.lowerHandLabel, ELEMENT_WAIT_TIME);
    await this.page2.click(we.lowerHandLabel, true);
    await sleep(2000);
    const resp = await this.page2.page.evaluate(utilCustomParams.countTestElements, we.raiseHandLabel);
    return resp;
  }

  // Get Avatars Colors from Userlist and Notification toast
  async getAvatarColorAndCompareWithUserListItem() {
    const avatarInToastElementColor = await this.page1.page.$eval(we.avatarsWrapperAvatar, (elem) => getComputedStyle(elem).backgroundColor);
    const avatarInUserListColor = await this.page1.page.$eval('[data-test="userListItem"] > div [data-test="userAvatar"]', (elem) => getComputedStyle(elem).backgroundColor);
    return avatarInToastElementColor === avatarInUserListColor;
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
      const connectionStatusItemEmpty = await this.page1.page.evaluate(utilUser.countTestElements, ue.connectionStatusItemEmpty) === false;
      const connectionStatusOfflineUser = await this.page1.page.evaluate(utilUser.countTestElements, ue.connectionStatusOfflineUser) === true;
      return connectionStatusOfflineUser && connectionStatusItemEmpty;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async userlistNotAppearOnMobile() {
    try {
      await this.page1.closeAudioModal();
      await this.page2.closeAudioModal();
      const userlistPanel = await this.page1.page.evaluate(utilUser.countTestElements, ue.chatButton) === false;
      const chatPanel = await this.page2.page.evaluate(utilUser.countTestElements, ue.chatButton) === false;
      return userlistPanel && chatPanel;
    } catch (e) {
      console.log(e);
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
      const onChatPanel = await this.page2.page.evaluate(utilUser.countTestElements, cu.hidePresentation) === false;
      console.log({onUserListPanel, onChatPanel});
      await sleep(2000);
      return onUserListPanel && onChatPanel;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async chatPanelNotAppearOnMobile() {
    try {
      await this.page1.closeAudioModal();
      await this.page2.closeAudioModal();
      await this.page2.click(ue.userListButton, true);
      await this.page2.click(ue.chatButton, true);
      const whiteboard = await this.page1.page.evaluate(utilUser.countTestElements, ue.chatButton) === false;
      const onChatPanel = await this.page2.isNotVisible(ue.chatButton, ELEMENT_WAIT_TIME) === true;
      console.log({whiteboard, onChatPanel});
      await sleep(2000);
      return whiteboard && onChatPanel;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  // Close all Pages
  async close(page1, page2) {
    await page1.close();
    await page2.close();
  }

  async closePage(page) {
    await page.close();
  }
}

module.exports = exports = MultiUsers;
