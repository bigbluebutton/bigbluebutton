const { expect, test } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const util = require('./util.js');
const { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME, ELEMENT_WAIT_EXTRA_LONG_TIME } = require('../core/constants');
const { getSettings } = require('../core/settings');
const { waitAndClearDefaultPresentationNotification } = require('../notifications/util');
const { uploadSinglePresentation, skipSlide } = require('../presentation/util');
const { sleep } = require('../core/helpers.js');

class Polling extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
    this.newInputText = 'new option';
  }

  async createPoll() {
    await util.startPoll(this.modPage);
    await this.modPage.hasElement(e.pollMenuButton);
    await this.modPage.hasElement(e.publishPollingLabel);
    await this.modPage.hasElement(e.cancelPollBtn);
    await this.userPage.hasElement(e.pollingContainer);
    await this.modPage.waitAndClick(e.closePollingBtn);
    await this.modPage.wasRemoved(e.closePollingBtn);
  }

  async pollAnonymous() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await util.startPoll(this.modPage, true);
    await this.modPage.waitForSelector(e.publishPollingLabel);
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.userPage.wasRemoved(e.receivedAnswer);

    await this.modPage.waitAndClick(e.closePollingBtn);
    await this.modPage.wasRemoved(e.closePollingBtn);
  }

  async quickPoll() {
    await util.uploadSPresentationForTestingPolls(this.modPage, e.questionSlideFileName);

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

    await this.modPage.hasText(e.userVoteLiveResult, e.answerMessage);

    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.wasRemoved(e.pollingContainer);

    await this.modPage.hasElement(e.wbDrawnRectangle, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.hasElement(e.wbDrawnRectangle);
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
  }

  async notAbleStartNewPollWithoutPresentation() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.managePresentations);

    const allRemovePresentationBtn = await this.modPage.getLocator(e.removePresentation).all();
    // reversing the order of clicking is needed to avoid failure as the tooltip shows in front of the below button
    const reversedRemovePresentationButtons = allRemovePresentationBtn.reverse();
    for (const removeBtn of reversedRemovePresentationButtons) {
      await removeBtn.click({ timeout: ELEMENT_WAIT_TIME });
    }
    await this.modPage.waitAndClick(e.confirmManagePresentation);
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.polling);
    await this.modPage.hasElement(e.noPresentation);
  }

  async customInput() {
    await util.uploadSPresentationForTestingPolls(this.modPage, e.uploadPresentationFileName);
    await this.modPage.waitForSelector(e.whiteboard, 20000);

    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.polling);
    await this.modPage.waitAndClickElement(e.autoOptioningPollBtn);

    await this.modPage.type(e.pollQuestionArea, 'Test');
    await this.modPage.waitAndClick(e.addPollItem);
    await this.modPage.type(e.pollOptionItem, 'test1');
    await this.modPage.waitAndClick(e.addPollItem);
    await this.modPage.type(e.pollOptionItem2, 'test2');
    await this.modPage.waitAndClick(e.startPoll);

    await this.userPage.hasElement(e.pollingContainer);
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);

    await this.modPage.hasText(e.currentPollQuestion, /Test/);
    await this.modPage.hasText(e.userVoteLiveResult, '1');

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

    await this.modPage.hasText(e.userVoteLiveResult, '1');
    await this.modPage.hasText(e.userVoteLiveResult, '2');

    await this.modPage.waitAndClick(e.closePollingBtn);
    await this.modPage.wasRemoved(e.closePollingBtn);
  }

  async smartSlidesQuestions() {
    await this.modPage.hasElement(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await util.uploadSPresentationForTestingPolls(this.modPage, e.smartSlides1);
    await this.userPage.hasElement(e.userListItem);

    // Type Response
    await this.modPage.waitAndClick(e.quickPoll, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.hasElement(e.responsePollQuestion);
    await this.userPage.type(e.pollAnswerOptionInput, 'test');
    await this.userPage.waitAndClick(e.pollSubmitAnswer);
    await this.userPage.wasRemoved(e.pollingContainer, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasText(e.userVoteLiveResult, 'test');

    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.wasRemoved(e.pollingContainer);

    // Multiple Choices
    await sleep(500); // avoid error when the tooltip is in front of the button due to layout shift
    await skipSlide(this.modPage);
    await this.modPage.waitAndClick(e.quickPoll);
    await this.userPage.waitAndClick(e.firstPollAnswerDescOption);
    await this.userPage.waitAndClick(e.secondPollAnswerDescOption);
    await this.userPage.waitAndClick(e.submitAnswersMultiple);
    await this.modPage.hasText(e.userVoteLiveResult, 'A) 2222');
    await this.modPage.hasText(e.userVoteLiveResult, 'B) 3333');

    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.wasRemoved(e.pollingContainer);

    // One option answer
    await sleep(500); // avoid error when the tooltip is in front of the button due to layout shift
    await skipSlide(this.modPage);
    await this.modPage.waitAndClick(e.quickPoll);
    await this.userPage.waitAndClick(e.pollAnswerOptionE);
    await this.modPage.hasText(e.userVoteLiveResult, 'E) 22222');

    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.wasRemoved(e.pollingContainer);

    // Yes/No/Abstention
    await sleep(500); // avoid error when the tooltip is in front of the button due to layout shift
    await skipSlide(this.modPage);
    await this.modPage.waitAndClick(e.yesNoOption);
    await this.modPage.waitAndClick(e.yesNoAbstentionOption)
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.modPage.hasText(e.userVoteLiveResult, 'Yes');

    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.wasRemoved(e.pollingContainer);

    // True/False
    await sleep(500); // avoid error when the tooltip is in front of the button due to layout shift
    await skipSlide(this.modPage);
    await this.modPage.waitAndClick(e.quickPoll);
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.modPage.hasText(e.userVoteLiveResult, 'True');
    await this.modPage.waitAndClick(e.publishPollingLabel);

    await this.modPage.hasElementDisabled(e.nextSlide);
    await this.modPage.wasRemoved(e.pollingContainer);
  }

  async pollResultsOnChat() {
    const { pollChatMessage } = getSettings();
    
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await util.startPoll(this.modPage);
    await this.modPage.hasElementDisabled(e.publishPollingLabel);
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.modPage.hasElement(e.publishPollingLabel);
    await this.modPage.waitAndClick(e.publishPollingLabel);

    const lastChatPollMessageTextModerator = await this.modPage.getLocator(e.chatPollMessageText).last();
    if(!pollChatMessage) {
      return expect(lastChatPollMessageTextModerator).toBeHidden({ ELEMENT_WAIT_TIME });
    }
    await expect(lastChatPollMessageTextModerator).toBeVisible();
    const lastChatPollMessageTextUser = await this.userPage.getLocator(e.chatPollMessageText).last();
    await expect(lastChatPollMessageTextUser).toBeVisible();
  }

  async pollResultsOnWhiteboard() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await util.startPoll(this.modPage);

    const wbDrawnRectangleLocator = await this.modPage.getLocator(e.wbDrawnRectangle);
    const initialWbDrawnRectangleCount = await wbDrawnRectangleLocator.count();

    await this.modPage.hasElementDisabled(e.publishPollingLabel);
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.modPage.hasElement(e.publishPollingLabel);
    await this.modPage.waitAndClick(e.publishPollingLabel);
    await expect(wbDrawnRectangleLocator).toHaveCount(initialWbDrawnRectangleCount + 1);

    const lastWbDrawnRectangleLocator = await wbDrawnRectangleLocator.last();
    await expect(lastWbDrawnRectangleLocator).toBeVisible({ timeout: ELEMENT_WAIT_TIME});

    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();

    // poll results should be editable by the presenter
    await lastWbDrawnRectangleLocator.dblclick({ timeout: ELEMENT_WAIT_TIME });
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.page.mouse.up();
    await lastWbDrawnRectangleLocator.dblclick({ timeout: ELEMENT_WAIT_TIME });
    await this.modPage.page.keyboard.type('test');
    await expect(lastWbDrawnRectangleLocator).toContainText('test');

    // user turns to presenter to edit the poll results
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.makePresenter);

    await this.userPage.waitAndClick(e.zoomInButton);
    await this.userPage.waitAndClick(e.resetZoomButton);

    const wbDrawnRectangleUserLocator = await this.userPage.getLocator(e.wbDrawnRectangle).last();
    await wbDrawnRectangleUserLocator.dblclick({ timeout: ELEMENT_WAIT_TIME });
    await this.userPage.page.keyboard.type('testUser');
    await expect(wbDrawnRectangleUserLocator).toContainText('testUser');

    await this.modPage.waitAndClick(e.currentUser);
    await this.modPage.waitAndClick(e.takePresenter);
    await this.userPage.waitAndClick(e.hidePublicChat);
  }

  async pollResultsInDifferentPresentation() {
    await util.startPoll(this.modPage);
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await util.uploadSPresentationForTestingPolls(this.modPage, e.questionSlideFileName);
    await this.modPage.hasElement(e.quickPoll);
    await this.modPage.waitAndClick(e.publishPollingLabel);
    // Check poll results
    await this.modPage.hasElement(e.wbDrawnRectangle);
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
