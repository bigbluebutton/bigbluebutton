const { expect, test } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const util = require('./util.js');
const utilPresentation = require('../presentation/util');
const { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } = require('../core/constants');
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

    await this.modPage.waitAndClick(e.closePollingBtn);
    await this.modPage.wasRemoved(e.closePollingBtn);
  }

  async pollAnonymous() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await util.startPoll(this.modPage, false, true);
    await this.modPage.waitForSelector(e.publishPollingLabel);
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.userPage.wasRemoved(e.receivedAnswer);

    await this.modPage.waitAndClick(e.closePollingBtn);
    await this.modPage.wasRemoved(e.closePollingBtn);
  }

  async quickPoll() {
    await utilPresentation.uploadSinglePresentation(this.modPage, e.questionSlideFileName);

    // The slide needs to be uploaded and converted, so wait a bit longer for this step
    await this.modPage.waitAndClick(e.quickPoll, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitForSelector(e.pollMenuButton);

    await this.userPage.hasElement(e.pollingContainer);

    await this.modPage.waitAndClick(e.closePollingBtn);
    await this.modPage.wasRemoved(e.closePollingBtn);
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

    await this.modPage.hasElement(e.wbDrawnRectangle);
    await this.userPage.hasElement(e.wbDrawnRectangle);

    await this.modPage.waitAndClick(e.closePollingBtn);
    await this.modPage.wasRemoved(e.closePollingBtn);
  }

  async stopPoll() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await util.startPoll(this.modPage);
    await this.userPage.waitForSelector(e.pollingContainer);
    await this.modPage.waitAndClick(e.cancelPollBtn);
    await this.userPage.wasRemoved(e.pollingContainer);

    await this.modPage.waitAndClick(e.closePollingBtn);
    await this.modPage.wasRemoved(e.closePollingBtn);
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

    await this.modPage.waitAndClick(e.closePollingBtn);

    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.waitAndClick(e.removePresentation);
    await this.modPage.waitAndClick(e.confirmManagePresentation);
  }

  async notAbleStartNewPollWithoutPresentation() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.waitAndClick(e.removePresentation);
    await this.modPage.waitAndClick(e.confirmManagePresentation);

    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.polling);
    await this.modPage.hasElement(e.noPresentation);
  }

  async customInput() {
    await utilPresentation.uploadSinglePresentation(this.modPage, e.questionSlideFileName);

    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.polling);
    await this.modPage.waitAndClickElement(e.autoOptioningPollBtn);

    await this.modPage.type(e.pollQuestionArea, 'Test');
    await this.modPage.waitAndClick(e.addPollItem);
    await this.modPage.type(e.pollOptionItem, 'test1');
    await this.modPage.waitAndClick(e.startPoll);

    await this.userPage.hasElement(e.pollingContainer);
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);

    await this.modPage.hasText(e.currentPollQuestion, /Test/);
    await this.modPage.hasText(e.answer1, '1');

    await this.modPage.waitAndClick(e.closePollingBtn);
    await this.modPage.wasRemoved(e.closePollingBtn);
  }

  async allowMultipleChoices() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.polling);
    await this.modPage.waitAndClickElement(e.autoOptioningPollBtn);

    await this.modPage.type(e.pollQuestionArea, 'Test');
    await this.modPage.waitAndClickElement(e.allowMultiple);

    await this.modPage.waitAndClick(e.addPollItem);
    await this.modPage.waitAndClick(e.startPoll);
    await this.modPage.hasElement(e.errorNoValueInput);

    await this.modPage.type(e.pollOptionItem1, 'test1');
    await this.modPage.waitAndClick(e.addPollItem);
    await this.modPage.type(e.pollOptionItem2, 'test2');
    await this.modPage.waitAndClick(e.startPoll);
    await this.modPage.hasText(e.currentPollQuestion, /Test/);

    await this.userPage.waitAndClick(e.firstPollAnswerOptionBtn);
    await this.userPage.waitAndClick(e.secondPollAnswerOptionBtn);
    await this.userPage.waitAndClickElement(e.submitAnswersMultiple);

    await this.modPage.hasText(e.answer1, '1');
    await this.modPage.hasText(e.answer2, '1');

    await this.modPage.waitAndClick(e.closePollingBtn);
    await this.modPage.wasRemoved(e.closePollingBtn);
  }

  async smartSlidesQuestions() {
    await this.modPage.hasElement(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await utilPresentation.uploadSinglePresentation(this.modPage, e.smartSlides1, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.hasElement(e.currentUser);

    await this.modPage.waitAndClick(e.quickPoll);
    await this.userPage.hasElement(e.responsePollQuestion);
    await this.userPage.type(e.pollAnswerOptionInput, 'test');
    await this.userPage.waitAndClick(e.pollSubmitAnswer);
    await this.userPage.wasRemoved(e.pollingContainer, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasText(e.receivedAnswer, 'test');

    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.waitAndClick(e.closePollingBtn);
    await this.modPage.wasRemoved(e.closePollingBtn);

    await this.modPage.waitAndClick(e.nextSlide);
    await this.modPage.waitAndClick(e.quickPoll);
    await this.userPage.waitAndClick(e.firstPollAnswerDescOption);
    await this.userPage.waitAndClick(e.submitAnswersMultiple);

    await this.modPage.hasText(e.answer1, '1');

    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.waitAndClick(e.nextSlide);
    await this.modPage.waitAndClick(e.quickPoll);
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);

    await this.modPage.hasText(e.answer1, '1');
    await this.modPage.hasElementDisabled(e.nextSlide);

    await this.modPage.waitAndClick(e.closePollingBtn);
    await this.modPage.wasRemoved(e.closePollingBtn);
  }

  async pollResultsOnChat() {
    const { pollChatMessage } = getSettings();
    test.fail(!pollChatMessage, 'Poll results on chat is disabled');

    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await util.startPoll(this.modPage, true);
    await this.modPage.waitAndClick(e.chatButton);

    const lastChatPollMessageTextModerator = await this.modPage.getLocator(e.chatPollMessageText).last();
    await expect(lastChatPollMessageTextModerator).toBeVisible();
    const lastChatPollMessageTextUser = await this.userPage.getLocator(e.chatPollMessageText).last();
    await expect(lastChatPollMessageTextUser).toBeVisible();
  }

  async pollResultsOnWhiteboard() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await util.startPoll(this.modPage, true);
    const wbDrawnRectangleLocator = await this.modPage.getLocator(e.wbDrawnRectangle).last();
    await expect(wbDrawnRectangleLocator).toBeVisible({ timeout: ELEMENT_WAIT_TIME});

    await this.modPage.waitAndClick(e.closePollingBtn);
    await this.modPage.wasRemoved(e.closePollingBtn);
  }

  async pollResultsInDifferentPresentation() {
    await waitAndClearDefaultPresentationNotification(this.modPage);
    

    await utilPresentation.uploadSinglePresentation(this.modPage, e.questionSlideFileName);
    await util.startPoll(this.modPage);
    await this.modPage.waitAndClick(e.publishPollingLabel);

    // Check poll results
    await this.modPage.hasElement(e.wbDrawnRectangle);

    await this.modPage.waitAndClick(e.closePollingBtn);
    await this.modPage.wasRemoved(e.closePollingBtn);
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
