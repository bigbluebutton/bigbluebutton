const Page = require('../core/page');
const e = require('./elements');
const ne = require('../notifications/elements');
const ce = require('../core/elements');
const params = require('../params');

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
    await this.modPage.close();
    await this.userPage.close();
  }

  async allowAndDisallowDownload(testName) {
    try {
      // allow the presentation download
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
      //!
      const hasPresentationDownloadBtnAfterAllow = await this.userPage.page.evaluate((presentationDownloadBtn) => {
        return document.querySelectorAll(presentationDownloadBtn)[0] !== undefined;
      }, ce.presentationDownloadBtn);

      // disallow the presentation download
      await this.modPage.click(ce.actions);
      await this.modPage.click(e.uploadPresentation);
      await this.modPage.screenshot(testName, `4-modPage-before-disallow-download-[${this.modPage.meetingId}]`);
      await this.modPage.click(ce.disallowPresentationDownload);
      await this.modPage.click(ce.confirmManagePresentation);
      await this.modPage.screenshot(testName, `5-userPage-after-disallow-download-[${this.modPage.meetingId}]`);
      await this.userPage.waitForElementHandleToBeRemoved(ce.toastDownload);
      // check download button in presentation after DISALLOW it - should be false
      //!
      const hasPresentationDownloadBtnAfterDisallow = await this.userPage.page.evaluate((presentationDownloadBtn) => {
        return document.querySelectorAll(presentationDownloadBtn)[0] !== undefined;
      }, ce.presentationDownloadBtn);

      return hasPresentationDownloadBtnAfterAllow && !hasPresentationDownloadBtnAfterDisallow;
    } catch (err) {
      this.modPage.logger(err);
      return false;
    }
  }
}

module.exports = exports = Presentation;