const { MultiUsers } = require("../user/multiusers");
const e = require('../core/elements');
const util = require('../polling/util.js');

class LearningDashboard extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }
  async createMeeting() {
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

    await this.modPage.hasElement(e.wbTypedText);
  }
}

exports.LearningDashboard = LearningDashboard;