const Page = require('../core/page');
const e = require('../core/elements');
const util = require('./util');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { checkElement, checkElementText } = require('../core/util');

class Presentation {
  constructor() {
    this.modPage = new Page();
    this.userPage = new Page();
  }

  async initPages(testName, extraFlags) {
    await this.initModPage(testName, extraFlags);
    await this.initUserPage(testName, extraFlags);
  }

  async initModPage(testName, extraFlags) {
    await this.modPage.init(true, true, testName, 'Mod', undefined, undefined, undefined, undefined, extraFlags);
  }

  async initUserPage(testName, extraFlags) {
    await this.userPage.init(false, true, testName, 'Attendee', this.modPage.meetingId, undefined, undefined, undefined, extraFlags);
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

      await util.uploadPresentation(this.modPage, e.uploadPresentationFileName);
      await this.modPage.screenshot(testName, 'after-presentation-upload');

      const slides1 = await this.modPage.page.evaluate(async () => await document.querySelector('svg g g g').outerHTML);

      await this.modPage.logger('Slides before presentation upload');
      await this.modPage.logger(slides0);
      await this.modPage.logger('Slides after presentation upload');
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
      const hasPresentationDownloadBtnAfterAllow = await this.userPage.hasElement(e.presentationDownloadBtn);

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

  async hideAndRestorePresentation(testName) {
    try {
      await this.modPage.waitForSelector(e.whiteboard);
      await this.modPage.screenshot(testName, '01-after-close-audio-modal');
      await this.modPage.waitAndClick(e.minimizePresentation);
      const presentationWasRemoved = await this.modPage.wasRemoved(e.presentationContainer);
      await this.modPage.screenshot(testName, '02-minimize-presentation');

      await this.modPage.waitAndClick(e.restorePresentation);
      const presentationWasRestored = await this.modPage.hasElement(e.presentationContainer);
      await this.modPage.screenshot(testName, '03-restore-presentation');

      return presentationWasRemoved && presentationWasRestored;
    } catch (err) {
      await this.modPage.logger(err);
      return false;
    }
  }

  async startExternalVideo(testName) {
    try {
      await this.modPage.waitForSelector(e.whiteboard);
      await this.modPage.screenshot(testName, '01-after-close-audio-modal');
      await this.modPage.waitAndClick(e.actions);
      await this.modPage.waitAndClick(e.externalVideoBtn);
      await this.modPage.waitForSelector(e.externalVideoModalHeader);
      await this.modPage.type(e.videoModalInput, e.youtubeLink);
      await this.modPage.screenshot(testName, '02-before-start-sharing-video');
      await this.modPage.waitAndClick(e.startShareVideoBtn);

      const modFrame = await this.getFrame(this.modPage, e.youtubeFrame);
      await this.modPage.screenshot(testName, '03-modPage-after-rendering-frame');
      const userFrame = await this.getFrame(this.userPage, e.youtubeFrame);
      await this.userPage.screenshot(testName, '03-userPage-after-rendering-frame');

      const resp = (await modFrame.hasElement('video')) && (await userFrame.hasElement('video'));

      return resp === true;
    } catch (err) {
      await this.modPage.logger(err);
      return false;
    }
  }

  async getFrame(page, frameSelector) {
    await page.waitForSelector(frameSelector);
    const handleFrame = await page.page.$(frameSelector);
    const contentFrame = await handleFrame.contentFrame();
    const frame = new Page(contentFrame);
    await frame.waitForSelector(e.ytFrameTitle);
    return frame;
  }
}

module.exports = exports = Presentation;