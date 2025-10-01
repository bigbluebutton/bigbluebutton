import util from './util';
import { elements as e } from '../core/elements.ts';
import utilPolling from '../polling/util';
import { MultiUsers } from '../user/multiusers';
import utilScreenShare from '../screenshare/util';
import utilPresentation from '../presentation/util';
import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants.ts';

export class PresenterNotifications extends MultiUsers {
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
    await utilPresentation.hasTextOnCurrentPresentationToast(this.modPage, e.uploadPresentationFileName, 'should display the uploaded presentation name in the toast');
  }

  async screenshareToast() {
    await utilScreenShare.startScreenshare(this.modPage);
    await util.checkNotificationText(this.modPage, e.startScreenshareToast);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.waitAndClick(e.stopScreenSharing);
    await util.checkNotificationText(this.modPage, e.endScreenshareToast);
  }
}
