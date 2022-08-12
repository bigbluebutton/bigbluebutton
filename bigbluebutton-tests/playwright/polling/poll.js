const { expect, test } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const util = require('./util.js');
const utilPresentation = require('../presentation/util');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { getSettings } = require('../core/settings');
const { waitAndClearDefaultPresentationNotification } = require('../notifications/util');

class Polling extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
    this.newInputText = 'new option';
  }

  async createPoll() {
    await util.startPoll(this.modPage);
    await this.modPage.hasElement(e.pollMenuButton);
  }

  async pollAnonymous() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await util.startPoll(this.modPage, false, true);
    await this.modPage.waitForSelector(e.publishPollingLabel);
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.userPage.wasRemoved(e.receivedAnswer);
  }

  async quickPoll() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await utilPresentation.uploadSinglePresentation(this.modPage, e.questionSlideFileName);

    // The slide needs to be uploaded and converted, so wait a bit longer for this step
    await this.modPage.waitAndClick(e.quickPoll, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitForSelector(e.pollMenuButton);

    await this.userPage.hasElement(e.pollingContainer);
  }

  async pollUserResponse() {
    await this.modPage.waitForSelector(e.whiteboard);
    await util.openPoll(this.modPage);

    await this.modPage.type(e.pollQuestionArea, e.pollQuestion);
    await this.modPage.waitAndClick(e.userResponseBtn);
    await this.modPage.waitAndClick(e.startPoll);

    await this.userPage.waitForSelector(e.pollingContainer);
    await this.userPage.type(e.pollAnswerOptionInput, e.answerMessage);
    await this.userPage.waitAndClick(e.pollSubmitAnswer);

    await this.modPage.hasText(e.receivedAnswer, e.answerMessage);

    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.waitForSelector(e.restartPoll);

    await this.modPage.hasElement(e.pollResults);
  }

  async stopPoll() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await util.startPoll(this.modPage);
    await this.userPage.waitForSelector(e.pollingContainer);
    await this.modPage.waitAndClick(e.cancelPollBtn);
    await this.userPage.wasRemoved(e.pollingContainer);
  }

  async pollResultsOnChat() {
    const { pollChatMessage } = getSettings();
    test.fail(!pollChatMessage, 'Poll results on chat is disabled');

    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await util.startPoll(this.modPage, true);
    await this.modPage.waitAndClick(e.chatButton);

    await this.modPage.hasElement(e.chatPollMessageText);
    await this.userPage.hasElement(e.chatPollMessageText);
  }

  async pollResultsOnWhiteboard() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await util.startPoll(this.modPage, true);
    await this.modPage.hasElement(e.pollResults);
  }

  async pollResultsInDifferentPresentation() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await util.startPoll(this.modPage);

    await utilPresentation.uploadSinglePresentation(this.modPage, e.questionSlideFileName);
    await this.modPage.waitAndClick(e.publishPollingLabel);

    // Check poll results
    await this.modPage.hasElement(e.pollResults);
  }

  async manageResponseChoices() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.startNewPoll();
    const initialRespCount = await this.modPage.getSelectorCount(e.pollOptionItem);

    // Add
    await this.modPage.waitAndClick(e.addPollItem);
    await this.typeOnLastChoiceInput();
    await this.modPage.waitAndClick(e.startPoll);

    await expect(initialRespCount + 1).toEqual(await this.getAnswerOptionCount());
    await this.checkLastOptionText();

    // Delete
    await this.startNewPoll();
    await this.modPage.waitAndClick(e.deletePollOption);
    await this.modPage.waitAndClick(e.startPoll);

    await expect(initialRespCount - 1).toEqual(await this.getAnswerOptionCount());

    // Edit
    await this.startNewPoll();
    await this.typeOnLastChoiceInput();
    await this.modPage.waitAndClick(e.startPoll);

    await expect(initialRespCount).toEqual(await this.getAnswerOptionCount());
    await this.checkLastOptionText();
  }

  async startNewPoll() {
    const hasPollStarted = await this.modPage.checkElement(e.pollMenuButton);
    if (hasPollStarted) {
      await this.modPage.waitAndClick(e.cancelPollBtn);
      await this.userPage.wasRemoved(e.pollingContainer);
    }
    await util.openPoll(this.modPage);
  }

  async getAnswerOptionCount() {
    await this.userPage.waitForSelector(e.pollingContainer);
    return this.userPage.getSelectorCount(e.pollAnswerOptionBtn);
  }

  async typeOnLastChoiceInput() {
    const lastInput = this.modPage.getLocatorByIndex(e.pollOptionItem, -1);
    await lastInput.fill(this.newInputText);

  }

  async checkLastOptionText() {
    await this.userPage.waitForSelector(e.pollingContainer);
    const lastOptionText = this.userPage.getLocatorByIndex(e.pollAnswerOptionBtn, -1);
    await expect(lastOptionText).toHaveText(this.newInputText);
  }
}

exports.Polling = Polling;
