const { expect } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const util = require('./util.js');
const { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } = require('../core/constants');
const { getSettings } = require('../core/settings');
const { skipSlide } = require('../presentation/util');
const { sleep } = require('../core/helpers.js');

class Polling extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
    this.newInputText = 'new option';
  }

  async createPoll() {
    await util.startPoll(this.modPage);
    await this.modPage.hasElement(e.pollMenuButton, 'should display the poll menu button after starting the poll');
    await this.modPage.hasElement(e.publishPollingLabel, 'should display the publish poll button');
    await this.modPage.hasElement(e.cancelPollBtn, 'should display the cancel poll button after the poll creation');
    await this.userPage.hasElement(e.pollingContainer, 'should display the poll container for the attendee');
    await this.modPage.waitAndClick(e.closePollingBtn);
    await this.modPage.wasRemoved(e.closePollingBtn, 'should not display the close poll button after clicking to close the poll');
  }

  async pollAnonymous() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard', ELEMENT_WAIT_LONGER_TIME);
    await util.startPoll(this.modPage, true);
    await this.modPage.hasElement(e.publishPollingLabel, 'should display the poll publish button after the poll starts');
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.userPage.wasRemoved(e.receivedAnswer, 'should not display the received answer for the attendee');

    await this.modPage.waitAndClick(e.closePollingBtn);
    await this.modPage.wasRemoved(e.closePollingBtn, 'should not display the close poll button after the poll closes');
  }

  async quickPoll() {
    await util.uploadSPresentationForTestingPolls(this.modPage, e.questionSlideFileName);

    // The slide needs to be uploaded and converted, so wait a bit longer for this step
    await this.modPage.waitAndClick(e.quickPoll, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElement(e.pollMenuButton, 'should display the poll menu button');

    await this.userPage.hasElement(e.pollingContainer, 'should display the polling container for the attendeee to answer it');

    await this.modPage.waitAndClick(e.closePollingBtn);
    await this.modPage.wasRemoved(e.closePollingBtn, 'should not display the close poll button after the poll closes');
  }

  async pollUserResponse() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator');
    await util.openPoll(this.modPage);

    await this.modPage.type(e.pollQuestionArea, e.pollQuestion);
    await this.modPage.waitAndClick(e.userResponseBtn);
    await this.modPage.waitAndClick(e.startPoll);

    await this.userPage.hasElement(e.pollingContainer, 'should display the polling container for the user to answer it');
    await this.userPage.type(e.pollAnswerOptionInput, e.answerMessage);
    await this.userPage.waitAndClick(e.pollSubmitAnswer);

    await this.modPage.hasText(e.userVoteLiveResult, e.answerMessage, 'should display the answer sent by the attendee');

    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.wasRemoved(e.pollingContainer, 'should close the polling container after publishing the label');

    await this.modPage.hasElement(e.wbPollShape, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.hasElement(e.wbPollShape);
  }

  async stopPoll() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator', ELEMENT_WAIT_LONGER_TIME);
    await util.startPoll(this.modPage);
    await this.userPage.hasElement(e.pollingContainer, 'should display the polling container for the attendeee after the poll is created');
    await this.modPage.waitAndClick(e.cancelPollBtn);
    await this.userPage.wasRemoved(e.pollingContainer, 'should not display the polling container after the poll is canceled');

    await this.modPage.waitAndClick(e.closePollingBtn);
    await this.modPage.wasRemoved(e.closePollingBtn, 'should not display the close polling button for the moderator after the poll is closed');
  }

  async manageResponseChoices() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator', ELEMENT_WAIT_LONGER_TIME);
    await this.startNewPoll();
    const initialRespCount = await this.modPage.getSelectorCount(e.pollOptionItem);

    // Add
    await this.modPage.waitAndClick(e.addPollItem);
    await this.typeOnLastChoiceInput();
    await this.modPage.waitAndClick(e.startPoll);

    await expect(initialRespCount + 1, 'should display the initial quantity of poll options itens plus 1').toEqual(await this.getAnswerOptionCount());
    await this.checkLastOptionText();

    // Delete
    await this.startNewPoll();
    await this.modPage.waitAndClick(e.deletePollOption);
    await this.modPage.waitAndClick(e.startPoll);

    await expect(initialRespCount - 1, 'should display the initial quantity of poll options itens minus 1').toEqual(await this.getAnswerOptionCount());

    // Edit
    await this.startNewPoll();
    await this.typeOnLastChoiceInput();
    await this.modPage.waitAndClick(e.startPoll);

    await expect(initialRespCount, 'should display the initial quantity of poll options itens').toEqual(await this.getAnswerOptionCount());
    await this.checkLastOptionText();

    await this.modPage.waitAndClick(e.closePollingBtn);
  }

  async notAbleStartNewPollWithoutPresentation() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator when joining the meeting', ELEMENT_WAIT_LONGER_TIME);
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
    await this.modPage.hasElement(e.noPresentation, 'should display the no presentation for not being able to start a poll whitout presentation');
  }

  async customInput() {
    await util.uploadSPresentationForTestingPolls(this.modPage, e.uploadPresentationFileName);
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator when joining the meeting', 20000);

    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.polling);
    await this.modPage.waitAndClickElement(e.autoOptioningPollBtn);

    await this.modPage.type(e.pollQuestionArea, 'Test');
    await this.modPage.waitAndClick(e.addPollItem);
    await this.modPage.type(e.pollOptionItem, 'test1');
    await this.modPage.waitAndClick(e.addPollItem);
    await this.modPage.type(e.pollOptionItem2, 'test2');
    await this.modPage.waitAndClick(e.startPoll);

    await this.userPage.hasElement(e.pollingContainer, 'should display the polling container for the attendee after starting the poll');
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);

    await this.modPage.hasText(e.currentPollQuestion, /Test/, 'should display the answer that the ateendee selected');
    await this.modPage.hasText(e.userVoteLiveResult, '1', 'should display the live result');

    await this.modPage.waitAndClick(e.closePollingBtn);
    await this.modPage.wasRemoved(e.closePollingBtn, 'should not display the close polling button after the poll is closed');
  }

  async allowMultipleChoices() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.polling);
    await this.modPage.waitAndClickElement(e.autoOptioningPollBtn);

    await this.modPage.type(e.pollQuestionArea, 'Test');
    await this.modPage.waitAndClickElement(e.allowMultiple);

    await this.modPage.waitAndClick(e.addPollItem);
    await this.modPage.waitAndClick(e.startPoll);
    await this.modPage.hasElement(e.errorNoValueInput, 'should display an error after trying to start a poll without any input on the option poll item');

    await this.modPage.type(e.pollOptionItem1, 'test1');
    await this.modPage.waitAndClick(e.addPollItem);
    await this.modPage.type(e.pollOptionItem2, 'test2');
    await this.modPage.waitAndClick(e.startPoll);
    await this.modPage.hasText(e.currentPollQuestion, /Test/, 'should display the current poll question after the poll has started');

    await this.userPage.waitAndClick(e.firstPollAnswerOptionBtn);
    await this.userPage.waitAndClick(e.secondPollAnswerOptionBtn);
    await this.userPage.waitAndClickElement(e.submitAnswersMultiple);

    await this.modPage.hasText(e.userVoteLiveResult, '1', 'should display the user vote number after the attende has answered the poll');
    await this.modPage.hasText(e.userVoteLiveResult, '2', 'should display the user vote number after the attende has answered the poll');

    await this.modPage.waitAndClick(e.closePollingBtn);
    await this.modPage.wasRemoved(e.closePollingBtn, 'should not display the close polling button after the poll is closed');
  }

  async smartSlidesQuestions() {
    await this.modPage.hasElement(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await util.uploadSPresentationForTestingPolls(this.modPage, e.smartSlides1);
    await this.userPage.hasElement(e.userListItem, 'should display the user list item for the attendee');

    // Type Response
    await this.modPage.waitAndClick(e.quickPoll, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.hasElement(e.responsePollQuestion, 'should display the poll question after quick poll starts');
    await this.userPage.type(e.pollAnswerOptionInput, 'test');
    await this.userPage.waitAndClick(e.pollSubmitAnswer);
    await this.userPage.wasRemoved(e.pollingContainer, 'should not display the polling container after the attendee answer the poll', ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasText(e.userVoteLiveResult, 'test');

    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.wasRemoved(e.pollingContainer, 'should not display the polling container after the poll be published');

    // Multiple Choices
    await sleep(500); // avoid error when the tooltip is in front of the button due to layout shift
    await skipSlide(this.modPage);
    await this.modPage.waitAndClick(e.quickPoll);
    await this.userPage.waitAndClick(e.firstPollAnswerDescOption);
    await this.userPage.waitAndClick(e.secondPollAnswerDescOption);
    await this.userPage.waitAndClick(e.submitAnswersMultiple);
    await this.modPage.hasText(e.userVoteLiveResult, 'A) 2222', 'should display the live vote result for the awswers after the attende answer the multiple choices polling ');
    await this.modPage.hasText(e.userVoteLiveResult, 'B) 3333', 'should display the live vote result for the awswers after the attende answer the multiple choices polling ');

    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.wasRemoved(e.pollingContainer, 'should not display the polling container after the poll is published');

    // One option answer
    await sleep(500); // avoid error when the tooltip is in front of the button due to layout shift
    await skipSlide(this.modPage);
    await this.modPage.waitAndClick(e.quickPoll);
    await this.userPage.waitAndClick(e.pollAnswerOptionE);
    await this.modPage.hasText(e.userVoteLiveResult, 'E) 22222', 'should display the vote result after the poll is answered');

    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.wasRemoved(e.pollingContainer, 'should not display the polling container after the poll is published');

    // Yes/No/Abstention
    await sleep(500); // avoid error when the tooltip is in front of the button due to layout shift
    await skipSlide(this.modPage);
    await this.modPage.waitAndClick(e.yesNoOption);
    await this.modPage.waitAndClick(e.yesNoAbstentionOption)
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.modPage.hasText(e.userVoteLiveResult, 'Yes', 'should display the vote result after the attendee submit the answer');

    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.wasRemoved(e.pollingContainer);

    // True/False
    await sleep(500); // avoid error when the tooltip is in front of the button due to layout shift
    await skipSlide(this.modPage);
    await this.modPage.waitAndClick(e.quickPoll);
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.modPage.hasText(e.userVoteLiveResult, 'True', 'should display the vote result after the attendeee submit the answer');
    await this.modPage.waitAndClick(e.publishPollingLabel);

    await this.modPage.hasElementDisabled(e.nextSlide, 'should display the next slide button disabled since the smart slides has finished with all the questions');
    await this.modPage.wasRemoved(e.pollingContainer, 'should not display the pollling container after all the smart slides questions is finished');
  }

  async pollResultsOnChat() {
    const { pollChatMessage } = getSettings();
    
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator when joining the meeting', ELEMENT_WAIT_LONGER_TIME);
    await util.startPoll(this.modPage);
    await this.modPage.hasElementDisabled(e.publishPollingLabel, 'should display the publish polling button disabled without any answer sent from the user');
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.modPage.hasElement(e.publishPollingLabel, 'should display the publish polling button enabled after the attendee answered the poll');
    await this.modPage.waitAndClick(e.publishPollingLabel);

    const lastChatPollMessageTextModerator = await this.modPage.getLocator(e.chatPollMessageText).last();
    if(!pollChatMessage) {
      return expect(lastChatPollMessageTextModerator, 'should not display the last chat poll message on the chat, so the poll results on the chat').toBeHidden({ ELEMENT_WAIT_TIME });
    }
    await expect(lastChatPollMessageTextModerator, 'should display the last chaat poll message on the chat, so the poll results on the chat').toBeVisible();
    const lastChatPollMessageTextUser = await this.userPage.getLocator(e.chatPollMessageText).last();
    await expect(lastChatPollMessageTextUser, 'should display the poll results on the chat for the attendee').toBeVisible();
  }

  async pollResultsOnWhiteboard() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard when the moderator joins the meeting', ELEMENT_WAIT_LONGER_TIME);
    await util.startPoll(this.modPage);

    const wbDrawnRectangleLocator = await this.modPage.getLocator(e.wbPollShape);
    const initialWbDrawnRectangleCount = await wbDrawnRectangleLocator.count();

    await this.modPage.hasElementDisabled(e.publishPollingLabel, 'should display the publish poll button disabled before the poll is answered');
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.modPage.hasElement(e.publishPollingLabel, 'should display the publish poll button enabled after the attendee answered the poll');
    await this.modPage.waitAndClick(e.publishPollingLabel);
    await expect(wbDrawnRectangleLocator,'should display the rectangle with the poll information on the whiteboard').toHaveCount(initialWbDrawnRectangleCount + 1);

    const lastWbDrawnRectangleLocator = await wbDrawnRectangleLocator.last();
    await expect(lastWbDrawnRectangleLocator, 'should display the last rectangle with the poll information on the whiteboard').toBeVisible({ timeout: ELEMENT_WAIT_TIME});

    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();

    // poll results should be editable by the presenter
    await lastWbDrawnRectangleLocator.dblclick({ timeout: ELEMENT_WAIT_TIME });
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.page.mouse.up();
    await lastWbDrawnRectangleLocator.dblclick({ timeout: ELEMENT_WAIT_TIME });
    await this.modPage.page.keyboard.type('test');
    await expect(lastWbDrawnRectangleLocator, 'should display the text test on the last rectangle poll results on the whiteboard').toContainText('test');

    // user turns to presenter to edit the poll results
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.makePresenter);

    await this.userPage.waitAndClick(e.zoomInButton);
    await this.userPage.waitAndClick(e.resetZoomButton);

    const wbDrawnRectangleUserLocator = await this.userPage.getLocator(e.wbPollShape).last();
    await wbDrawnRectangleUserLocator.dblclick({ timeout: ELEMENT_WAIT_TIME });
    await this.userPage.page.keyboard.type('testUser');
    await expect(wbDrawnRectangleUserLocator, 'should display the edit that the attendee made to the poll results rectangle on the whiteboard').toContainText('testUser');

    await this.modPage.waitAndClick(e.currentUser);
    await this.modPage.waitAndClick(e.takePresenter);
    await this.userPage.waitAndClick(e.hidePublicChat);
  }

  async pollResultsInDifferentPresentation() {
    await util.startPoll(this.modPage);
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await util.uploadSPresentationForTestingPolls(this.modPage, e.questionSlideFileName);
    await this.modPage.hasElement(e.quickPoll, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.publishPollingLabel);
    // Check poll results
    await this.modPage.hasElement(e.wbPollShape);
  }

  async startNewPoll() {
    const hasPollStarted = await this.modPage.checkElement(e.pollMenuButton);
    if (hasPollStarted) {
      await this.modPage.waitAndClick(e.cancelPollBtn);
      await this.userPage.wasRemoved(e.pollingContainer, 'should not display the polling container after the poll is canceled');
    }
    await util.openPoll(this.modPage);
  }

  async getAnswerOptionCount() {
    await this.userPage.hasElement(e.pollingContainer, 'should display the polling container for the attendee');
    return this.userPage.getSelectorCount(e.pollAnswerOptionBtn);
  }

  async typeOnLastChoiceInput() {
    const lastInput = this.modPage.getLocatorByIndex(e.pollOptionItem, -1);
    await lastInput.fill(this.newInputText);
  }

  async checkLastOptionText() {
    await this.userPage.hasElement(e.pollingContainer, 'should display the polling container for the attendee');
    const lastOptionText = this.userPage.getLocatorByIndex(e.pollAnswerOptionBtn, -1);
    await expect(lastOptionText, 'should display the last option text for the attendee').toHaveText(this.newInputText);
  }
}

exports.Polling = Polling;
