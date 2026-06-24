import { connectMicrophone } from '../audio/util';
import { ELEMENT_WAIT_EXTRA_LONG_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import * as util from './util';

export class RecordingNotifications extends Page {
  async notificationNoAudio() {
    // when you don't join audio at all, there's notification about no active mic
    await this.closeAllToastNotifications();
    await this.waitAndClick(e.recordingIndicator, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.hasElement(e.smallToastMsg, 'should appear a toast small message with the new message sent on the chat');
    await util.checkNotificationText(this, e.noActiveMicrophoneToast);
  }

  async notificationListenOnly() {
    // when you join listen only, there's notification about no active mic
    await this.closeAllToastNotifications();
    await this.waitAndClick(e.joinAudio, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.waitAndClick(e.listenOnlyButton, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await util.checkNotificationText(this, e.joinAudioToast);
  }

  async noNotificationInAudio() {
    // when you join audio with mic, there's no notification about no active mic
    await this.closeAllToastNotifications();
    await this.waitAndClick(e.joinAudio, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.hasElement(e.audioModal, 'should the audio modal be displayed', ELEMENT_WAIT_EXTRA_LONG_TIME);
    await connectMicrophone(this);
    await this.closeAllToastNotifications();
    await this.waitAndClick(e.recordingIndicator);
    await this.wasRemoved(e.smallToastMsg, 'should the small toast message disappear', ELEMENT_WAIT_EXTRA_LONG_TIME);
  }

  async modalStartRecording() {
    await this.waitAndClick(e.recordingIndicator, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.hasElement(e.noButton, 'should the button No appear');
    await this.hasElement(e.yesButton, 'should the button Yes appear');
  }
}
