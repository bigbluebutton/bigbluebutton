const { MultiUsers } = require("../user/multiusers");
const e = require('../core/elements');
const util = require('../polling/util.js');
const { openChat } = require('../chat/util');
const { expect } = require("@playwright/test");
const Page = require("../core/page");

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
    const meetingTime = await this.modPage.getLocator(e.recordingIndicator);
    //console.log(document.querySelector(e.recordingIndicator).textContent)
  }

  
}

exports.LearningDashboard = LearningDashboard;