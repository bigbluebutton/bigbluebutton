require('dotenv').config();
const { expect, default: test } = require('@playwright/test');
const { readFileSync } = require('fs');
const parameters = require('./parameters');
const helpers = require('./helpers');
const e = require('./elements');
const { env } = require('node:process');
const { ELEMENT_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME, VIDEO_LOADING_WAIT_TIME } = require('./constants');
const { checkElement, checkElementLengthEqualTo } = require('./util');
const { generateSettingsData, getSettings } = require('./settings');

async function strcolors(msg) {
  var arguments = await Promise.all(msg.args().map(itm => itm.jsonValue()));
  var s = arguments[0];
  var split_str = s.split("%");
  var result = "";

  for (i=1; i<arguments.length; i++) {
    if (split_str[i].startsWith('s')) {
    } else if (split_str[i].startsWith('c')) {
      // arguments[i] is css formatting
      var styles = arguments[i].split(';');
      for (style of styles) {
	style = style.trim();
	if (style.startsWith('color:')) {
	  var color = style.substr(6).trim();
	  result += color + " ";
	}
      }
    } else {
    }
  }

  return result;
}

async function strformat(msg) {
  var arguments = await Promise.all(msg.args().map(itm => itm.jsonValue()));
  var s = arguments[0];
  var split_str = s.split("%");
  var result = split_str[0];

  for (i=1; i<arguments.length; i++) {
    if (split_str[i].startsWith('s')) {
      // format is %s; arguments[i] is a string
      result += arguments[i] + split_str[i].substr(1);
    } else if (split_str[i].startsWith('c')) {
      // format is %c; arguments[i] is css style
      var styles = arguments[i].split(';');
      for (style of styles) {
	style = style.trim();
	if (style.startsWith('color:')) {
	  var color = style.substr(6).trim();
	  switch(color) {
	  case 'DarkTurquoise':
	    result += "\033[38;5;44m";
	    break;
	  case 'GoldenRod':
	    result += "\033[38;5;136m";
	    break;
	  case 'SteelBlue':
	    result += "\033[38;5;67m";
	    break;
	  case 'DimGray':
	    result += "\033[38;5;0m";
	    break;
	  default:
	  }
	} else if (style.startsWith('font-size:')) {
	  return result;
	}
      }
      result += split_str[i].substr(1);
    } else {
      // format is %% or unrecognized; just drop first %
      result += split_str[i];
    }
  }

  return result;
}

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
    const { fullName, meetingId, customParameter } = initOptions || {};

    if (!isModerator) this.initParameters.moderatorPW = '';
    if (fullName) this.initParameters.fullName = fullName;
    this.username = this.initParameters.fullName;

    if (env?.CONSOLE == 'log') {
      this.page.on('console', async (msg) => console.log(this.username, await strformat(msg)));
    }

    this.meetingId = (meetingId) ? meetingId : await helpers.createMeeting(parameters, customParameter);
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

  async joinMicrophone() {
    await this.waitForSelector(e.audioModal);
    await this.waitAndClick(e.microphoneButton);
    await this.waitForSelector(e.connectingToEchoTest);
    const { listenOnlyCallTimeout } = getSettings();
    await this.waitAndClick(e.echoYesButton, listenOnlyCallTimeout);
    await this.waitForSelector(e.isTalking);
  }

  async leaveAudio() {
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
    const locator = this.getLocator(selector);
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
}

module.exports = exports = Page;
