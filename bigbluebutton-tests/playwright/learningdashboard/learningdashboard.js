const { MultiUsers } = require("../user/multiusers");
const e = require('../core/elements');
const { openChat } = require('../chat/util');
const { expect } = require("@playwright/test");
const Page = require("../core/page");
const { sleep } = require("../core/helpers");
const { ELEMENT_WAIT_EXTRA_LONG_TIME } = require("../core/constants");
const { openPoll, timeInSeconds, rowFilter } = require("./util");
const { checkTextContent } = require('../core/util');

class LearningDashboard extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async getDashboardPage(context) {
    await this.modPage.waitAndClick(e.manageUsers);

    const [dashboardPage] = await Promise.all([
      context.waitForEvent('page'),
      this.modPage.waitAndClick(e.learningDashboard),
    ]);

    await expect(dashboardPage).toHaveTitle(/Dashboard/);
    this.dashboardPage = new Page(context, dashboardPage);
  }

  async writeOnPublicChat() {
    await openChat(this.modPage);
    await this.modPage.checkElementCount(e.chatUserMessageText, 0);

    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.checkElementCount(e.chatUserMessageText, 1);
    await this.dashboardPage.reloadPage();
    await this.dashboardPage.hasText(e.messageLearningDashboard, '1', ELEMENT_WAIT_EXTRA_LONG_TIME);
  }

  async userTimeOnMeeting() {
    await this.modPage.waitAndClick(e.recordingIndicator);
    await this.modPage.waitAndClick(e.confirmRecording);
    await this.modPage.hasText(e.recordingIndicator, '00:0000:00');

    const timeLocator = this.dashboardPage.getLocator(e.userOnlineTime);
    const timeContent = await (timeLocator).textContent();
    const time = timeInSeconds(timeContent);
    await sleep(1000);
    await this.dashboardPage.reloadPage();
    const timeContentGreater = await (timeLocator).textContent();
    const timeGreater = timeInSeconds(timeContentGreater);

    await expect(timeGreater).toBeGreaterThan(time);
  }

  async polls() {
    // True/False
    await openPoll(this.modPage);
    await this.modPage.type(e.pollQuestionArea, 'True/False?');
    await this.modPage.waitAndClick(e.pollTrueFalse);
    await this.modPage.waitAndClick(e.startPoll);

    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.modPage.hasText(e.numberVotes, '1');
    await this.modPage.waitAndClick(e.cancelPollBtn);

    //ABCD
    await this.modPage.getLocator(e.pollQuestionArea).fill(' ');
    await this.modPage.type(e.pollQuestionArea, 'ABCD?');
    await this.modPage.waitAndClick(e.pollLetterAlternatives);
    await this.modPage.waitAndClick(e.startPoll);
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.modPage.hasText(e.numberVotes, '1');
    await this.modPage.waitAndClick(e.cancelPollBtn);

    //Yes/No/Abstention
    await this.modPage.getLocator(e.pollQuestionArea).fill(' ');
    await this.modPage.type(e.pollQuestionArea, 'Yes/No/Abstention?');
    await this.modPage.waitAndClick(e.pollYesNoAbstentionBtn);
    await this.modPage.waitAndClick(e.startPoll);
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.modPage.hasText(e.numberVotes, '1');
    await this.modPage.waitAndClick(e.cancelPollBtn);

    //User Response
    await this.modPage.getLocator(e.pollQuestionArea).fill(' ');
    await this.modPage.type(e.pollQuestionArea, 'User response?');
    await this.modPage.waitAndClick(e.userResponseBtn);
    await this.modPage.waitAndClick(e.startPoll);
    await this.userPage.waitForSelector(e.pollingContainer);
    await this.userPage.type(e.pollAnswerOptionInput, e.answerMessage);
    await this.userPage.waitAndClick(e.pollSubmitAnswer);
    await this.modPage.hasText(e.numberVotes, '1');
    await this.modPage.waitAndClick(e.cancelPollBtn);

    //Checks
    await this.dashboardPage.reloadPage();
    const activityScore = await rowFilter(this.dashboardPage, 'tr', /Attendee/, e.userActivityScoreDashboard);
    await expect(activityScore).toHaveText(/2/, { timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });
    await this.dashboardPage.waitAndClick(e.pollPanel);
    await this.dashboardPage.hasText(e.pollTotal, '4', ELEMENT_WAIT_EXTRA_LONG_TIME);

    //True / False
    await this.dashboardPage.hasText(e.pollTrueFalseQuestion, 'True/False?');
    await this.dashboardPage.hasText(e.pollTrueFalseAnswer, 'True');

    //ABCD
    await this.dashboardPage.hasText(e.pollABCDQuestion, 'ABCD?');
    await this.dashboardPage.hasText(e.pollABCDAnswer, 'A');

    //Yes No
    await this.dashboardPage.hasText(e.pollYesNoQuestion, 'Yes/No/Abstention?');
    await this.dashboardPage.hasText(e.pollYesNoAnswer, 'Yes');

    // User Response
    await this.dashboardPage.hasText(e.pollUserResponseQuestion, 'User response?');
    await this.dashboardPage.hasText(e.pollUserResponseAnswer, e.answerMessage);
  }

  async basicInfos() {
    // Meeting Status check
    await this.dashboardPage.hasText(e.meetingStatusActiveDashboard, 'Active');
    await this.dashboardPage.reloadPage();

    // Meeting Time Duration check
    const timeLocator = this.dashboardPage.getLocator(e.meetingDurationTimeDashboard);
    const timeContent = await (timeLocator).textContent();
    const array = timeContent.split(':').map(Number);
    const firstTime = array[1] * 3600 + array[2] * 60 + array[3];
    await sleep(5000);
    await this.dashboardPage.reloadPage();
    const timeContentGreater = await (timeLocator).textContent();
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
    const userNameCheck = await rowFilter(this.dashboardPage, 'tr', /Moderator/, e.userNameDashboard);
    await expect(userNameCheck).toHaveText(/Moderator/, { timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });
    // Webcam Time check
    const webcamCheck = await rowFilter(this.dashboardPage, 'tr', /Moderator/, e.userWebcamTimeDashboard);
    await expect(webcamCheck).toHaveText(/00/, { timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });
    // Raise Hand check
    const raiseHandCheck = await rowFilter(this.dashboardPage, 'tr', /Moderator/, e.userRaiseHandDashboard);
    await expect(raiseHandCheck).toHaveText(/1/, { timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });
    // Current Status check
    const userStatusCheck = await rowFilter(this.dashboardPage, 'tr', /Moderator/, e.userStatusDashboard);
    await expect(userStatusCheck).toHaveText(/Online/, { timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });
  }

  async downloadSessionLearningDashboard(testInfo) {
    await this.modPage.waitAndClick(e.optionsButton);
    await this.modPage.waitAndClick(e.logout);
    await this.modPage.waitAndClick('button');

    const downloadSessionLocator = this.dashboardPage.getLocator(e.downloadSessionLearningDashboard);
    const dataCSV = await this.dashboardPage.handleDownload(downloadSessionLocator, testInfo);

    const dataToCheck = [
      'Moderator',
      'Activity Score',
      'Talk time',
      'Webcam Time',
      'Messages',
      'Emojis',
      'Poll Votes',
      'Raise Hands',
      'Left',
      'Join',
      'Duration',
    ]

    await checkTextContent(dataCSV.content, dataToCheck);
  }
}

exports.LearningDashboard = LearningDashboard;
