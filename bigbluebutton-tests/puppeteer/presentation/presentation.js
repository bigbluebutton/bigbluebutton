const Page = require('../core/page');
const e = require('../core/elements');
const util = require('./util');
const { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } = require('../core/constants');
const { checkElement, checkElementTextIncludes, checkElementText } = require('../core/util');

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
    await this.modPage.init(true, true, testName, 'Mod');
  }

  async initUserPage(testName) {
    await this.userPage.init(false, true, testName, 'Attendee', this.modPage.meetingId);
  }

  async closePages() {
    if (this.modPage.page) await this.modPage.close();
    if (this.userPage.page) await this.userPage.close();
  }

  async skipSlide() {
    try {
      await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
      await this.modPage.waitForSelector(e.presentationToolbarWrapper);

      const svg0 = await this.modPage.page.evaluate(util.checkSvgIndex, '/svg/1');

      await this.modPage.waitAndClick(e.nextSlide);
      await this.modPage.waitForSelector(e.whiteboard);
      await this.modPage.page.waitForTimeout(1000);

      const svg1 = await this.modPage.page.evaluate(util.checkSvgIndex, '/svg/2');

      await this.modPage.waitAndClick(e.prevSlide);
      await this.modPage.waitForSelector(e.whiteboard);
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
      await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
      await this.modPage.waitForSelector(e.skipSlide);

      const slides0 = await this.modPage.page.evaluate(util.getSvgOuterHtml);

      await this.modPage.waitAndClick(e.actions);
      await this.modPage.waitAndClick(e.uploadPresentation);

      await this.modPage.screenshot(`${testName}`, `01-before-presentation-upload-[${testName}]`);

      await this.modPage.waitForSelector(e.fileUpload);
      const fileUpload = await this.modPage.page.$(e.fileUpload);
      await fileUpload.uploadFile(`${__dirname}/upload-test.png`);
      await this.modPage.page.waitForFunction(checkElementTextIncludes,
        { timeout: ELEMENT_WAIT_TIME },
        'body', 'To be uploaded ...'
      );
      await this.modPage.page.waitForSelector(e.upload);

      await this.modPage.waitAndClick(e.upload);
      await this.modPage.logger('\nWaiting for the new presentation to upload...');
      await this.modPage.page.waitForFunction(checkElementTextIncludes,
        { timeout: ELEMENT_WAIT_TIME },
        'body', 'Converting file'
      );
      await this.modPage.logger('\nPresentation uploaded!');
      await this.modPage.page.waitForFunction(checkElementTextIncludes,
        { timeout: ELEMENT_WAIT_LONGER_TIME },
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
      await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
      await this.modPage.waitAndClick(e.actions);
      await this.modPage.waitAndClick(e.uploadPresentation);
      await this.modPage.screenshot(testName, `1-modPage-before-allow-download-[${this.modPage.meetingId}]`);
      await this.modPage.waitAndClick(e.allowPresentationDownload);
      await this.userPage.screenshot(testName, `2-userPage-after-allow-download-without-save-[${this.modPage.meetingId}]`);
      await this.userPage.waitForElementHandleToBeRemoved(e.smallToastMsg);
      await this.modPage.waitAndClick(e.confirmManagePresentation);
      await this.userPage.screenshot(testName, `3-userPage-after-allow-download-and-save-[${this.modPage.meetingId}]`);
      await this.userPage.waitForSelector(e.toastDownload);
      // check download button in presentation after ALLOW it - should be true
      const hasPresentationDownloadBtnAfterAllow = await this.userPage.page.evaluate(checkElement, e.presentationDownloadBtn);

      // disallow the presentation download
      await this.modPage.waitAndClick(e.actions);
      await this.modPage.waitAndClick(e.uploadPresentation);
      await this.modPage.screenshot(testName, `4-modPage-before-disallow-download-[${this.modPage.meetingId}]`);
      await this.modPage.waitAndClick(e.disallowPresentationDownload);
      await this.modPage.waitAndClick(e.confirmManagePresentation);
      await this.modPage.screenshot(testName, `5-userPage-after-disallow-download-[${this.modPage.meetingId}]`);
      await this.userPage.waitForElementHandleToBeRemoved(e.toastDownload);
      // check download button in presentation after DISALLOW it - should be false
      const hasPresentationDownloadBtnAfterDisallow = await this.userPage.page.evaluate(checkElement, e.presentationDownloadBtn);

      return hasPresentationDownloadBtnAfterAllow && !hasPresentationDownloadBtnAfterDisallow;
    } catch (err) {
      await this.modPage.logger(err);
      return false;
    }
  }

  async removeAllPresentation(testName) {
    try {
      await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
      await this.modPage.waitAndClick(e.actions);
      await this.modPage.waitAndClick(e.uploadPresentation);
      await this.modPage.screenshot(testName, '1-modPage-before-remove-presentation');
      await this.modPage.waitAndClick(e.removePresentation);
      await this.modPage.waitAndClick(e.confirmManagePresentation);

      await this.modPage.waitForSelector(e.presentationPlaceholder);
      await this.modPage.screenshot(testName, '2-modPage-after-remove-presentation');
      const modPagePlaceholder = await this.modPage.page.evaluate(checkElementText, e.presentationPlaceholder, e.presentationPlaceholderLabel);
      await this.userPage.waitForSelector(e.presentationPlaceholder);
      await this.userPage.screenshot(testName, '3-userPage-after-remove-presentation');
      const userPagePlaceholder = await this.userPage.page.evaluate(checkElementText, e.presentationPlaceholder, e.presentationPlaceholderLabel);

      return modPagePlaceholder && userPagePlaceholder;
    } catch (err) {
      await this.modPage.logger(err);
      return false;
    }
  }
}

module.exports = exports = Presentation;