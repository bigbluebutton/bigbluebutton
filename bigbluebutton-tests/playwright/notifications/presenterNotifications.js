const { MultiUsers } = require("../user/multiusers");
const util = require('./util');
const e = require('../core/elements');
const utilPolling = require('../polling/util');
const utilScreenShare = require('../screenshare/util');
const utilPresentation = require('../presentation/util');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

class PresenterNotifications extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async publishPollResults() {
    await utilPolling.startPoll(this.modPage);
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.modPage.hasElementEnabled(e.publishPollingLabel);
    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.waitForSelector(e.smallToastMsg);
    await util.checkNotificationText(this.modPage, e.pollPublishedToast);
  }

  async fileUploaderNotification() {
    await utilPresentation.uploadSinglePresentation(this.modPage, e.uploadPresentationFileName, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElement(e.currentPresentationToast, 'should display the current presentation toast when the upload finishes');
    await this.modPage.hasText(e.currentPresentationToast, e.uploadPresentationFileName, 'should display the uploaded presentation name in the toast');
  }

  async screenshareToast() {
    await util.waitAndClearDefaultPresentationNotification(this.modPage);
    await utilScreenShare.startScreenshare(this.modPage);
    await util.checkNotificationText(this.modPage, e.startScreenshareToast);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.waitAndClick(e.stopScreenSharing);
    await util.checkNotificationText(this.modPage, e.endScreenshareToast);
  }
}

exports.PresenterNotifications = PresenterNotifications;
