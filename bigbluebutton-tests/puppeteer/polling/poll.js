const Page = require('../core/page');
const e = require('../core/elements');
const util = require('./util');
const { ELEMENT_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { checkElement, checkElementLengthEqualTo, checkElementTextIncludes } = require('../core/util');

class Polling {
  constructor() {
    this.modPage = new Page();
    this.userPage = new Page();
  }

  async initPages(testName) {
    await this.initModPage(testName);
    await this.initUserPage(testName);
  }

  async initModPage(testName) {
    await this.modPage.init(true, true, testName, 'Moderator');
  }

  async initUserPage(testName) {
    await this.userPage.init(false, true, testName, 'Attendee', this.modPage.meetingId);
  }

  async createPoll(testName) {
    try {
      await util.startPoll(this.modPage);
      await this.modPage.screenshot(testName, '01-before-chat-message-send');

      const resp = this.modPage.page.evaluate(checkElementLengthEqualTo, e.pollMenuButton, 1);
      return resp;
    } catch (err) {
      await this.modPage.logger(err);
      return false;
    }
  }

  async pollAnonymous(testName) {
    try {
      await this.modPage.waitForSelector(e.whiteboard);
      await this.modPage.screenshot(testName, '01-before-start-anonymous-poll');
      await util.startPoll(this.modPage, false, true);
      await this.modPage.screenshot(testName, '02-after-start-anonymous-poll');
      await this.modPage.waitForSelector(e.publishPollingLabel);
      await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
      await this.modPage.screenshot(testName, '03-after-receive-answer');
      const resp = !await this.modPage.page.evaluate(checkElement, e.receivedAnswer);

      return resp === true;
    } catch (err) {
      await this.modPage.logger(err);
      return false;
    }
  }

  async quickPoll(testName) {
    try {
      await this.modPage.waitForSelector(e.whiteboard);
      await this.modPage.screenshot(testName, '01-after-close-audio-modal');
      await this.modPage.waitAndClick(e.actions);
      await this.modPage.waitAndClick(e.uploadPresentation);
      await this.modPage.waitForSelector(e.fileUpload);

      const fileUpload = await this.modPage.page.$(e.fileUpload);
      await fileUpload.uploadFile(`${__dirname}/smart-poll-test.pdf`);
      await this.modPage.screenshot(testName, '02-before-upload-presentation');
      await this.modPage.waitAndClick(e.upload);
      await this.modPage.page.waitForFunction(checkElementTextIncludes,
        { timeout: ELEMENT_WAIT_LONGER_TIME },
        'body', 'Current presentation'
      );

      await this.modPage.waitAndClick(e.quickPoll);
      await this.modPage.screenshot(testName, '03-after-start-quick-poll');
      await this.modPage.waitForSelector(e.pollMenuButton);
      const resp = await this.userPage.hasElement(e.pollingContainer);
      await this.userPage.screenshot(testName, '04-userPage-after-poll-created');

      return resp === true;
    } catch (err) {
      await this.modPage.logger(err);
      return false;
    }
  }

  async stopPoll(testName) {
    try {
      await this.modPage.waitForSelector(e.whiteboard);
      await this.modPage.screenshot(testName, '01-after-close-audio-modal');
      await util.startPoll(this.modPage);
      await this.modPage.screenshot(testName, '02-after-create-poll');
      await this.userPage.waitForSelector(e.pollingContainer);
      await this.userPage.screenshot(testName, '03-userPage-after-receive-polling-options');

      await this.modPage.waitAndClick(e.closePollingMenu);
      const resp = await this.userPage.wasRemoved(e.pollingContainer);

      return resp === true;
    } catch (err) {
      await this.modPage.logger(err);
      return false;
    }
  }

  async pollResultsOnChat(testName) {
    try {
      await this.modPage.screenshot(testName, '01-before-chat-message-send');
      await util.startPoll(this.modPage, true);
      await this.modPage.waitAndClick(e.chatButton);

      // Check poll result message
      const resp = await this.modPage.hasElement(e.chatPollMessageText);

      return resp === true;
    } catch (err) {
      await this.modPage.logger(err);
      return false;
    }
  }

  async pollResultsOnWhiteboard(testName) {
    try {
      await this.modPage.waitForSelector(e.whiteboard);
      await this.modPage.screenshot(testName, '01-before-start-poll');
      await util.startPoll(this.modPage, true);

      // Check poll result on whiteboard
      const resp = await this.modPage.hasElement(e.pollResults);

      return resp === true;
    } catch (err) {
      await this.modPage.logger(err);
      return false;
    }
  }

  async randomPoll(testName) {
    try {
      await this.modPage.startRecording(testName);
      await this.userPage.startRecording(testName);

      await this.modPage.waitAndClick(e.actions);
      await this.modPage.waitAndClick(e.polling);
      await this.modPage.waitForSelector(e.pollQuestionArea);
      await this.modPage.page.focus(e.pollQuestionArea);
      await this.modPage.page.keyboard.type(e.pollQuestion);

      const chosenRandomNb = await this.modPage.page.evaluate((responseTypes) => {
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
          await this.modPage.waitForSelector(e.responseChoices);
          await this.modPage.waitAndClick(e.addItem);
          await this.modPage.waitAndClick(e.pollOptionItem);
          await this.modPage.tab(2);
          await this.modPage.page.keyboard.type(customs[0]);
          break;

        case 1:
          // Deleting a poll option
          await this.modPage.waitForSelector(e.deletePollOption);
          await this.modPage.clickNItem(e.deletePollOption, customs[1]);
          break;

        case 2:
          // Editing a poll option
          await this.modPage.waitForSelector(e.responseChoices);
          await this.modPage.clickNItem(e.pollOptionItem, 2);
          await this.modPage.hold('Control');
          await this.modPage.press('KeyA');
          await this.modPage.release('Control');
          await this.modPage.page.keyboard.type(customs[2]);
          await this.modPage.tab(1);
          break;

        case 3:
          // Do nothing to let Users write their single response answer
          await this.modPage.waitForSelector(e.responseChoices);
          break;
      }
      const condition = chosenRandomNb === 0 || chosenRandomNb === 1 || chosenRandomNb === 2;
      await this.modPage.waitAndClick(e.startPoll);
      await this.userPage.waitForSelector(e.pollingContainer);
      switch (condition) {
        case true:
          await this.userPage.clickNItem(e.pollAnswerOptionBtn, 2);
          break;
        case false:
          await this.userPage.page.focus(e.pollAnswerOptionInput);
          await this.userPage.page.keyboard.type(customs[3]);
          await this.userPage.waitAndClick(e.pollSubmitAnswer);
          break;
      }
      const receivedAnswerFound = await this.modPage.hasElement(e.receivedAnswer, true);
      await this.modPage.waitAndClick(e.publishPollingLabel, ELEMENT_WAIT_TIME, true);
      await this.modPage.waitForSelector(e.restartPoll);
      const isPollResultsPublished = await this.modPage.hasElement(e.pollResults, true);
      return receivedAnswerFound && isPollResultsPublished;
    } catch (err) {
      await this.modPage.logger(err);
      return false;
    }
  }
}

module.exports = exports = Polling;
