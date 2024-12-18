const { expect } = require('@playwright/test');
const Page = require('../core/page');
const util = require('./util');
const { waitAndClearNotification, waitAndClearDefaultPresentationNotification } = require('../notifications/util');
const e = require('../core/elements');
const { connectMicrophone } = require('../audio/util');
const { sleep } = require('../core/helpers');
const { ELEMENT_WAIT_EXTRA_LONG_TIME } = require('../core/constants');

class RecordingNotifications extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async notificationNoAudio() {
    // when you don't join audio at all, there's notification about no active mic
    await waitAndClearDefaultPresentationNotification(this);
    await this.waitAndClick(e.recordingIndicator, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.hasElement(e.smallToastMsg, 'should appear a toast small message with the new message sent on the chat');
    await util.checkNotificationText(this, e.noActiveMicrophoneToast);
  }

  async notificationListenOnly() {
    // when you join listen only, there's notification about no active mic
    await waitAndClearDefaultPresentationNotification(this);
    await this.waitAndClick(e.joinAudio, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.waitAndClick(e.listenOnlyButton, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await waitAndClearNotification(this);
    await this.waitAndClick(e.recordingIndicator);
    await this.hasElement(e.smallToastMsg, 'should the small toast message be show');
    await util.checkNotificationText(this, e.noActiveMicrophoneToast);
  }

  async noNotificationInAudio() {
    // when you join audio with mic, there's no notification about no active mic
    await waitAndClearDefaultPresentationNotification(this);
    await this.waitAndClick(e.joinAudio, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.hasElement(e.audioModal, 'should the audio modal be displayed', ELEMENT_WAIT_EXTRA_LONG_TIME);
    await connectMicrophone(this);
    await waitAndClearNotification(this);
    await this.waitAndClick(e.recordingIndicator);
    await this.wasRemoved(e.smallToastMsg, 'should the small toast message disappear', ELEMENT_WAIT_EXTRA_LONG_TIME);
  }

  async modalStartRecording() {
    await this.waitAndClick(e.recordingIndicator, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.hasElement(e.noButton, 'should the button No appear');
    await this.hasElement(e.yesButton, 'should the button Yes appear');
  }
}

exports.RecordingNotifications = RecordingNotifications;
