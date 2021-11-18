require('dotenv').config();
const { expect } = require('@playwright/test');
const parameters = require('./parameters');
const helpers = require('./helpers');
const e = require('./elements');

class Page {
  constructor(browser, page) {
    this.browser = browser;
    this.page = page;
    this.initParameters = Object.assign({}, parameters);
  }

  async init(isModerator, shouldCloseAudioModal, initOptions) {
    const { fullName, meetingId, customParameter } = initOptions || {};

    if (!isModerator) this.initParameters.moderatorPW = '';
    if (fullName) this.initParameters.fullName = fullName;

    this.meetingId = (meetingId) ? meetingId : await helpers.createMeeting(parameters, customParameter);
    const joinUrl = helpers.getJoinURL(this.meetingId, this.initParameters, isModerator, customParameter);
    await this.page.goto(joinUrl);

    if (shouldCloseAudioModal) await this.closeAudioModal();
  }

  async closeAudioModal() {
    await this.page.waitForSelector(e.audioModal);
    await this.page.click(e.closeAudioButton);
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
