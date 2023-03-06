const { MultiUsers } = require("../user/multiusers");
const e = require('../core/elements');
const util = require('../polling/util.js');
const { openChat } = require('../chat/util');
const { expect } = require("@playwright/test");
const Page = require("../core/page");
const { sleep } = require("../core/helpers");

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

    await this.dashboardPage.hasText(e.messageLearningDashboard, '1' , 15000);
  }

  async meetingDurationTime() {
    await this.modPage.waitAndClick(e.recordingIndicator);
    await this.modPage.waitAndClick(e.confirmRecording);
    await this.modPage.hasText(e.recordingIndicator, '00:0000:00');

    const timeTest = await (this.dashboardPage.getLocator(e.userOnlineTime)).textContent();

    // /var date = new Date();
    const timeLocator = await this.dashboardPage.getLocator(e.userOnlineTime);
    const html = await timeLocator.innerHTML();

    const [hours, minutes, seconds] = timeTest.split(':').map(Number);
    const timeInSeconds =  hours * 3600 + minutes * 60 + seconds;
    await sleep(10000);

    const timeTestGreater = await (this.dashboardPage.getLocator(e.userOnlineTime)).textContent();
    
    const [hoursGreater, minutesGreater, secondsGreater] = timeTestGreater.split(':').map(Number);
    const timeInSecondsGreater =  hoursGreater * 3600 + minutesGreater * 60 + secondsGreater;

    await expect(timeInSecondsGreater).toBeGreaterThan(timeInSeconds);
    
    console.log(timeTest)
    console.log(timeInSeconds)
    console.log(timeInSecondsGreater)
  }

  async pollsTest() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.polling);
    await this.modPage.type(e.pollQuestionArea, e.pollQuestion);
    await this.modPage.waitAndClick(e.pollTrueFalse);
    await this.modPage.waitAndClick(e.startPoll);

    await this.userPage1.waitAndClick(`${e.pollAnswerOptionBtn}:nth-child(1)`);
    await this.modPage.hasText(e.numberVotes, '1');
    await this.dashboardPage.waitAndClick(`${e.listButtons} button:nth-child(4)`);
    await this.dashboardPage.hasElement(e.pollPanel, 15000);
    await this.dashboardPage.hasText(e.pollTrueFalseQuestion, e.pollQuestion);
    await this.dashboardPage.hasText(e.pollTrueFalseAnswer, 'True')

    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.waitAndClick(e.restartPoll);
    await this.modPage.waitAndClick(e.pollLetterAlternatives);

    await this.modPage.waitAndClick(e.startPoll);
    await this.userPage1.waitAndClick(`${e.pollAnswerOptionBtn}:nth-child(1)`);
    await this.dashboardPage.hasText(e.pollABCDQuestion, e.pollQuestion, 15000);
    await this.dashboardPage.hasText(e.pollABCDAnswer, 'A');

    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.waitAndClick(e.restartPoll);
    await this.modPage.waitAndClick(e.pollYesNoAbstentionBtn);
    await this.modPage.waitAndClick(e.startPoll);
    await this.userPage1.waitAndClick(`${e.pollAnswerOptionBtn}:nth-child(1)`);
    await this.dashboardPage.hasText(e.pollYesNoQuestion, e.pollQuestion, 15000);
    await this.dashboardPage.hasText(e.pollYesNoAnswer, 'Yes');

    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.waitAndClick(e.restartPoll);
    await this.modPage.waitAndClick(e.userResponseBtn);
    await this.modPage.waitAndClick(e.startPoll);
    await this.userPage1.waitForSelector(e.pollingContainer);
    await this.userPage1.type(e.pollAnswerOptionInput, e.answerMessage);
    await this.userPage1.waitAndClick(e.pollSubmitAnswer);

    await this.dashboardPage.hasText(e.pollUserResponseQuestion, e.pollQuestion, 15000);
    await this.dashboardPage.hasText(e.pollUserResponseAnswer, e.answerMessage);
    await this.dashboardPage.hasText(e.pollTotal, '4');
  }

  async basicInfos() {
    await this.modPage.checkElementCount(e.chatUserMessageText, 0);

    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.checkElementCount(e.chatUserMessageText, 1);
    await this.dashboardPage.hasElement(e.meetingStatus);
    await this.dashboardPage.hasElement(e.date);
    await this.dashboardPage.hasText(e.date)
    await this.dashboardPage.hasElement(e.meetingDurationTime);
    await this.dashboardPage.hasText(e.meetingDurationTime, '00:00:00');
    const meetingTimeLocator = await this.dashboardPage.getLocator(e.meetingDurationTime);
    console.log(meetingTimeLocator)
  }
}

exports.LearningDashboard = LearningDashboard;