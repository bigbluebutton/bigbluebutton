import { expect } from '@playwright/test';

import { openPublicChat } from '../chat/util';
import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { checkTextContent } from '../core/util';
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

    const checkPollAnswer = async (question: string, answer: string) => {
      const header = this.dashboardPage.page.locator('div[role="columnheader"]').filter({ hasText: question });
      await expect(header, `should display the "${question}" column header`).toBeVisible();
      const field = await header.getAttribute('data-field');
      const cell = this.dashboardPage.page.locator(`div[role="cell"][data-field="${field}"]`);
      await expect(cell, `should display the correct answer for "${question}"`).toContainText(answer);
    };

    await checkPollAnswer('True/False?', 'True');
    await checkPollAnswer('ABCD?', 'A');
    await checkPollAnswer('Yes/No/Abstention?', 'Yes');
    await checkPollAnswer('User response?', e.answerMessage);
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
  }
}
