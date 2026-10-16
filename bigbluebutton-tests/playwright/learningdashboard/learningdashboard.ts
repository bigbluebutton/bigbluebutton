import { expect, test } from '@playwright/test';

import { openPublicChat } from '../chat/util';
import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { checkTextContent } from '../core/util';
import { getBlockNoteEditorLocator, startSharedNotesBlockNote } from '../sharednotes/blocknote/util';
import { MultiUsers } from '../user/multiusers';
import { openPoll, rowFilter, timeInSeconds } from './util';

export class LearningDashboard extends MultiUsers {
  public dashboardPage!: Page;

  async getDashboardPage() {
    const [dashboardPage] = await Promise.all([
      this.modPage?.context?.waitForEvent('page'),
      this.modPage.waitAndClick(e.learningDashboardSidebarButton),
    ]);

    if (!dashboardPage) throw new Error('Dashboard page not found');

    await expect(dashboardPage).toHaveTitle(/Dashboard/);
    this.dashboardPage = new Page(this.modPage.browser, dashboardPage, this.modPage?.testInfo);
  }

  async writeOnPublicChat() {
    await openPublicChat(this.modPage);
    await this.modPage.hasElementCount(e.chatUserMessageText, 0, 'should not have any messages yet');

    await this.modPage.fill(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasElementCount(e.chatUserMessageText, 1, 'should display the sent message');
    await this.dashboardPage.reloadPage();
    await this.dashboardPage.hasText(
      e.messageLearningDashboard,
      '1',
      'should display the correct amount of messages sent',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
  }

  async editSharedNotes() {
    const { sharedNotesEnabled } = this.modPage.settings || {};
    test.skip(!sharedNotesEnabled, 'Shared notes are disabled');

    // the moderator and the attendee edit the notes; the second attendee never opens them
    await startSharedNotesBlockNote(this.modPage);
    await getBlockNoteEditorLocator(this.modPage).pressSequentially(e.message);
    await startSharedNotesBlockNote(this.userPage);
    await getBlockNoteEditorLocator(this.userPage).pressSequentially(e.message);

    const moderatorSharedNotes = await rowFilter(this.dashboardPage, /Moderator/, e.sharedNotesLearningDashboard);
    const attendeeSharedNotes = await rowFilter(this.dashboardPage, /Attendee/, e.sharedNotesLearningDashboard);
    const bystanderSharedNotes = await rowFilter(this.dashboardPage, /Bystander/, e.sharedNotesLearningDashboard);
    // the dashboard data is refreshed every few seconds, so reload until the counts show up
    await expect(async () => {
      await this.dashboardPage.reloadPage();
      await expect(moderatorSharedNotes, 'should count the shared notes edits of the moderator').toHaveText(
        /^[1-9]\d*$/,
        { timeout: ELEMENT_WAIT_TIME },
      );
      await expect(attendeeSharedNotes, 'should count the shared notes edits of the attendee').toHaveText(
        /^[1-9]\d*$/,
        { timeout: ELEMENT_WAIT_TIME },
      );
      await expect(bystanderSharedNotes, 'should list the user who never edited the notes').toHaveCount(1);
    }).toPass({ timeout: ELEMENT_WAIT_EXTRA_LONG_TIME * 2 });
    // the dashboard leaves the cell empty when the count is 0
    await expect(
      bystanderSharedNotes,
      'should not count shared notes edits for the user who never edited them',
    ).toHaveText('');
  }

  async userTimeOnMeeting() {
    // start recording
    await this.modPage.waitAndClick(e.recordingIndicator);
    await this.modPage.waitAndClick(e.confirmRecordingButton);
    await this.modPage.hasText(e.recordingIndicator, '00:00', 'should start recording at the initial time');

    const timeLocator = this.dashboardPage.page.locator(e.userOnlineTime);
    const timeContent = await (timeLocator).textContent();
    if (!timeContent) throw new Error('Time content is null');
    const time = timeInSeconds(timeContent);
    await this.dashboardPage.page.waitForTimeout(1000);
    // reload page and check if time is greater
    await this.dashboardPage.reloadPage();
    const timeContentGreater = await timeLocator.textContent();
    if (!timeContentGreater) throw new Error('Time content is null');
    const timeGreater = timeInSeconds(timeContentGreater);

    await expect(timeGreater).toBeGreaterThan(time);
  }

  async polls() {
    // True/False
    await openPoll(this.modPage);
    await this.modPage.fill(e.pollQuestionArea, 'True/False?');
    await this.modPage.waitAndClick(e.pollTrueFalse);
    await this.modPage.waitAndClick(e.startPoll);

    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.modPage.hasText(e.userVoteLiveResult, 'True', 'should display the user vote live result');
    await this.modPage.waitAndClick(e.cancelPollBtn);

    // ABCD
    await this.modPage.page.locator(e.pollQuestionArea).fill(' ');
    await this.modPage.fill(e.pollQuestionArea, 'ABCD?');
    await this.modPage.waitAndClick(e.pollLetterAlternatives);
    await this.modPage.waitAndClick(e.startPoll);
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.modPage.hasText(e.userVoteLiveResult, 'A', 'should display the user vote live result');
    await this.modPage.waitAndClick(e.cancelPollBtn);

    // Yes/No/Abstention
    await this.modPage.page.locator(e.pollQuestionArea).fill(' ');
    await this.modPage.fill(e.pollQuestionArea, 'Yes/No/Abstention?');
    await this.modPage.waitAndClick(e.pollYesNoAbstentionBtn);
    await this.modPage.waitAndClick(e.startPoll);
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.modPage.hasText(e.userVoteLiveResult, 'Yes', 'should display the user vote live result');
    await this.modPage.waitAndClick(e.cancelPollBtn);

    // User Response
    await this.modPage.page.locator(e.pollQuestionArea).fill(' ');
    await this.modPage.fill(e.pollQuestionArea, 'User response?');
    await this.modPage.waitAndClick(e.userResponseBtn);
    await this.modPage.waitAndClick(e.startPoll);
    await this.userPage.waitForSelector(e.pollingContainer);
    await this.userPage.fill(e.pollAnswerOptionInput, e.answerMessage);
    await this.userPage.waitAndClick(e.pollSubmitAnswer);
    await this.modPage.hasText(e.userVoteLiveResult, e.answerMessage, 'should display the user vote live result');
    await this.modPage.waitAndClick(e.cancelPollBtn);

    // Checks
    await this.dashboardPage.reloadPage();
    const activityScore = await rowFilter(this.dashboardPage, /Attendee/, e.userActivityScoreDashboard);
    await expect(activityScore).toHaveText(/2/, { timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });
    await this.dashboardPage.waitAndClick(e.pollPanel);
    await this.dashboardPage.hasText(
      e.pollTotal,
      '4',
      'should display the correct amount of polls started in the session',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    await this.checkColumnAnswer('True/False?', 'True');
    await this.checkColumnAnswer('ABCD?', 'A');
    await this.checkColumnAnswer('Yes/No/Abstention?', 'Yes');
    await this.checkColumnAnswer('User response?', e.answerMessage);
  }

  async pollsWithoutQuestionNumbering() {
    await openPoll(this.modPage);
    for (const answer of ['A', 'B', 'C']) {
      await this.runPollWithoutQuestion(e.pollLetterAlternatives, answer);
    }

    await this.dashboardPage.reloadPage();
    await this.dashboardPage.waitAndClick(e.pollPanel);
    await this.dashboardPage.hasText(
      e.pollTotal,
      '3',
      'should count the 3 answered polls',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await expect
      .poll(() => this.numberedColumnHeaders('Poll'), {
        message: 'should number the polls in the order they were asked, newest first',
        timeout: ELEMENT_WAIT_EXTRA_LONG_TIME,
      })
      .toEqual(['Poll 3', 'Poll 2', 'Poll 1']);
    await this.checkColumnAnswer(/^Poll 1$/, 'A');
    await this.checkColumnAnswer(/^Poll 2$/, 'B');
    await this.checkColumnAnswer(/^Poll 3$/, 'C');

    // Hovering a header shows when the poll was asked
    await this.dashboardPage.page
      .locator(e.dashboardColumnHeader)
      .filter({ hasText: /^Poll 1$/ })
      .locator(e.dashboardColumnHeaderTitle)
      .hover();
    await expect(
      this.dashboardPage.page.locator(e.dashboardHeaderTooltip),
      'should show the date and time the poll was asked',
    ).toHaveText(/\d{1,2}:\d{2}:\d{2}/);

    // A new poll must not renumber the existing columns
    await this.runPollWithoutQuestion(e.pollLetterAlternatives, 'D');
    await this.dashboardPage.reloadPage();
    await this.dashboardPage.waitAndClick(e.pollPanel);
    await this.dashboardPage.hasText(
      e.pollTotal,
      '4',
      'should count the 4 answered polls',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await expect
      .poll(() => this.numberedColumnHeaders('Poll'), {
        message: 'should keep the existing poll numbers after a new poll',
        timeout: ELEMENT_WAIT_EXTRA_LONG_TIME,
      })
      .toEqual(['Poll 4', 'Poll 3', 'Poll 2', 'Poll 1']);
    await this.checkColumnAnswer(/^Poll 3$/, 'C');
    await this.checkColumnAnswer(/^Poll 4$/, 'D');
  }

  async quizzesWithoutQuestionNumbering() {
    await openPoll(this.modPage);
    await this.modPage.waitForSelector(e.pollQuestionArea);
    const quizTab = this.modPage.page.locator(e.quizTab);
    test.skip(!(await quizTab.isVisible()), 'Quizzes are disabled');

    for (const answer of ['B', 'C']) {
      await quizTab.click();
      await this.runPollWithoutQuestion(e.pollLetterAlternatives, answer, {
        correctAnswerIndex: 'ABCD'.indexOf(answer),
      });
    }

    await this.dashboardPage.reloadPage();
    await this.dashboardPage.waitAndClick(e.quizPanel);
    await expect
      .poll(() => this.numberedColumnHeaders('Quiz'), {
        message: 'should number the quizzes in the order they were asked, newest first',
        timeout: ELEMENT_WAIT_EXTRA_LONG_TIME,
      })
      .toEqual(['Quiz 2', 'Quiz 1']);
    await this.checkColumnAnswer(/^Quiz 1$/, 'B');
    await this.checkColumnAnswer(/^Quiz 2$/, 'C');
  }

  async sessionDataPollsInCreationOrder() {
    // Past four polls the dashboard data no longer keeps them in creation order
    const polls = [
      { type: e.pollLetterAlternatives, answer: 'A' },
      { type: e.pollLetterAlternatives, answer: 'B' },
      { type: e.pollLetterAlternatives, answer: 'C' },
      { type: e.pollLetterAlternatives, answer: 'D' },
      { type: e.pollTrueFalse, answer: 'True' },
      { type: e.pollYesNoAbstentionBtn, answer: 'Yes' },
    ];
    await openPoll(this.modPage);
    for (const { type, answer } of polls) {
      await this.runPollWithoutQuestion(type, answer);
    }

    await this.dashboardPage.reloadPage();
    await this.dashboardPage.waitAndClick(e.pollPanel);
    await this.dashboardPage.hasText(
      e.pollTotal,
      '6',
      'should count the 6 answered polls',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    const downloadSessionLocator = this.dashboardPage.page.locator(e.downloadSessionLearningDashboard);
    const { content } = await this.dashboardPage.handleDownload(downloadSessionLocator);
    const [headerLine, ...rows] = content.split('\r\n');
    const header = headerLine.split(',');
    const attendeeRow = rows.find((row) => row.startsWith('"Attendee"'));
    if (!attendeeRow) throw new Error('Attendee row not found in the session data');
    const attendeeValues = [...attendeeRow.matchAll(/"([^"]*)"/g)].map(([, value]) => value);
    const answersByPollNumber = polls.map((_, index) => attendeeValues[header.indexOf(`Poll ${index + 1}`)]);

    expect(answersByPollNumber, 'should list the polls in the order they were asked').toEqual(
      polls.map(({ answer }) => answer),
    );
  }

  private async runPollWithoutQuestion(
    responseTypeSelector: string,
    answer: string,
    { correctAnswerIndex }: { correctAnswerIndex?: number } = {},
  ) {
    await this.modPage.page.locator(e.pollQuestionArea).fill('');
    await this.modPage.waitAndClick(responseTypeSelector);
    if (correctAnswerIndex !== undefined) {
      // The tooltip replaces the checkbox id, so reach it through its answer option row
      await this.modPage.page
        .locator(e.pollOptionItem)
        .nth(correctAnswerIndex)
        .locator('xpath=ancestor::*[.//input[@type="checkbox"]][1]//input[@type="checkbox"]')
        .check();
    }
    await this.modPage.waitAndClick(e.startPoll);
    await this.userPage.page
      .locator(e.pollAnswerOptionBtn, { hasText: new RegExp(`^${answer}$`) })
      .click({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await this.modPage.hasText(e.userVoteLiveResult, answer, 'should display the user vote live result');
    await this.modPage.waitAndClick(e.cancelPollBtn);
  }

  private async numberedColumnHeaders(label: 'Poll' | 'Quiz') {
    const headers = await this.dashboardPage.page.locator(e.dashboardColumnHeader).allTextContents();
    return headers.map((header) => header.trim()).filter((header) => new RegExp(`^${label} \\d+$`).test(header));
  }

  private async checkColumnAnswer(question: string | RegExp, answer: string) {
    const header = this.dashboardPage.page.locator(e.dashboardColumnHeader).filter({ hasText: question });
    await expect(header, `should display the "${question}" column header`).toBeVisible();
    const field = await header.getAttribute('data-field');
    const cell = this.dashboardPage.page.locator(`div[role="cell"][data-field="${field}"]`);
    await expect(cell, `should display the correct answer for "${question}"`).toContainText(answer, {
      timeout: ELEMENT_WAIT_EXTRA_LONG_TIME,
    });
  }

  async basicInfos() {
    // Meeting Status check
    await this.dashboardPage.hasText(
      e.meetingStatusActiveDashboard,
      'Active',
      'should display "Active" status',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.dashboardPage.reloadPage();

    // Meeting Time Duration check
    const timeLocator = this.dashboardPage.page.locator(e.meetingDurationTimeDashboard);
    const timeContent = await timeLocator.textContent();
    if (!timeContent) throw new Error('Time content is null');
    const array = timeContent.split(':').map(Number);
    const firstTime = array[1] * 3600 + array[2] * 60 + array[3];
    await this.dashboardPage.page.waitForTimeout(10000);
    await this.dashboardPage.reloadPage();
    const timeContentGreater = await timeLocator.textContent();
    if (!timeContentGreater) throw new Error('Time content is null');
    const arrayGreater = timeContentGreater.split(':').map(Number);
    const secondTime = arrayGreater[1] * 3600 + arrayGreater[2] * 60 + arrayGreater[3];

    await expect(secondTime).toBeGreaterThan(firstTime);
  }

  async overview() {
    await this.modPage.waitAndClick(e.joinVideo);
    await this.modPage.waitAndClick(e.startSharingWebcam);
    await this.modPage.waitAndClick(e.raiseHandBtn);

    await this.dashboardPage.reloadPage();
    // User Name check
    const userNameCheck = await rowFilter(this.dashboardPage, /Moderator/, e.userNameDashboard);
    await expect(userNameCheck).toHaveText(/Moderator/, { timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });
    // Webcam Time check
    const webcamCheck = await rowFilter(this.dashboardPage, /Moderator/, e.userWebcamTimeDashboard);
    await expect(webcamCheck).toHaveText(/00/, { timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });
    // Raise Hand check
    const raiseHandCheck = await rowFilter(this.dashboardPage, /Moderator/, e.userRaiseHandDashboard);
    await expect(raiseHandCheck).toHaveText(/1/, { timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });
    // Current Status check
    const userStatusCheck = await rowFilter(this.dashboardPage, /Moderator/, e.userStatusDashboard);
    await expect(userStatusCheck).toHaveText(/Online/, { timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });
  }

  async downloadSessionLearningDashboard() {
    await this.modPage.logoutFromMeeting();
    await this.modPage.waitAndClick('button');

    const downloadSessionLocator = this.dashboardPage.page.locator(e.downloadSessionLearningDashboard);
    const dataCSV = await this.dashboardPage.handleDownload(downloadSessionLocator);

    const dataToCheck = [
      'Moderator',
      'Activity Score',
      'Talk time',
      'Webcam Time',
      'Messages',
      'Reactions',
      'Poll Votes',
      'Raise Hands',
      'Left',
      'Join',
      'Duration',
    ];

    await checkTextContent(dataCSV.content, dataToCheck);
    expect(dataCSV.content, 'should not include an anonymous row when no anonymous polls were created').not.toMatch(
      /^"Anonymous"(?:,|$)/m,
    );
  }
}
