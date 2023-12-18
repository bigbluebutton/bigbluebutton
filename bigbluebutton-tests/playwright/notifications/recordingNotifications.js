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
    await this.waitForSelector(e.smallToastMsg);
    await util.checkNotificationText(this, e.noActiveMicrophoneToast);
  }

  async notificationListenOnly() {
    // when you join listen only, there's notification about no active mic
    await waitAndClearDefaultPresentationNotification(this);
    await this.waitAndClick(e.joinAudio, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.waitAndClick(e.listenOnlyButton, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await waitAndClearNotification(this);
    await this.waitAndClick(e.recordingIndicator);
    await this.waitForSelector(e.smallToastMsg);
    await util.checkNotificationText(this, e.noActiveMicrophoneToast);
  }

  async noNotificationInAudio() {
    // when you join audio with mic, there's no notification about no active mic
    await waitAndClearDefaultPresentationNotification(this);
    await this.waitAndClick(e.joinAudio, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.waitForSelector(e.audioModal, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await connectMicrophone(this);
    await waitAndClearNotification(this);
    await this.waitAndClick(e.recordingIndicator);
    await this.wasRemoved(e.smallToastMsg, ELEMENT_WAIT_EXTRA_LONG_TIME);
  }

  async modalStartRecording() {
    await this.waitAndClick(e.recordingIndicator, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.waitForSelector(e.noButton);
    await this.waitForSelector(e.yesButton);
  }
}

exports.RecordingNotifications = RecordingNotifications;
