require('dotenv').config();
const { expect } = require('@playwright/test');
const parameters = require('./parameters');
const helpers = require('./helpers');
const elements = require('./elements');

class Page {
  constructor(browser, page) {
    this.browser = browser;
    this.page = page;
    this.initParameters = Object.assign({}, parameters);
  }

  async init(isModerator, shouldCloseAudioModal, fullName, meetingId, customParameter) {
    if(!isModerator) this.initParameters.moderatorPW = '';
    if(fullName) this.initParameters.fullName = fullName;
    if(meetingId) this.meetingId = meetingId;
    else this.meetingId = await helpers.createMeeting(parameters, meetingId, customParameter);
    const joinUrl = helpers.getJoinURL(this.meetingId, this.initParameters, isModerator, customParameter);
    await this.page.goto(joinUrl);
    if (shouldCloseAudioModal) await this.closeAudioModal();
  }

  async closeAudioModal() {
    await this.page.waitForSelector(elements.audioModal);
    await this.page.click(elements.closeAudioButton);
  }

  async type(selector, text) {
    await this.page.waitForSelector(selector);
    const handle = await this.page.$(selector);
    await handle.type(text);
  }

  async waitAndClick(selector) {
    await this.page.waitForSelector(selector);
    await this.page.click(selector);
  }
}

module.exports = exports = Page;
