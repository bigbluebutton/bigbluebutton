const Page = require('../core/page');
const e = require('../core/elements');
const util = require('./util');
const utilPresentation = require('../presentation/util');
const { ELEMENT_WAIT_TIME } = require('../core/constants');
const { checkElement, checkElementText, checkElementLengthEqualTo, getElementLength } = require('../core/util');

class Polling {
  constructor() {
    this.modPage = new Page();
    this.userPage = new Page();
    this.newInputText = 'new option';
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

      await utilPresentation.uploadPresentation(this.modPage, e.questionSlideFileName);

      await this.modPage.waitAndClick(e.quickPoll);
      await this.modPage.screenshot(testName, '02-after-start-quick-poll');
      await this.modPage.waitForSelector(e.pollMenuButton);
      const resp = await this.userPage.hasElement(e.pollingContainer);
      await this.userPage.screenshot(testName, '03-userPage-after-poll-created');

      return resp === true;
    } catch (err) {
      await this.modPage.logger(err);
      return false;
    }
  }

  async pollUserResponse(testName) {
    try {
      await this.modPage.waitForSelector(e.whiteboard);
      await this.modPage.screenshot(testName, '01-after-close-audio-modal');
      await util.openPoll(this.modPage);

      await this.modPage.type(e.pollQuestionArea, e.pollQuestion);
      await this.modPage.waitAndClick(e.userResponseBtn);
      await this.modPage.screenshot(testName, '02-before-start-poll');
      await this.modPage.waitAndClick(e.startPoll);

      await this.userPage.waitForSelector(e.pollingContainer);
      await this.userPage.type(e.pollAnswerOptionInput, e.answerMessage);
      await this.userPage.screenshot(testName, '03-userPage-before-submit-answer');
      await this.userPage.waitAndClick(e.pollSubmitAnswer);
      try {
        await this.modPage.page.waitForFunction(checkElementText,
          { timeout: ELEMENT_WAIT_TIME },
          e.receivedAnswer, e.answerMessage
        );
        await this.modPage.screenshot(testName, '04-success-to-receive-answer');
      } catch (er) {
        await this.modPage.screenshot(testName, '04-failed-to-receive-answer');
        await this.modPage.logger(er);
        return false;
      }

      await this.modPage.waitAndClick(e.publishPollingLabel);
      await this.modPage.waitForSelector(e.restartPoll);
      const isPollResultsPublished = await this.modPage.hasElement(e.pollResults);

      return isPollResultsPublished === true;
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

  async pollResultsInDifferentPresentation(testName) {
    try {
      await this.modPage.waitForSelector(e.whiteboard);
      await this.modPage.screenshot(testName, '01-before-start-poll');
      await util.startPoll(this.modPage);
      await this.modPage.screenshot(testName, '02-after-start-poll');

      await utilPresentation.uploadPresentation(this.modPage, e.questionSlideFileName);
      await this.modPage.screenshot(testName, '03-after-upload-presentation');
      await this.modPage.waitAndClick(e.publishPollingLabel);

      // Check poll results
      const resp = await this.modPage.hasElement(e.pollResults);

      return resp === true;
    } catch (err) {
      await this.modPage.logger(err);
      return false;
    }
  }

  async manageResponseChoices(testName) {
    try {
      await this.modPage.waitForSelector(e.whiteboard);
      await this.modPage.screenshot(testName, '01-after-close-audio-modal');
      await this.startNewPoll();
      await this.modPage.screenshot(testName, '02-after-open-polling-menu');
      const initialRespCount = await this.modPage.page.evaluate(getElementLength, e.pollOptionItem);

      // Add
      await this.modPage.waitAndClick(e.addPollItem);
      await this.typeOnLastChoiceInput();
      await this.modPage.screenshot(testName, '03-after-add-option');
      await this.modPage.waitAndClick(e.startPoll);
      await this.userPage.screenshot(testName, '03-userPage-options-after-add');

      const optionWasAdded = (initialRespCount + 1 == await this.getAnswerOptionCount()) && await this.checkLastOptionText();
      if (!optionWasAdded) {
        await this.modPage.logger('Cannot add choice option');
        return false;
      }

      // Delete
      await this.startNewPoll();
      await this.modPage.waitAndClick(e.deletePollOption);
      await this.modPage.screenshot(testName, '04-after-delete-option');
      await this.modPage.waitAndClick(e.startPoll);
      await this.userPage.screenshot(testName, '04-userPage-options-after-delete');

      const optionWasRemoved = initialRespCount - 1 == await this.getAnswerOptionCount();
      if (!optionWasRemoved) {
        await this.modPage.logger('Cannot delete choice option');
        return false;
      }

      // Edit
      await this.startNewPoll();
      await this.typeOnLastChoiceInput();
      await this.modPage.screenshot(testName, '05-after-edit-option');
      await this.modPage.waitAndClick(e.startPoll);
      await this.userPage.screenshot(testName, '05-userPage-options-after-edit');

      const optionWasEdited = (initialRespCount == await this.getAnswerOptionCount()) && await this.checkLastOptionText();
      if (!optionWasEdited) {
        await this.modPage.logger('Cannot edit choice option');
        return false;
      }

      return true;
    } catch (err) {
      await this.modPage.logger(err);
      return false;
    }
  }

  async startNewPoll() {
    const hasPollStarted = await this.modPage.page.evaluate(checkElement, e.pollMenuButton);
    if (hasPollStarted) {
      await this.modPage.waitAndClick(e.closePollingMenu);
      await this.userPage.waitForElementHandleToBeRemoved(e.pollingContainer);
    }
    await util.openPoll(this.modPage);
  }

  async getAnswerOptionCount() {
    await this.userPage.waitForSelector(e.pollingContainer);
    return this.userPage.page.evaluate(getElementLength, e.pollAnswerOptionBtn);
  }

  async typeOnLastChoiceInput() {
    const allInputs = await this.modPage.page.$$(e.pollOptionItem);
    const lastInput = allInputs[allInputs.length - 1];
    await this.modPage.page.evaluate(el => el.value = '', lastInput);
    await lastInput.type(this.newInputText);
  }

  async checkLastOptionText() {
    await this.userPage.waitForSelector(e.pollingContainer);
    const answerOptions = await this.userPage.page.$$(e.pollAnswerOptionBtn);
    const lastOptionText = await this.userPage.page.evaluate(el => el.textContent, answerOptions[answerOptions.length - 1]);
    return lastOptionText == this.newInputText;
  }
}

module.exports = exports = Polling;
