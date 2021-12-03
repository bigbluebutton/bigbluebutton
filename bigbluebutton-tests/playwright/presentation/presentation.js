const { expect } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const Page = require('../core/page');
const e = require('../core/elements');
const { checkSvgIndex, getSvgOuterHtml, uploadPresentation } = require('./util.js');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { sleep } = require('../core/helpers');

class Presentation extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async skipSlide() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitForSelector(e.presentationToolbarWrapper);

    await checkSvgIndex(this.modPage, '/svg/1');

    await this.modPage.waitAndClick(e.nextSlide);
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.page.waitForTimeout(1000);

    await checkSvgIndex(this.modPage, '/svg/2');

    await this.modPage.waitAndClick(e.prevSlide);
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.page.waitForTimeout(1000);

    await checkSvgIndex(this.modPage, '/svg/1');
  }

  async uploadPresentationTest() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitForSelector(e.skipSlide);

    const modSlides0 = await this.modPage.page.evaluate(getSvgOuterHtml);
    const userSlides0 = await this.userPage.page.evaluate(getSvgOuterHtml);
    await expect(modSlides0).toEqual(userSlides0);

    await uploadPresentation(this.modPage, e.uploadPresentationFileName);

    const modSlides1 = await this.userPage.page.evaluate(async () => document.querySelector('svg g g g').outerHTML);
    const userSlides1 = await this.modPage.page.evaluate(async () => document.querySelector('svg g g g').outerHTML);
    await expect(modSlides1).toEqual(userSlides1);

    await expect(modSlides0).not.toEqual(modSlides1);
    await expect(userSlides0).not.toEqual(userSlides1);
  }

  async allowAndDisallowDownload() {
    // allow the presentation download
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.uploadPresentation);
    await this.modPage.waitAndClick(e.allowPresentationDownload);
    await this.userPage.wasRemoved(e.smallToastMsg);
    await this.modPage.waitAndClick(e.confirmManagePresentation);
    await this.userPage.waitForSelector(e.toastDownload);
    // check download button in presentation after ALLOW it - should be true
    await this.userPage.hasElement(e.presentationDownloadBtn);

    // disallow the presentation download
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.uploadPresentation);
    await this.modPage.waitAndClick(e.disallowPresentationDownload);
    await this.modPage.waitAndClick(e.confirmManagePresentation);
    await this.userPage.wasRemoved(e.toastDownload);
    // check download button in presentation after DISALLOW it - should be false
    await this.userPage.wasRemoved(e.presentationDownloadBtn);
  }

  async removeAllPresentation() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.uploadPresentation);
    await this.modPage.waitAndClick(e.removePresentation);
    await this.modPage.waitAndClick(e.confirmManagePresentation);

    await this.modPage.waitForSelector(e.presentationPlaceholder);
    await this.modPage.hasText(e.presentationPlaceholder, e.presentationPlaceholderLabel);
    await this.userPage.waitForSelector(e.presentationPlaceholder);
    await this.userPage.hasText(e.presentationPlaceholder, e.presentationPlaceholderLabel);
  }

  async hideAndRestorePresentation() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.minimizePresentation);
    await this.modPage.wasRemoved(e.presentationContainer);

    await this.modPage.waitAndClick(e.restorePresentation);
    await this.modPage.hasElement(e.presentationContainer);
  }

  async startExternalVideo() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.externalVideoBtn);
    await this.modPage.waitForSelector(e.externalVideoModalHeader);
    await this.modPage.type(e.videoModalInput, e.youtubeLink);
    await this.modPage.waitAndClick(e.startShareVideoBtn);

    const modFrame = await this.getFrame(this.modPage, e.youtubeFrame);
    const userFrame = await this.getFrame(this.userPage, e.youtubeFrame);

    await modFrame.hasElement('video');
    await userFrame.hasElement('video');
  }

  async getFrame(page, frameSelector) {
    await page.waitForSelector(frameSelector);
    await sleep(1000);
    const handleFrame = await page.page.frame({ url: /youtube/ });
    const frame = new Page(page.browser, handleFrame);
    await frame.waitForSelector(e.ytFrameTitle);
    return frame;
  }
}

exports.Presentation = Presentation;
