const { expect, default: test } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const c = require('./constants');
const { VIDEO_LOADING_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_EXTRA_LONG_TIME } = require('../core/constants');
const util = require('./util');
const { getSettings } = require('../core/settings');
const { waitAndClearDefaultPresentationNotification } = require('../notifications/util');

class CreateParameters extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async recordMeeting() {
    await this.modPage.hasElement(e.recordingIndicator);
  }

  async bannerText() {
    await this.modPage.waitForSelector(e.actions);
    await this.modPage.hasElement(e.notificationBannerBar);
  }

  async bannerColor(colorToRGB) {
    await this.modPage.waitForSelector(e.notificationBannerBar);
    const notificationLocator = this.modPage.getLocator(e.notificationBannerBar);
    const notificationBarColor = await notificationLocator.evaluate((elem) => {
      return getComputedStyle(elem).backgroundColor;
    }, e.notificationBannerBar);
    await expect(notificationBarColor).toBe(colorToRGB);
  }

  async maxParticipants(context) {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage2.hasElement(e.whiteboard);

    await this.initUserPage(false, context);
    await this.userPage.hasElement('p[class="error-message"]')
  }

  async duration(context) {
    await this.modPage.hasElement(e.whiteboard);
    await this.modPage.hasText(e.timeRemaining, /[1-2]:[0-5][0-9]/);
  }

  async moderatorOnlyMessage(context) {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.checkElementCount(e.chatWelcomeMessageText, 2);
    await this.modPage.hasText(`${e.chatWelcomeMessageText}>>nth=1`, 'Test');

    await this.initUserPage(true, context);
    await this.userPage.checkElementCount(e.chatWelcomeMessageText, 1);
  }

  async webcamsOnlyForModerator(context) {
    await this.modPage.waitForSelector(e.whiteboard);

    await this.userPage2.waitAndClick(e.joinVideo);
    await this.userPage2.waitAndClick(e.startSharingWebcam);
    await this.userPage2.hasElement(e.webcamContainer);

    await this.modPage.checkElementCount(e.webcamContainer, 1);
    await this.userPage2.checkElementCount(e.webcamContainer, 1);
    await this.initUserPage(true, context);
    await this.userPage.checkElementCount(e.webcamContainer, 0);
  }

  async muteOnStart() {
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.waitAndClick(e.microphoneButton);
    await this.modPage.waitAndClick(e.joinEchoTestButton);
    await this.modPage.hasElement(e.unmuteMicButton);
  }

  async allowModsToUnmuteUsers(context) {
    await this.initUserPage(false, context);
    await this.userPage.waitAndClick(e.microphoneButton);
    await this.userPage.waitAndClick(e.joinEchoTestButton);
    await this.userPage.waitAndClick(e.muteMicButton);
    await this.userPage.hasElement(e.unmuteMicButton);

    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.unmuteUser);
    await this.userPage.hasElement(e.muteMicButton);
  }

  async lockSettingsDisableCam() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.hasElementDisabled(e.joinVideo);
  }

  async lockSettingsDisableMic() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.hasElement(e.leaveListenOnly, 10000);
  }

  async lockSettingsDisablePublicChat() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.hasText(e.typingIndicator, /locked/);
  }

  async lockSettingsHideUserList() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.checkElementCount(e.userListItem, 2);
    await this.userPage.checkElementCount(e.userListItem, 1);
    await this.userPage2.checkElementCount(e.userListItem, 1);
  }

  async allowModsToEjectCameras() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitAndClick(e.joinVideo);
    await this.userPage.waitAndClick(e.startSharingWebcam);
    await this.userPage.hasElement(e.webcamContainer);
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.ejectCamera);
  }
}

exports.CreateParameters = CreateParameters;
