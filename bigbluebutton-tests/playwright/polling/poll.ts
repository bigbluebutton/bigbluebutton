import { expect, test } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { skipSlide } from '../presentation/util';
import { MultiUsers } from '../user/multiusers';
import * as util from './util';

const newInputText = 'new option';

export class Polling extends MultiUsers {
  async createPoll() {
    await util.startPoll(this.modPage);
    await this.modPage.hasElement(e.publishPollingLabel, 'should display the publish poll button');
    await this.modPage.hasElement(e.cancelPollBtn, 'should display the cancel poll button after the poll creation');
    await this.userPage.hasElement(e.pollingContainer, 'should display the poll container for the attendee');
  }

  async pollAnonymous() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard', ELEMENT_WAIT_LONGER_TIME);
    await util.startPoll(this.modPage, true);
    await this.modPage.hasElement(
      e.publishPollingLabel,
      'should display the poll publish button after the poll starts',
    );
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.userPage.wasRemoved(e.receivedAnswer, 'should not display the received answer for the attendee');
    await this.modPage.hasText(
      e.pollStatus,
      'Done',
      'should display the anonymous poll as done after each attendee has answered',
    );
  }

  async quickPoll() {
    const { quickPollConfirmationStep } = this.modPage.settings || {};
    await util.uploadSPresentationForTestingPolls(this.modPage, e.questionSlideFileName);

    // The slide needs to be uploaded and converted, so wait a bit longer for this step
    await this.modPage.waitAndClick(e.quickPoll, ELEMENT_WAIT_LONGER_TIME);
    if (!quickPollConfirmationStep) {

      await this.userPage.hasElement(
        e.pollingContainer,
        'should display the polling container for the attendee to answer it',
      );
      return;
    }
    await this.modPage.waitAndClick(e.startPoll);

    await this.userPage.hasElement(
      e.pollingContainer,
      'should display the polling container for the attendee to answer it',
    );
  }

  async pollUserResponse() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator');
    await util.openPoll(this.modPage);

    await this.modPage.fill(e.pollQuestionArea, e.pollQuestion);
    await this.modPage.waitAndClick(e.userResponseBtn);
    await this.modPage.waitAndClick(e.startPoll);

    await this.userPage.hasElement(
      e.pollingContainer,
      'should display the polling container for the user to answer it',
    );
    await this.userPage.fill(e.pollAnswerOptionInput, e.answerMessage);
    await this.userPage.waitAndClick(e.pollSubmitAnswer);

    await this.modPage.hasText(e.userVoteLiveResult, e.answerMessage, 'should display the answer sent by the attendee');

    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.wasRemoved(e.pollingContainer, 'should close the polling container after publishing the label');

    await this.modPage.hasElement(
      e.wbPollShape,
      'should display the whiteboard poll shape for the moderator',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.userPage.hasElement(e.wbPollShape, 'should display the whiteboard poll shape for the attendee');
  }

  // Publishing the results draws on the whiteboard as the presenter, while the
  // presentation is hidden: with restoreOnUpdate it must bring the presentation
  // back for everyone, the presenter included.
  async publishingResultsRestoresHiddenPresentation() {
    await this.modPage.hasElement(
      e.whiteboard,
      'should display the whiteboard for the moderator',
      ELEMENT_WAIT_LONGER_TIME,
    );
    const restoreOnUpdate = await this.modPage.page.evaluate(
      () =>
        (window as unknown as { meetingClientSettings?: { public?: { presentation?: { restoreOnUpdate?: boolean } } } })
          .meetingClientSettings?.public?.presentation?.restoreOnUpdate,
    );
    test.skip(!restoreOnUpdate, 'presentation.restoreOnUpdate is disabled');

    await this.modPage.waitAndClick(e.minimizePresentation);
    await this.modPage.wasRemoved(e.presentationContainer, 'should hide the presentation for the presenter');

    await util.startPoll(this.modPage);
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.modPage.waitAndClick(e.publishPollingLabel);

    await this.modPage.hasElement(
      e.presentationContainer,
      'should restore the presentation for the presenter once the results are published',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.hasElement(e.wbPollShape, 'should display the whiteboard poll shape for the presenter');
    await this.userPage.hasElement(
      e.wbPollShape,
      'should display the whiteboard poll shape for the attendee',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  async stopPoll() {
    await this.modPage.hasElement(
      e.whiteboard,
      'should display the whiteboard for the moderator',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await util.startPoll(this.modPage);
    await this.userPage.hasElement(
      e.pollingContainer,
      'should display the polling container for the attendee after the poll is created',
    );
    await this.modPage.waitAndClick(e.cancelPollBtn);
    await this.userPage.wasRemoved(
      e.pollingContainer,
      'should not display the polling container after the poll is canceled',
    );

    await this.modPage.hasElement(e.pollQuestionArea, 'should display the poll question area after the poll is canceled');
  }

  async manageResponseChoices() {
    await this.modPage.hasElement(
      e.whiteboard,
      'should display the whiteboard for the moderator',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.startNewPoll();
    const initialRespCount = await this.modPage.getSelectorCount(e.pollOptionItem);

    // Add
    await this.modPage.waitAndClick(e.addPollItem);
    await this.typeOnLastChoiceInput();
    await this.modPage.waitAndClick(e.startPoll);
    await this.modPage.hasElementDisabled(e.publishPollingLabel, 'should display the publish poll button disabled before the poll is started');

    await expect(initialRespCount + 1, 'should display the initial quantity of poll options itens plus 1').toEqual(
      await this.getAnswerOptionCount(),
    );
    await this.checkLastOptionText();

    // Delete
    await this.startNewPoll();
    await this.modPage.waitAndClick(e.deletePollOption);
    await this.modPage.waitAndClick(e.startPoll);
    await this.modPage.hasElementDisabled(e.publishPollingLabel, 'should display the publish poll button disabled before the poll is started');

    await expect(initialRespCount - 1, 'should display the initial quantity of poll options itens minus 1').toEqual(
      await this.getAnswerOptionCount(),
    );

    // Edit
    await this.startNewPoll();
    await this.typeOnLastChoiceInput();
    await this.modPage.waitAndClick(e.startPoll);
    await this.modPage.hasElementDisabled(e.publishPollingLabel, 'should display the publish poll button disabled before the poll is started');

    await expect(initialRespCount, 'should display the initial quantity of poll options itens').toEqual(
      await this.getAnswerOptionCount(),
    );
    await this.checkLastOptionText();
  }

  async startPollWithoutPresentation() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.managePresentations);
    // remove all presentations
    const allRemovePresentationBtn = await this.modPage.page.locator(e.removePresentation).all();
    // reversing the order of clicking is needed to avoid failure as the tooltip shows in front of the below button
    const reversedRemovePresentationButtons = allRemovePresentationBtn.reverse();
    await Promise.all(
      reversedRemovePresentationButtons.map((removeBtn) => removeBtn.click({ timeout: ELEMENT_WAIT_TIME })),
    );
    await this.modPage.press('Escape'); // close the media sharing menu
    // start a new poll
    await util.startPoll(this.modPage);
    await this.userPage.hasElement(
      e.pollingContainer,
      'should display the polling container for the attendee after the poll is created',
    );
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    // publish the poll and check the chat results
    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.hasElement(
      e.chatPollMessageText,
      'should display the poll results on the chat for the moderator',
    );
    await this.userPage.hasElement(
      e.chatPollMessageText,
      'should display the poll results on the chat for the attendee',
    );
  }

  async customInput() {
    await util.uploadSPresentationForTestingPolls(this.modPage, e.uploadPresentationFileName);
    await this.modPage.hasElement(
      e.whiteboard,
      'should display the whiteboard for the moderator when joining the meeting',
      20000,
    );

    await this.modPage.waitAndClick(e.pollSidebarButton);
    await this.modPage.waitAndClickElement(e.autoOptioningPollBtn);

    await this.modPage.fill(e.pollQuestionArea, 'Test');
    await this.modPage.waitAndClick(e.addPollItem);
    await this.modPage.fill(e.pollOptionItem, 'test1');
    await this.modPage.waitAndClick(e.addPollItem);
    await this.modPage.fill(e.pollOptionItem2, 'test2');
    await this.modPage.waitAndClick(e.startPoll);

    await this.userPage.hasElement(
      e.pollingContainer,
      'should display the polling container for the attendee after starting the poll',
    );
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);

    await this.modPage.hasText(e.currentPollQuestion, /Test/, 'should display the answer that the attendee selected');
    await this.modPage.hasText(e.userVoteLiveResult, '1', 'should display the live result');
  }

  async allowMultipleChoices() {
    await this.modPage.waitAndClick(e.pollSidebarButton);
    await this.modPage.waitAndClickElement(e.autoOptioningPollBtn);

    await this.modPage.fill(e.pollQuestionArea, 'Test');
    await this.modPage.waitAndClickElement(e.allowMultiple);

    await this.modPage.waitAndClick(e.addPollItem);
    await this.modPage.hasElementDisabled(e.startPoll, 'should display the start poll button disabled');

    await this.modPage.fill(e.pollOptionItem1, 'test1');
    await this.modPage.waitAndClick(e.addPollItem);
    await this.modPage.fill(e.pollOptionItem2, 'test2');
    await this.modPage.waitAndClick(e.startPoll);
    await this.modPage.hasText(
      e.currentPollQuestion,
      /Test/,
      'should display the current poll question after the poll has started',
    );

    await this.userPage.waitAndClick(e.firstPollAnswerOptionBtn);
    await this.userPage.waitAndClick(e.secondPollAnswerOptionBtn);
    await this.userPage.waitAndClickElement(e.submitAnswersMultiple);

    await this.modPage.hasText(
      e.pollStatus,
      'Done',
      'should display the poll as done after each attendee has submitted multiple answers',
    );
    await this.modPage.hasText(
      e.userVoteLiveResult,
      '1',
      'should display the user vote number after the attendee has answered the poll',
    );
    await this.modPage.hasText(
      e.userVoteLiveResult,
      '2',
      'should display the user vote number after the attendee has answered the poll',
    );

    await this.modPage.waitAndClick(e.minimizePolling);
    await this.modPage.wasRemoved(e.minimizePolling, 'should not display the minimize polling button after the poll is closed');
  }

  async oneOptionAnswer() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await util.uploadSPresentationForTestingPolls(this.modPage, e.smartSlides2);
    await this.userPage.hasElement(e.chatMessages, 'should display the chat messages for the attendee');
    await this.modPage.closeAllToastNotifications();

    await skipSlide(this.modPage);
    await this.modPage.hasElement(
      e.quickPoll,
      'should display the quick poll button when the presentation finishes uploading',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await this.modPage.waitAndClick(e.quickPoll, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.startPoll);
    await this.userPage.hasElement(e.pollingContainer, 'should display the poll question after quick poll starts');
    await this.userPage.waitAndClick(e.pollAnswerOptionE);
    await this.modPage.hasText(
      e.userVoteLiveResult,
      'E. Gummy bears',
      'should display the vote result after the poll is answered',
    );
    await util.countingVotes(this.modPage, e.userVoteLiveResult, 1, 'E. Gummy bears');
    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.wasRemoved(
      e.pollingContainer,
      'should not display the polling container after the poll is published',
    );
  }

  async twoQuestionMarks() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await util.uploadSPresentationForTestingPolls(this.modPage, e.smartSlides2);
    await this.userPage.hasElement(e.chatMessages, 'should display the chat messages for the attendee');
    await this.modPage.closeAllToastNotifications();

    await util.goToSlide(this.modPage, 3);
    await this.modPage.waitAndClick(e.quickPoll, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.startPoll);
    await this.userPage.hasElement(e.pollingContainer, 'should display the poll question after quick poll starts');
    await this.userPage.waitAndClick(e.firstPollAnswerDescOption);
    await this.userPage.waitAndClick(e.secondPollAnswerDescOption);
    await this.userPage.waitAndClick(e.submitAnswersMultiple);
    await this.modPage.hasText(
      e.userVoteLiveResult,
      'A. Sodium',
      'should display the live vote result for the answers after the attendee answer the multiple choices polling ',
    );
    await this.modPage.hasText(
      e.userVoteLiveResult,
      'B. Calcium',
      'should display the live vote result for the answers after the attendee answer the multiple choices polling ',
    );
    await util.countingVotes(this.modPage, e.userVoteLiveResult, 1, 'A. Sodium');
    await util.countingVotes(this.modPage, e.userVoteLiveResult, 1, 'B. Calcium');
    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.wasRemoved(
      e.pollingContainer,
      'should not display the polling container after the poll is published',
    );
  }

  async trueFalse() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await util.uploadSPresentationForTestingPolls(this.modPage, e.smartSlides2);
    await this.userPage.hasElement(e.chatMessages, 'should display the chat messages for the attendee');
    await this.modPage.closeAllToastNotifications();

    await util.goToSlide(this.modPage, 4);
    await this.modPage.waitAndClick(e.quickPoll);
    await this.modPage.waitAndClick(e.startPoll);
    await this.userPage.hasElement(e.pollingContainer, 'should display the poll question after quick poll starts');
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.modPage.hasText(
      e.userVoteLiveResult,
      'True',
      'should display the vote result after the attendee submit the answer',
    );
    await util.countingVotes(this.modPage, e.userVoteLiveResult, 1, 'True');
    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.wasRemoved(
      e.pollingContainer,
      'should not display the polling container after all the smart slides questions is finished',
    );
  }

  async yesNo() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await util.uploadSPresentationForTestingPolls(this.modPage, e.smartSlides2);
    await this.userPage.hasElement(e.chatMessages, 'should display the chat messages for the attendee');
    await this.modPage.closeAllToastNotifications();

    await util.goToSlide(this.modPage, 5);
    await this.modPage.waitAndClick(e.quickPoll);
    await this.modPage.waitAndClick(e.startPoll);
    await this.userPage.hasElement(e.pollingContainer, 'should display the poll question after quick poll starts');
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.modPage.hasText(
      e.userVoteLiveResult,
      'Yes',
      'should display the vote result after the attendee submit the answer',
    );
    await util.countingVotes(this.modPage, e.userVoteLiveResult, 1, 'Yes');
    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.wasRemoved(
      e.pollingContainer,
      'should not display the polling container after the poll is published',
    );
  }

  async typeResponse() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await util.uploadSPresentationForTestingPolls(this.modPage, e.smartSlides2);
    await this.userPage.hasElement(e.chatMessages, 'should display the chat messages for the attendee');
    await this.modPage.closeAllToastNotifications();

    await util.goToSlide(this.modPage, 6);
    await this.modPage.waitAndClick(e.quickPoll);
    await this.modPage.waitAndClick(e.startPoll);
    await this.userPage.hasElement(
      e.pollingContainer,
      'should display the polling container for the user to answer it',
    );
    await this.userPage.fill(e.pollAnswerOptionInput, e.answerMessage);
    await this.userPage.waitAndClick(e.pollSubmitAnswer);
    await this.modPage.hasText(e.userVoteLiveResult, e.answerMessage, 'should display the answer sent by the attendee');
    await util.countingVotes(this.modPage, e.userVoteLiveResult, 1, 'All good!');
    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.wasRemoved(e.pollingContainer, 'should close the polling container after publishing the label');
  }

  async pollAnywhereSlide() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await util.uploadSPresentationForTestingPolls(this.modPage, e.smartSlides2);
    await this.userPage.hasElement(e.chatMessages, 'should display the chat messages for the attendee');
    await this.modPage.closeAllToastNotifications();

    await util.goToSlide(this.modPage, 8);
    await this.modPage.hasElement(
      e.quickPoll,
      'should display the quick poll button when the presentation finishes uploading',
    );
    await this.modPage.waitAndClick(e.quickPoll, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.startPoll);
    await this.userPage.hasElement(e.pollingContainer, 'should display the poll question after quick poll starts');
    await this.userPage.waitAndClick(e.pollAnswerOptionD);
    await this.modPage.hasText(
      e.userVoteLiveResult,
      'D. Very confident',
      'should display the vote result after the poll is answered',
    );
    await util.countingVotes(this.modPage, e.userVoteLiveResult, 1, 'D. Very confident');
    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.wasRemoved(
      e.pollingContainer,
      'should not display the polling container after the poll is published',
    );
  }

  async whiteBox() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await util.uploadSPresentationForTestingPolls(this.modPage, e.smartSlides2);
    await this.userPage.hasElement(e.chatMessages, 'should display the chat messages for the attendee');
    await this.modPage.closeAllToastNotifications();

    await util.goToSlide(this.modPage, 9);
    await this.modPage.hasElement(
      e.quickPoll,
      'should display the quick poll button when the presentation finishes uploading',
    );
    await this.modPage.waitAndClick(e.quickPoll, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.startPoll);
    await this.userPage.hasElement(e.pollingContainer, 'should display the poll question after quick poll starts');
    await this.userPage.waitAndClick(e.pollAnswerOptionD);
    await this.modPage.hasText(
      e.userVoteLiveResult,
      'D. Very confident',
      'should display the vote result after the poll is answered',
    );
    await util.countingVotes(this.modPage, e.userVoteLiveResult, 1, 'D. Very confident');
    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.wasRemoved(
      e.pollingContainer,
      'should not display the polling container after the poll is published',
    );
  }

  // Regression test for issue #25320 (Bug 1), lettered-poll slide: the Smart Slides / Quick Poll
  // parser used to strip parenthetical clauses from the question and collapse the surrounding
  // spaces (e.g. "the dose (one per day) for adults" became "the dosefor adults"). The
  // parenthetical and its spaces must now be preserved.
  async parentheticalQuestionLetterPoll() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await util.uploadSPresentationForTestingPolls(this.modPage, e.smartSlidesBugRepro1);
    // join-sync barrier: the participants panel is closed by default on 4.0,
    // so open it before asserting the attendee's list item
    await this.userPage.waitAndClick(e.usersListSidebarButton);
    await this.userPage.hasElement(e.userListItem, 'should display the user list item for the attendee');
    await this.modPage.closeAllToastNotifications();

    // Slide 1 — lettered poll: "What is the dose (one per day) for adults?"
    await util.goToSlide(this.modPage, 1);
    await this.modPage.hasElement(
      e.quickPoll,
      'should display the quick poll button once the smart slides deck is converted',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await this.modPage.waitAndClick(e.quickPoll, ELEMENT_WAIT_LONGER_TIME);
    await expect(
      this.modPage.page.locator(e.pollQuestionArea),
      'the quick poll question should keep the "(one per day)" clause and its surrounding spaces',
    ).toHaveValue(/dose \(one per day\) for adults/, { timeout: ELEMENT_WAIT_TIME });
    await this.modPage.waitAndClick(e.startPoll);
    await this.modPage.hasText(
      e.currentPollQuestion,
      /dose \(one per day\) for adults/,
      'the started poll question should retain the parenthetical clause',
    );
  }

  // Regression test for issue #25320 (Bug 1), typed-response slide: the parenthetical must be
  // preserved and the surrounding words must not be joined together ("How long (in min) for ..."
  // used to become "How longfor ...").
  // NOTE: the superscript flattening (mg/m³ -> mg/m3) is a separate, out-of-scope issue (Bug 2);
  // we only assert that the parenthetical and its surrounding spaces are kept.
  async parentheticalQuestionTypedResponse() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await util.uploadSPresentationForTestingPolls(this.modPage, e.smartSlidesBugRepro1);
    // join-sync barrier: the participants panel is closed by default on 4.0,
    // so open it before asserting the attendee's list item
    await this.userPage.waitAndClick(e.usersListSidebarButton);
    await this.userPage.hasElement(e.userListItem, 'should display the user list item for the attendee');
    await this.modPage.closeAllToastNotifications();

    // Slide 4 — typed response: "How long (in min) for a 2 mg/m3 sample?"
    await util.goToSlide(this.modPage, 4);
    await this.modPage.hasElement(
      e.quickPoll,
      'should display the quick poll button once the smart slides deck is converted',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await this.modPage.waitAndClick(e.quickPoll, ELEMENT_WAIT_LONGER_TIME);
    const typedQuestion = this.modPage.page.locator(e.pollQuestionArea);
    await expect(
      typedQuestion,
      'the typed-response question should keep the "(in min)" clause',
    ).toHaveValue(/How long \(in min\) for/, { timeout: ELEMENT_WAIT_TIME });
    await expect(
      typedQuestion,
      'the words around the parenthetical must not be joined together (no "longfor")',
    ).not.toHaveValue(/longfor/, { timeout: ELEMENT_WAIT_TIME });
  }

  async pollResultsOnChat() {
    const { pollChatMessage } = this.modPage.settings || {};

    await this.modPage.hasElement(
      e.whiteboard,
      'should display the whiteboard for the moderator when joining the meeting',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await util.startPoll(this.modPage);
    await this.modPage.hasElementDisabled(
      e.publishPollingLabel,
      'should display the publish polling button disabled without any answer sent from the user',
    );
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.modPage.hasElement(
      e.publishPollingLabel,
      'should display the publish polling button enabled after the attendee answered the poll',
    );
    await this.modPage.waitAndClick(e.publishPollingLabel);

    const lastChatPollMessageTextModerator = this.modPage.page.locator(e.chatPollMessageText).last();
    if (!pollChatMessage) {
      await expect(
        lastChatPollMessageTextModerator,
        'should not display the last chat poll message on the chat, so the poll results on the chat',
      ).toBeHidden({ timeout: ELEMENT_WAIT_TIME });
      return;
    }
    await expect(
      lastChatPollMessageTextModerator,
      'should display the last chat poll message on the chat, so the poll results on the chat',
    ).toBeVisible();
    const lastChatPollMessageTextUser = await this.userPage.page.locator(e.chatPollMessageText).last();
    await expect(
      lastChatPollMessageTextUser,
      'should display the poll results on the chat for the attendee',
    ).toBeVisible();
  }

  async pollResultsOnWhiteboard() {
    await this.modPage.hasElement(
      e.whiteboard,
      'should display the whiteboard when the moderator joins the meeting',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await util.startPoll(this.modPage);

    const wbDrawnRectangleLocator = this.modPage.page.locator(e.wbPollShape);
    const initialWbDrawnRectangleCount = await wbDrawnRectangleLocator.count();

    await this.modPage.hasElementDisabled(
      e.publishPollingLabel,
      'should display the publish poll button disabled before the poll is answered',
    );
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.modPage.hasElement(
      e.publishPollingLabel,
      'should display the publish poll button enabled after the attendee answered the poll',
    );
    await this.modPage.waitAndClick(e.publishPollingLabel);
    await expect(
      wbDrawnRectangleLocator,
      'should display a rectangle shape with the poll result on the whiteboard',
    ).toHaveCount(initialWbDrawnRectangleCount + 1);
  }

  async pollResultsInDifferentPresentation() {
    await util.startPoll(this.modPage);
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await util.uploadSPresentationForTestingPolls(this.modPage, e.questionSlideFileName);
    await this.modPage.hasElement(
      e.quickPoll,
      'should display the quick poll on the whiteboard',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.waitAndClick(e.publishPollingLabel);
    // Check poll results
    await this.modPage.hasElement(e.wbPollShape, 'should display the poll shape on the whiteboard');
  }

  async quizLiveResults() {
    await this.modPage.hasElement(
      e.whiteboard,
      'should display the whiteboard for the moderator',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.initUserPage2();
    await util.openQuiz(this.modPage);
    await util.selectQuizCorrectAnswer(this.modPage, 1);
    await this.modPage.waitAndClick(e.startPoll);

    await util.answerPollOption(this.userPage, 'B');
    await util.answerPollOption(this.userPage2, 'C');
    await this.modPage.hasText(e.pollStatus, 'Done', 'should display the quiz as done after both attendees answered');

    const correctRow = util.liveResultRow(this.modPage, this.userPage.username);
    await expect(correctRow.locator(e.userVoteLiveResult), 'should display the first attendee answer').toHaveText('B');
    await expect(
      correctRow.locator(e.quizCorrectResultMark),
      'should mark the first attendee answer as correct',
    ).toBeVisible();
    await expect(
      correctRow.locator(e.quizIncorrectResultMark),
      'should not mark the first attendee answer as incorrect',
    ).toHaveCount(0);

    const incorrectRow = util.liveResultRow(this.modPage, this.userPage2.username);
    await expect(incorrectRow.locator(e.userVoteLiveResult), 'should display the second attendee answer').toHaveText(
      'C',
    );
    await expect(
      incorrectRow.locator(e.quizIncorrectResultMark),
      'should mark the second attendee answer as incorrect',
    ).toBeVisible();
    await expect(
      incorrectRow.locator(e.quizCorrectResultMark),
      'should not mark the second attendee answer as correct',
    ).toHaveCount(0);
  }

  async quizWithoutCorrectAnswer() {
    await this.modPage.hasElement(
      e.whiteboard,
      'should display the whiteboard for the moderator',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await util.openQuiz(this.modPage);
    await this.modPage.hasElementCount(e.correctAnswerLabel, 0, 'should not label any option as correct by default');
    await this.modPage.hasElementDisabled(
      e.startPoll,
      'should display the start quiz button disabled while no correct answer is selected',
    );
    // the disabled button ignores the pointer, so the reason shows in a tooltip on its wrapper
    const startQuizLocator = this.modPage.page.locator(e.startPoll);
    await startQuizLocator.hover({ force: true });
    await expect(
      this.modPage.page.getByText(e.quizNoCorrectAnswerError),
      'should explain that the quiz needs a correct answer',
    ).toBeVisible();
    await startQuizLocator.click({ force: true });
    await this.modPage.wasRemoved(e.publishPollingLabel, 'should not start the quiz without a correct answer');
    await this.userPage.wasRemoved(e.pollingContainer, 'should not display a quiz to the attendee');

    await util.selectQuizCorrectAnswer(this.modPage, 0);
    await this.modPage.hasElementEnabled(
      e.startPoll,
      'should enable the start quiz button once a correct answer is set',
    );
    await this.modPage.waitAndClick(e.startPoll);
    await this.userPage.hasElement(e.pollingContainer, 'should display the quiz to the attendee once started');
  }

  async quizResultsOnChat() {
    const { pollChatMessage } = this.modPage.settings || {};
    test.skip(!pollChatMessage, 'Poll results are not published to the chat');

    await this.modPage.hasElement(
      e.whiteboard,
      'should display the whiteboard for the moderator',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await util.openQuiz(this.modPage);
    await util.selectQuizCorrectAnswer(this.modPage, 1);
    await this.modPage.waitAndClick(e.startPoll);
    await util.answerPollOption(this.userPage, 'B');

    await this.modPage.page.locator(e.showCorrectAnswerCheckbox).setChecked(true);
    await this.modPage.hasElementChecked(
      e.showCorrectAnswerCheckbox,
      'should have the option to display the correct answer to all participants checked',
    );
    await this.modPage.waitAndClick(e.publishPollingLabel);

    const quizResultMessage = this.userPage.page
      .locator(e.chatMessageItem)
      .filter({ has: this.userPage.page.locator(e.chatPollMessageText) })
      .last();
    await expect(
      quizResultMessage,
      'should label the published results as quiz results for the attendee',
    ).toContainText(e.quizResultsChatSender);
    const quizResultChart = quizResultMessage.locator(e.chatPollMessageText);
    await expect(quizResultChart, 'should mark the correct answer in the published quiz results').toContainText('✅ B');
    await expect(
      quizResultChart,
      'should mark only the correct answer in the published quiz results',
    ).not.toContainText(/✅ [ACD]/);
  }

  async startNewPoll() {
    const hasPollStarted = await this.modPage.checkElement(e.cancelPollBtn);
    if (hasPollStarted) {
      await this.modPage.waitAndClick(e.cancelPollBtn);
      await this.modPage.wasRemoved(
        e.publishPollingLabel, 
        'should not display the publish poll button after the poll is canceled'
      );
      await this.userPage.wasRemoved(
        e.pollingContainer,
        'should not display the polling container after the poll is canceled',
      );
    }
    await util.openPoll(this.modPage);
  }

  async getAnswerOptionCount() {
    await this.userPage.hasElement(e.pollingContainer, 'should display the polling container for the attendee');
    return this.userPage.getSelectorCount(e.pollAnswerOptionBtn);
  }

  async typeOnLastChoiceInput() {
    const lastInput = this.modPage.getLocatorByIndex(e.pollOptionItem, -1);
    await lastInput.fill(newInputText);
  }

  async checkLastOptionText() {
    await this.userPage.hasElement(e.pollingContainer, 'should display the polling container for the attendee');
    const lastOptionText = this.userPage.getLocatorByIndex(e.pollAnswerOptionBtn, -1);
    await expect(lastOptionText, 'should display the last option text for the attendee').toHaveText(newInputText);
  }
}
