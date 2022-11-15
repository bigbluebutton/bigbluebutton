require('dotenv').config();
const { expect, default: test } = require('@playwright/test');
const { readFileSync } = require('fs');
const parameters = require('./parameters');
const helpers = require('./helpers');
const e = require('./elements');
const { ELEMENT_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME, VIDEO_LOADING_WAIT_TIME } = require('./constants');
const { checkElement, checkElementLengthEqualTo } = require('./util');
const { generateSettingsData, getSettings } = require('./settings');

class Page {
  constructor(browser, page) {
    this.browser = browser;
    this.page = page;
    this.initParameters = Object.assign({}, parameters);
  }

  async bringToFront() {
    await this.page.bringToFront();
  }

  async getLastTargetPage(context) {
    const contextPages = await context.pages();
    return new Page(this.browser, contextPages[contextPages.length - 1]);
  }

  async init(isModerator, shouldCloseAudioModal, initOptions) {
    const { fullName, meetingId, customParameter, customMeetingId } = initOptions || {};

    if (!isModerator) this.initParameters.moderatorPW = '';
    if (fullName) this.initParameters.fullName = fullName;
    this.username = this.initParameters.fullName;

    this.meetingId = (meetingId) ? meetingId : await helpers.createMeeting(parameters, customParameter, customMeetingId);
    const joinUrl = helpers.getJoinURL(this.meetingId, this.initParameters, isModerator, customParameter);
    const response = await this.page.goto(joinUrl);
    await expect(response.ok()).toBeTruthy();
    const hasErrorLabel = await this.checkElement(e.errorMessageLabel);
    await expect(hasErrorLabel, 'Getting error when joining. Check if the BBB_URL and BBB_SECRET are set correctly').toBeFalsy();
    this.settings = await generateSettingsData(this.page);
    const { autoJoinAudioModal } = this.settings;
    if (shouldCloseAudioModal && autoJoinAudioModal) await this.closeAudioModal();
  }

  async handleDownload(selector, testInfo, timeout = ELEMENT_WAIT_TIME) {
    const [download] = await Promise.all([
      this.page.waitForEvent('download', { timeout }),
      this.waitAndClick(selector, timeout),
    ]);
    await expect(download).toBeTruthy();
    const filePath = await download.path();
    const content = await readFileSync(filePath, 'utf8');
    await testInfo.attach('downloaded', { body: download });

    return {
      download,
      content,
    }
  }

  async handleNewTab(selector, context){
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      this.waitAndClick(selector),
    ]);
    return newPage;
  }

  async joinMicrophone() {
    await this.waitForSelector(e.audioModal);
    await this.waitAndClick(e.microphoneButton);
    await this.waitForSelector(e.stopHearingButton);
    await this.waitAndClick(e.joinEchoTestButton);
    await this.waitForSelector(e.establishingAudioLabel);
    await this.wasRemoved(e.establishingAudioLabel, ELEMENT_WAIT_LONGER_TIME);
    await this.waitForSelector(e.isTalking);
  }

  async leaveAudio() {
    await this.waitAndClick(e.audioDropdownMenu);
    await this.waitAndClick(e.leaveAudio);
    await this.waitForSelector(e.joinAudio);
  }

  async logoutFromMeeting() {
    await this.waitAndClick(e.optionsButton);
    await this.waitAndClick(e.logout);
  }

  async shareWebcam(shouldConfirmSharing = true, videoPreviewTimeout = ELEMENT_WAIT_TIME) {
    const { webcamSharingEnabled } = getSettings();
    test.fail(!webcamSharingEnabled, 'Webcam sharing is disabled');

    await this.waitAndClick(e.joinVideo);
    if (shouldConfirmSharing) {
      await this.bringToFront();
      await this.waitForSelector(e.videoPreview, videoPreviewTimeout);
      await this.waitAndClick(e.startSharingWebcam);
    }
    await this.waitForSelector(e.webcamContainer, VIDEO_LOADING_WAIT_TIME);
    await this.waitForSelector(e.leaveVideo, VIDEO_LOADING_WAIT_TIME);
    await this.wasRemoved(e.webcamConnecting);
  }

  getLocator(selector) {
    return this.page.locator(selector);
  }

  getLocatorByIndex(selector, index) {
    return this.page.locator(selector).nth(index);
  }

  async getSelectorCount(selector) {
    const locator = this.getLocator(selector);
    return locator.count();
  }

  async getCopiedText(context) {
    await context.grantPermissions(['clipboard-write', 'clipboard-read'], { origin: process.env.BBB_URL});
    return this.page.evaluate(async () => navigator.clipboard.readText());
  }

  async closeAudioModal() {
    await this.waitForSelector(e.audioModal, ELEMENT_WAIT_LONGER_TIME);
    await this.waitAndClick(e.closeModal);
  }

  async waitForSelector(selector, timeout = ELEMENT_WAIT_TIME) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async waitUntilHaveCountSelector(selector, count, timeout = ELEMENT_WAIT_TIME) {
    await this.page.waitForFunction(
      checkElementLengthEqualTo,
      [selector, count],
      { timeout },
    );
  }

  async type(selector, text) {
    const handle = this.getLocator(selector);
    await handle.focus();
    await handle.type(text, { timeout: ELEMENT_WAIT_TIME });
  }

  async waitAndClickElement(element, index = 0, timeout = ELEMENT_WAIT_TIME) {
    await this.waitForSelector(element, timeout);
    await this.page.evaluate(([elem, i]) => {
      document.querySelectorAll(elem)[i].click();
    }, [element, index]);
  }

  async waitAndClick(selector, timeout = ELEMENT_WAIT_TIME) {
    await this.waitForSelector(selector, timeout);
    await this.page.focus(selector);
    await this.page.click(selector, { timeout });
  }

  async clickOnLocator(locator, timeout = ELEMENT_WAIT_TIME) {
    await locator.click({ timeout });
  }

  async checkElement(selector, index = 0) {
    return this.page.evaluate(checkElement, [selector, index]);
  }

  async wasRemoved(selector, timeout = ELEMENT_WAIT_TIME) {
    const locator = this.getLocator(selector);
    await expect(locator).toBeHidden({ timeout });
  }

  async wasNthElementRemoved(selector, count, timeout = ELEMENT_WAIT_TIME) {
    const locator = this.getLocator(':nth-match(' + selector + ',' + count + ')');
    await expect(locator).toBeHidden({ timeout });
  }

  async hasElement(selector, timeout = ELEMENT_WAIT_TIME) {
    const locator = this.getLocator(selector);
    await expect(locator).toBeVisible({ timeout });
  }

  async hasNElements(selector, count, timeout = ELEMENT_WAIT_TIME) {
    const locator = this.getLocator(':nth-match(' + selector + ',' + count + ')');
    await expect(locator).toBeVisible({ timeout });
  }

  async hasElementDisabled(selector, timeout = ELEMENT_WAIT_TIME) {
    const locator = this.getLocator(selector);
    await expect(locator).toBeDisabled({ timeout });
  }

  async hasElementEnabled(selector, timeout = ELEMENT_WAIT_TIME) {
    const locator = this.getLocator(`${selector}:not([disabled])`);
    await expect(locator).toBeEnabled({ timeout });
  }

  async hasText(selector, text, timeout = ELEMENT_WAIT_TIME) {
    const locator = this.getLocator(selector).first();
    await expect(locator).toContainText(text, { timeout });
  }

  async press(key) {
    await this.page.keyboard.press(key);
  }

  async down(key) {
    await this.page.keyboard.down(key);
  }

  async up(key) {
    await this.page.keyboard.up(key);
  }

  async dragDropSelector(selector, position) {
    await this.page.locator(selector).dragTo(this.page.locator(position));
  }

  async checkElementCount(selector, count) {
    const locator = await this.page.locator(selector);
    await expect(locator).toHaveCount(count);
  }

  async hasValue(selector, value) {
    const locator  = await this.page.locator(selector);
    await expect(locator).toHaveValue(value);
  }
}

module.exports = exports = Page;
