const { MultiUsers } = require("../user/multiusers");
const util = require('./util');
const e = require('../core/elements');
const utilPolling = require('../polling/util');
const utilScreenShare = require('../screenshare/util');
const utilPresentation = require('../presentation/util');
const { UPLOAD_PDF_WAIT_TIME } = require('../core/constants');

class PresenterNotifications extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async publishPollResults() {
    await util.waitAndClearDefaultPresentationNotification(this.modPage);
    await utilPolling.startPoll(this.modPage, true);
    await this.modPage.waitForSelector(e.smallToastMsg);
    await util.checkNotificationText(this.modPage, e.pollPublishedToast);
  }

  async fileUploaderNotification() {
    await utilPresentation.uploadSinglePresentation(this.modPage, e.pdfFileName, UPLOAD_PDF_WAIT_TIME);
    await util.checkNotificationText(this.userPage, e.presentationUploadedToast);
  }

  async screenshareToast() {
    await util.waitAndClearDefaultPresentationNotification(this.modPage);
    await utilScreenShare.startScreenshare(this.modPage);
    await util.checkNotificationText(this.modPage, e.startScreenshareToast);
    await util.waitAndClearNotification(this.modPage);
    await this.modPage.waitAndClick(e.stopScreenSharing);
    await util.checkNotificationText(this.modPage, e.endScreenshareToast);
  }
}

exports.PresenterNotifications = PresenterNotifications;
