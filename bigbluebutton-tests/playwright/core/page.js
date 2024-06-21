require('dotenv').config();
const { expect, default: test } = require('@playwright/test');
const { readFileSync } = require('fs');
const parameters = require('./parameters');
const helpers = require('./helpers');
const e = require('./elements');
const { env } = require('node:process');
const { ELEMENT_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME, VIDEO_LOADING_WAIT_TIME, ELEMENT_WAIT_EXTRA_LONG_TIME } = require('./constants');
const { checkElement, checkElementLengthEqualTo } = require('./util');
const { generateSettingsData } = require('./settings');

class Page {
  constructor(browser, page) {
    this.browser = browser;
    this.page = page;
    this.initParameters = Object.assign({}, parameters);
    try {
      this.context = page.context();
    } catch { } // page doesn't have context - likely an iframe
  }

  async bringToFront() {
    await this.page.bringToFront();
  }

  async getLastTargetPage(context) {
    const contextPages = await context.pages();
    return new Page(this.browser, contextPages[contextPages.length - 1]);
  }

  async init(isModerator, shouldCloseAudioModal, initOptions) {
    const { fullName, meetingId, createParameter, joinParameter, customMeetingId, isRecording, shouldCheckAllInitialSteps } = initOptions || {};

    if (!isModerator) this.initParameters.moderatorPW = '';
    if (fullName) this.initParameters.fullName = fullName;
    this.username = this.initParameters.fullName;

    if (env.CONSOLE !== undefined) await helpers.setBrowserLogs(this.page);

    this.meetingId = (meetingId) ? meetingId : await helpers.createMeeting(parameters, createParameter, customMeetingId, this.page);
    const joinUrl = helpers.getJoinURL(this.meetingId, this.initParameters, isModerator, joinParameter);
    const response = await this.page.goto(joinUrl);
    await expect(response.ok()).toBeTruthy();
    const hasErrorLabel = await this.checkElement(e.errorMessageLabel);
    await expect(hasErrorLabel, 'Getting error when joining. Check if the BBB_URL and BBB_SECRET are set correctly').toBeFalsy();
    if (shouldCheckAllInitialSteps != undefined ? shouldCheckAllInitialSteps : true) {
      await this.waitForSelector('div#layout', ELEMENT_WAIT_EXTRA_LONG_TIME);
      this.settings = await generateSettingsData(this.page);
      const { autoJoinAudioModal } = this.settings;
      if (isRecording && !isModerator) await this.closeRecordingModal();
      if (shouldCloseAudioModal && autoJoinAudioModal) await this.closeAudioModal();
    }
  }

  async handleDownload(locator, testInfo, timeout = ELEMENT_WAIT_TIME) {
    const [download] = await Promise.all([
      this.page.waitForEvent('download', { timeout }),
      locator.click({ timeout }),
    ]);
    await expect(download).toBeTruthy();
    const filePath = await download.path();
    const content = await readFileSync(filePath, 'utf8');
    await testInfo.attach('downloaded', { path: filePath });

    return {
      download,
      content,
    }
  }

  async handleNewTab(selector, context) {
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
    const { directLeaveButton } = this.settings;

    if (directLeaveButton) {
      await this.waitAndClick(e.leaveMeetingDropdown);
      await this.waitAndClick(e.directLogoutButton);
    } else {
      await this.waitAndClick(e.optionsButton);
      await this.waitAndClick(e.optionsLogoutButton);
    }
  }

  async shareWebcam(shouldConfirmSharing = true, videoPreviewTimeout = ELEMENT_WAIT_TIME) {
    const { webcamSharingEnabled } = this.settings || await generateSettingsData(this.page);

    test.fail(!webcamSharingEnabled, 'Webcam sharing is disabled');

    if(!webcamSharingEnabled) {
      return this.wasRemoved(e.joinVideo)
    }
    await this.waitAndClick(e.joinVideo);
    if (shouldConfirmSharing) {
      await this.bringToFront();
      await this.waitForSelector(e.videoPreview, videoPreviewTimeout);
      await this.waitAndClick(e.startSharingWebcam);
    }
    await this.waitForSelector(e.webcamContainer, VIDEO_LOADING_WAIT_TIME);
    await this.waitForSelector(e.leaveVideo, VIDEO_LOADING_WAIT_TIME);
    await this.wasRemoved(e.webcamConnecting, VIDEO_LOADING_WAIT_TIME);
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
    await context.grantPermissions(['clipboard-write', 'clipboard-read'], { origin: process.env.BBB_URL });
    return this.page.evaluate(async () => navigator.clipboard.readText());
  }

  async closeAudioModal() {
    await this.waitForSelector(e.audioModal, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.waitAndClick(e.closeModal);
  }

  async closeRecordingModal() {
    await this.waitForSelector(e.simpleModal, ELEMENT_WAIT_LONGER_TIME);
    await this.waitAndClick(e.confirmRecording);
  }

  async waitForSelector(selector, timeout = ELEMENT_WAIT_TIME) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async waitForSelectorDetached(selector, timeout = ELEMENT_WAIT_TIME) {
    await this.page.waitForSelector(selector, { state: 'detached', timeout });
  }

  async getElementBoundingBox(selector) {
    const element = await this.page.$(selector);
    return element.boundingBox();
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

  async haveTitle(title) {
    await expect(this.page).toHaveTitle(title);
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

  async mouseDoubleClick(x, y) {
    await this.page.mouse.dblclick(x, y);
  }

  async dragDropSelector(selector, position) {
    await this.getLocator(selector).dragTo(this.page.locator(position), { timeout: ELEMENT_WAIT_TIME });
  }

  async dragAndDropWebcams(position) {
    await this.getLocator(e.webcamContainer).first().hover({ timeout: 5000 });
    await this.page.mouse.down();
    await this.getLocator(e.whiteboard).hover({ timeout: 5000 });   // action for dispatching isDragging event
    await this.getLocator(position).hover({ timeout: 5000 });
    await this.page.mouse.up();
  }

  async checkElementCount(selector, count) {
    const locator = await this.page.locator(selector);
    await expect(locator).toHaveCount(count, { timeout: ELEMENT_WAIT_LONGER_TIME });
  }

  async hasValue(selector, value) {
    const locator = await this.page.locator(selector);
    await expect(locator).toHaveValue(value);
  }

  async backgroundColorTest(selector, color) {
    await expect(await this.page.$eval(selector, e => getComputedStyle(e).backgroundColor)).toBe(color);
  }

  async textColorTest(selector, color) {
    await expect(await this.page.$eval(selector, e => getComputedStyle(e).color)).toBe(color);
  }

  async fontSizeCheck(selector, size) {
    await expect(await this.page.$eval(selector, e => getComputedStyle(e).fontSize)).toBe(size);
  }

  async comparingSelectorsBackgroundColor(selector1, selector2) {
    const getBackgroundColorComputed = (locator) => locator.evaluate((elem) => getComputedStyle(elem).backgroundColor);
    const avatarInToastElementColor = this.page.locator(selector1);
    const avatarInUserListColor = this.page.locator(selector2);
    await expect(getBackgroundColorComputed(avatarInToastElementColor)).toStrictEqual(getBackgroundColorComputed(avatarInUserListColor));
  }

  async reloadPage() {
    await this.page.reload();
  }

  async selectSlide(slideOption, timeout = ELEMENT_WAIT_TIME) {
    await this.page.locator(e.skipSlide).selectOption({ label: slideOption }, { timeout });
  }

  async closeAllToastNotifications() {
    await this.page.waitForSelector(e.whiteboard);
      const closeToastBtnLocator = this.page.locator(e.closeToastBtn);
      while (await closeToastBtnLocator.count() > 0) {
        await this.page.click(e.closeToastBtn);
        await helpers.sleep(1000);  // expected time to toast notification disappear
      }
  }

  async setHeightWidthViewPortSize() {
    await this.page.setViewportSize({ width: 1366, height: 768 });
  }

  async getYoutubeFrame() {
    await this.waitForSelector(e.youtubeFrame);
    const iframeElement = await this.getLocator('iframe').elementHandle();
    const frame = await iframeElement.contentFrame();
    await frame.waitForURL(/youtube/, { timeout: ELEMENT_WAIT_TIME });
    const ytFrame = new Page(this.page.browser, frame);
    return ytFrame;
  }
}

module.exports = exports = Page;
