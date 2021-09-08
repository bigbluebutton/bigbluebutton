const Page = require('../core/page');
const e = require('./elements');
const ne = require('../notifications/elements');
const ce = require('../core/elements');
const we = require('../whiteboard/elements');
const params = require('../params');
const util = require('./util');
const { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } = require('../core/constants');
const { checkElement, checkElementTextIncludes } = require('../core/util');

class Presentation {
  constructor() {
    this.modPage = new Page();
    this.userPage = new Page();
  }

  async initPages(testName) {
    await this.initModPage(testName);
    await this.initUserPage(testName);
  }

  async initModPage(testName) {
    await this.modPage.init(Page.getArgs(), undefined, { ...params, fullName: 'Mod' }, undefined, testName);
    await this.modPage.closeAudioModal();
  }

  async initUserPage(testName) {
    await this.userPage.init(Page.getArgs(), this.modPage.meetingId, { ...params, fullName: 'Attendee', moderatorPW: '' }, undefined, testName);
    await this.userPage.closeAudioModal();
  }

  async closePages() {
    if (this.modPage.page) await this.modPage.close();
    if (this.userPage.page) await this.userPage.close();
  }

  async skipSlide() {
    try {
      await this.modPage.waitForSelector(we.whiteboard, ELEMENT_WAIT_LONGER_TIME);
      await this.modPage.waitForSelector(e.presentationToolbarWrapper, ELEMENT_WAIT_TIME);

      const svg0 = await this.modPage.page.evaluate(util.checkSvgIndex, '/svg/1');

      await this.modPage.waitForSelector(e.nextSlide, ELEMENT_WAIT_TIME);
      await this.modPage.click(e.nextSlide, true);
      await this.modPage.waitForSelector(we.whiteboard, ELEMENT_WAIT_TIME);
      await this.modPage.page.waitForTimeout(1000);

      const svg1 = await this.modPage.page.evaluate(util.checkSvgIndex, '/svg/2');

      await this.modPage.waitForSelector(e.prevSlide, ELEMENT_WAIT_TIME);
      await this.modPage.click(e.prevSlide, true);
      await this.modPage.waitForSelector(we.whiteboard, ELEMENT_WAIT_TIME);
      await this.modPage.page.waitForTimeout(1000);

      const svg2 = await this.modPage.page.evaluate(util.checkSvgIndex, '/svg/1');

      return svg0 === true && svg1 === true && svg2 === true;
    } catch (err) {
      await this.modPage.logger(err);
      return false;
    }
  }

  async uploadPresentation(testName) {
    try {
      await this.modPage.waitForSelector(we.whiteboard, ELEMENT_WAIT_LONGER_TIME);
      await this.modPage.waitForSelector(e.skipSlide, ELEMENT_WAIT_TIME);

      const slides0 = await this.modPage.page.evaluate(util.getSvgOuterHtml);

      await this.modPage.click(ce.actions, true);
      await this.modPage.click(e.uploadPresentation, true);

      await this.modPage.screenshot(`${testName}`, `01-before-presentation-upload-[${testName}]`);

      await this.modPage.waitForSelector(e.fileUpload, ELEMENT_WAIT_TIME);
      const fileUpload = await this.modPage.page.$(e.fileUpload);
      await fileUpload.uploadFile(`${__dirname}/upload-test.png`);
      await this.modPage.page.waitForFunction(checkElementTextIncludes, {},
        'body', 'To be uploaded ...'
      );
      await this.modPage.page.waitForSelector(e.upload, ELEMENT_WAIT_TIME);

      await this.modPage.page.click(e.upload, true);
      await this.modPage.logger('\nWaiting for the new presentation to upload...');
      await this.modPage.page.waitForFunction(checkElementTextIncludes, {},
        'body', 'Converting file'
      );
      await this.modPage.logger('\nPresentation uploaded!');
      await this.modPage.page.waitForFunction(checkElementTextIncludes, {},
        'body', 'Current presentation'
      );
      await this.modPage.screenshot(`${testName}`, `02-after-presentation-upload-[${testName}]`);

      const slides1 = await this.modPage.page.evaluate(async () => await document.querySelector('svg g g g').outerHTML);

      await this.modPage.logger('\nSlides before presentation upload:');
      await this.modPage.logger(slides0);
      await this.modPage.logger('\nSlides after presentation upload:');
      await this.modPage.logger(slides1);

      return slides0 !== slides1;
    } catch (err) {
      await this.modPage.logger(err);
      return false;
    }
  }

  async allowAndDisallowDownload(testName) {
    try {
      // allow the presentation download
      await this.modPage.waitForSelector(we.whiteboard, ELEMENT_WAIT_LONGER_TIME);
      await this.modPage.click(ce.actions);
      await this.modPage.click(e.uploadPresentation);
      await this.modPage.screenshot(testName, `1-modPage-before-allow-download-[${this.modPage.meetingId}]`);
      await this.modPage.click(ce.allowPresentationDownload);
      await this.userPage.screenshot(testName, `2-userPage-after-allow-download-without-save-[${this.modPage.meetingId}]`);
      await this.userPage.waitForElementHandleToBeRemoved(ne.smallToastMsg);
      await this.modPage.click(ce.confirmManagePresentation);
      await this.userPage.screenshot(testName, `3-userPage-after-allow-download-and-save-[${this.modPage.meetingId}]`);
      await this.userPage.waitForSelector(ce.toastDownload);
      // check download button in presentation after ALLOW it - should be true
      const hasPresentationDownloadBtnAfterAllow = await this.userPage.page.evaluate(checkElement, ce.presentationDownloadBtn);

      // disallow the presentation download
      await this.modPage.click(ce.actions);
      await this.modPage.click(e.uploadPresentation);
      await this.modPage.screenshot(testName, `4-modPage-before-disallow-download-[${this.modPage.meetingId}]`);
      await this.modPage.click(ce.disallowPresentationDownload);
      await this.modPage.click(ce.confirmManagePresentation);
      await this.modPage.screenshot(testName, `5-userPage-after-disallow-download-[${this.modPage.meetingId}]`);
      await this.userPage.waitForElementHandleToBeRemoved(ce.toastDownload);
      // check download button in presentation after DISALLOW it - should be false
      const hasPresentationDownloadBtnAfterDisallow = await this.userPage.page.evaluate(checkElement, ce.presentationDownloadBtn);

      return hasPresentationDownloadBtnAfterAllow && !hasPresentationDownloadBtnAfterDisallow;
    } catch (err) {
      this.modPage.logger(err);
      return false;
    }
  }
}

module.exports = exports = Presentation;