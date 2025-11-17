import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import * as utilPolling from '../polling/util';
import * as utilPresentation from '../presentation/util';
import * as utilScreenShare from '../screenshare/util';
import { MultiUsers } from '../user/multiusers';
import * as util from './util';

export class PresenterNotifications extends MultiUsers {
  async publishPollResults() {
    await utilPolling.startPoll(this.modPage);
    await this.userPage.waitAndClick(e.pollAnswerOptionBtn);
    await this.modPage.hasElementEnabled(e.publishPollingLabel, 'should enable the publish poll button');
    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.modPage.waitForSelector(e.smallToastMsg);
    await util.checkNotificationText(this.modPage, e.pollPublishedToast);
  }

  async fileUploaderNotification() {
    await utilPresentation.uploadSinglePresentation(
      this.modPage,
      e.uploadPresentationFileName,
      ELEMENT_WAIT_LONGER_TIME,
    );
    await utilPresentation.hasTextOnCurrentPresentationToast(
      this.modPage,
      e.uploadPresentationFileName,
      'should display the uploaded presentation name in the toast',
    );
  }

  async screenshareToast() {
    await utilScreenShare.startScreenshare(this.modPage);
    await util.checkNotificationText(this.modPage, e.startScreenshareToast);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.waitAndClick(e.stopScreenSharing);
    await util.checkNotificationText(this.modPage, e.endScreenshareToast);
  }
}
