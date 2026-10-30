import { connectMicrophone } from '../audio/util';
import { ELEMENT_WAIT_EXTRA_LONG_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import * as util from './util';

export class RecordingNotifications extends Page {
  async notificationNoAudio() {
    // when you don't join audio at all, there's notification about no active mic
    await this.waitForSelector(e.whiteboard, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.closeAllToastNotifications();
    await this.waitAndClick(e.recordingIndicator);
    await this.waitAndClick(e.cancelRecordingButton);
    await this.hasNElements(
      e.smallToastMsg,
      1,
      'should display only the warning toast after canceling / closing recording notification',
    );
    await util.checkNotificationText(this, e.noActiveMicrophoneToast);
  }

  async notificationListenOnly() {
    // when you join listen only, there's notification about no active mic
    await this.waitForSelector(e.whiteboard);
    await this.closeAllToastNotifications();
    await this.waitAndClick(e.joinAudio, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.waitAndClick(e.listenOnlyButton, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await util.checkNotificationText(this, e.joinAudioToast);
  }

  async noNotificationInAudio() {
    // when you join audio with mic, there's no notification about no active mic
    await this.waitForSelector(e.whiteboard);
    await this.waitAndClick(e.joinAudio);
    await this.hasElement(e.audioModal, 'should the audio modal be displayed');
    await connectMicrophone(this);
    await this.closeAllToastNotifications();
    await this.waitAndClick(e.recordingIndicator);
    await this.hasElement(e.confirmRecordingButton, 'should display the button to start recording');
    await this.hasNElements(e.smallToastMsg, 1, 'should display only the recording notification - no warning toast');
  }

  async modalStartRecording() {
    await this.waitAndClick(e.recordingIndicator, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.hasElement(e.confirmRecordingButton, 'should display the button to start recording');
  }
}
