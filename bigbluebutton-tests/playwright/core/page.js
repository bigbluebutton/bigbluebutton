require('dotenv').config();
const { expect } = require('@playwright/test');
const parameters = require('./parameters');
const helpers = require('./helpers');
const e = require('./elements');
const { ELEMENT_WAIT_TIME } = require('./constants');

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

  async waitForSelector(selector, timeout = ELEMENT_WAIT_TIME) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async type(selector, text) {
    await this.waitForSelector(selector);
    const handle = await this.page.$(selector);
    await handle.focus();
    await handle.type(text);
  }

  async waitAndClick(selector, timeout = ELEMENT_WAIT_TIME) {
    await this.waitForSelector(selector, timeout);
    await this.page.focus(selector);
    await this.page.click(selector);
  }
}

module.exports = exports = Page;
