const Page = require('../core/page');
const params = require('../params');
const util = require('../chat/util');
const pe = require('../core/elements');
const ne = require('../notifications/elements');
const ple = require('../polling/elemens');
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
        // const chosenRandomNb = 1;
        const chosenRandomNb = randomNb - 1;
        responseTypesDiv.querySelectorAll('button')[chosenRandomNb].click();
        return chosenRandomNb;
      });
      switch (chosenRandomNb) {
        case 0:
          console.log({ chosenRandomNb }, ' <= True / False');
          await this.page1.waitForSelector(ple.responseChoices, ELEMENT_WAIT_TIME);
          await this.page1.waitForSelector(ple.addItem, ELEMENT_WAIT_TIME);
          await this.page1.click(ple.addItem, true);
          await this.page1.click(ple.pollOptionItem, true);
          await this.page1.tab(2);
          await this.page1.page.keyboard.type(ple.uncertain);
          break;

        case 1:
          console.log({ chosenRandomNb }, ' <= A / B / C / D');
          await this.page1.page.evaluate(() => {
            const responseChoices = document.querySelector('div[data-test="responseChoices"]');
            responseChoices.querySelectorAll('button[data-test="deletePollOption"]')[0].click();
          });
          await this.page1.waitForSelector(ple.deletePollOption, ELEMENT_WAIT_TIME);
          await this.page1.click(ple.deletePollOption, true);
          break;

        case 2:
          console.log({ chosenRandomNb }, ' <= Yes / No / Abstention');
          break;

        case 3:
          console.log({ chosenRandomNb }, ' <= User Response');
          break;
      }
      await this.page1.waitForSelector(ple.startPoll, ELEMENT_WAIT_TIME);
      await this.page1.click(ple.startPoll, true);
      await this.page2.waitForSelector(ple.pollingContainer, ELEMENT_WAIT_TIME);
      await this.page2.waitForSelector(ple.pollAnswerOption, ELEMENT_WAIT_TIME);
      await this.page2.click(ple.pollAnswerOption, true);
      await this.page1.waitForSelector(ple.publishLabel, ELEMENT_WAIT_TIME);
      await this.page1.click(ple.publishLabel, true);
      await sleep(3000);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }

    await sleep(50000);
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
