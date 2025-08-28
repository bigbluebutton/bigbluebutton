const { expect } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const util = require('./util.js');
const { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME, ELEMENT_WAIT_EXTRA_LONG_TIME } = require('../core/constants');
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
    await this.modPage.waitAndClick(e.startPoll);
    await this.modPage.hasElement(e.pollMenuButton, 'should display the poll menu button');

    await this.userPage.hasElement(e.pollingContainer, 'should display the polling container for the attendee to answer it');

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
    await this.userPage.hasElement(e.pollingContainer, 'should display the polling container for the attendee after the poll is created');
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

  async startPollWithoutPresentation() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.managePresentations);
    // remove all presentations
    const allRemovePresentationBtn = await this.modPage.getLocator(e.removePresentation).all();
    // reversing the order of clicking is needed to avoid failure as the tooltip shows in front of the below button
    const reversedRemovePresentationButtons = allRemovePresentationBtn.reverse();
    for (const removeBtn of reversedRemovePresentationButtons) {
      await removeBtn.click({ timeout: ELEMENT_WAIT_TIME });
    }
    await this.modPage.waitAndClick(e.confirmManagePresentation);
    // start a new poll
    await util.startPoll(this.modPage);
    await this.userPage.hasElement(e.pollingContainer, 'should display the polling container for the attendee after the poll is created');
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    // publish the poll and check the chat results
    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.hasElement(e.chatPollMessageText);
    await this.userPage.hasElement(e.chatPollMessageText);
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

    await this.modPage.hasText(e.currentPollQuestion, /Test/, 'should display the answer that the attendee selected');
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
    await this.modPage.hasElementDisabled(e.startPoll, 'should display the start poll button disabled');

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
    await util.uploadSPresentationForTestingPolls(this.modPage, e.smartSlides2);
    await this.userPage.hasElement(e.userListItem, 'should display the user list item for the attendee');
    await sleep(5000);
    await this.modPage.selectSlide('Slide 2');
    // A/B/C/D/E - One option answer
    await this.modPage.hasElement(e.quickPoll, 'should display the quick poll button when the presentation finishes uploading', ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.modPage.waitAndClick(e.quickPoll, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.startPoll);
    await this.userPage.hasElement(e.pollingContainer, 'should display the poll question after quick poll starts');
    await this.userPage.waitAndClick(e.pollAnswerOptionE);
    await this.modPage.hasText(e.userVoteLiveResult, 'E. Gummy bears', 'should display the vote result after the poll is answered');
    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.wasRemoved(e.pollingContainer, 'should not display the polling container after the poll is published');

    await this.modPage.waitAndClick(e.nextSlide);
    await this.modPage.hasText(e.skipSlide, 'Slide 3');
     // Multiple Choices - Two question marks
    await this.modPage.waitAndClick(e.quickPoll, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.startPoll);
    await this.userPage.hasElement(e.pollingContainer, 'should display the poll question after quick poll starts');
    await this.userPage.waitAndClick(e.firstPollAnswerDescOption);
    await this.userPage.waitAndClick(e.secondPollAnswerDescOption);
    await this.userPage.waitAndClick(e.submitAnswersMultiple);
    await this.modPage.hasText(e.userVoteLiveResult, 'A. Sodium', 'should display the live vote result for the awswers after the attende answer the multiple choices polling ');
    await this.modPage.hasText(e.userVoteLiveResult, 'B. Calcium', 'should display the live vote result for the awswers after the attende answer the multiple choices polling ');

    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.wasRemoved(e.pollingContainer, 'should not display the polling container after the poll is published');

    await this.modPage.waitAndClick(e.nextSlide);
    await this.modPage.hasText(e.skipSlide, 'Slide 4');
    // True/False
    await sleep(500); // avoid error when the tooltip is in front of the button due to layout shift
    await this.modPage.waitAndClick(e.quickPoll);
    await this.modPage.waitAndClick(e.startPoll);
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.modPage.hasText(e.userVoteLiveResult, 'True', 'should display the vote result after the attendee submit the answer');
    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.wasRemoved(e.pollingContainer, 'should not display the pollling container after all the smart slides questions is finished');
    await this.modPage.waitAndClick(e.nextSlide);

    // Yes/No
    await sleep(500); // avoid error when the tooltip is in front of the button due to layout shift
    await this.modPage.hasText(e.skipSlide, 'Slide 5');
    await this.modPage.waitAndClick(e.quickPoll);
    await this.modPage.waitAndClick(e.startPoll);
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.modPage.hasText(e.userVoteLiveResult, 'Yes', 'should display the vote result after the attendee submit the answer');

    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.wasRemoved(e.pollingContainer);

    await this.modPage.waitAndClick(e.nextSlide);

    // Type Response
    await this.modPage.hasText(e.skipSlide, 'Slide 6');
    await this.modPage.waitAndClick(e.quickPoll);
    await this.modPage.waitAndClick(e.startPoll);
    await this.userPage.hasElement(e.pollingContainer, 'should display the polling container for the user to answer it');
    await this.userPage.type(e.pollAnswerOptionInput, e.answerMessage);
    await this.userPage.waitAndClick(e.pollSubmitAnswer);

    await this.modPage.hasText(e.userVoteLiveResult, e.answerMessage, 'should display the answer sent by the attendee');

    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.wasRemoved(e.pollingContainer, 'should close the polling container after publishing the label');

    // Hiding pools - Poll anywhere in the slide
    await this.modPage.selectSlide('Slide 8');
    await this.modPage.hasElement(e.quickPoll, 'should display the quick poll button when the presentation finishes uploading');
    await this.modPage.waitAndClick(e.quickPoll, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.startPoll);
    await this.userPage.hasElement(e.pollingContainer, 'should display the poll question after quick poll starts');
    await this.userPage.waitAndClick(e.pollAnswerOptionD);
    await this.modPage.hasText(e.userVoteLiveResult, 'D. Very confident', 'should display the vote result after the poll is answered');
    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.wasRemoved(e.pollingContainer, 'should not display the polling container after the poll is published');

    // Hiding poll - white box
    await this.modPage.selectSlide('Slide 9');
    await this.modPage.hasElement(e.quickPoll, 'should display the quick poll button when the presentation finishes uploading');
    await this.modPage.waitAndClick(e.quickPoll, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.startPoll);
    await this.userPage.hasElement(e.pollingContainer, 'should display the poll question after quick poll starts');
    await this.userPage.waitAndClick(e.pollAnswerOptionD);
    await this.modPage.hasText(e.userVoteLiveResult, 'D. Very confident', 'should display the vote result after the poll is answered');
    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.wasRemoved(e.pollingContainer, 'should not display the polling container after the poll is published');

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
    await expect(wbDrawnRectangleLocator,'should display a rectangle shape with the poll result on the whiteboard').toHaveCount(initialWbDrawnRectangleCount + 1);
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
