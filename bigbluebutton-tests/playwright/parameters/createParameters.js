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
    await this.modPage.hasElement(e.recordingIndicator, 'should the recording indicator to be displayed');
  }

  async bannerText() {
    await this.modPage.hasElement(e.actions, 'should the actions button be displayed');
    await this.modPage.hasElement(e.notificationBannerBar, 'should display the banner text on the top of the meeting');
  }

  async bannerColor(colorToRGB) {
    await this.modPage.hasElement(e.notificationBannerBar, 'should display the banner bar');
    const notificationLocator = this.modPage.getLocator(e.notificationBannerBar);
    const notificationBarColor = await notificationLocator.evaluate((elem) => {
      return getComputedStyle(elem).backgroundColor;
    }, e.notificationBannerBar);
    await expect(notificationBarColor, 'should display the banner bar with the color changed').toBe(colorToRGB);
  }

  async maxParticipants(context) {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the first moderator');
    await this.modPage2.hasElement(e.whiteboard, 'should display the whiteboard for the second moderator');

    await this.initUserPage(false, context);
    await this.userPage.hasElement('p[class="error-message"]', 'should display the error message for the attendee, the number of max participants should not be passed')
  }

  async duration(context) {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator');
    await this.modPage.hasText(e.timeRemaining, /[1-2]:[0-5][0-9]/, 'should display the time remaining of the meeting decreasing');
  }

  async moderatorOnlyMessage(context) {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator');
    await this.modPage.checkElementCount(e.chatWelcomeMessageText, 2, 'should display two welcome messages');
    await this.modPage.hasText(`${e.chatWelcomeMessageText}>>nth=1`, 'Test', 'should display the second welcome message with the word Test');

    await this.initUserPage(true, context);
    await this.userPage.checkElementCount(e.chatWelcomeMessageText, 1, 'should display one welcome message for the attendee');
  }

  async webcamsOnlyForModerator(context) {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator');

    await this.userPage2.waitAndClick(e.joinVideo);
    await this.userPage2.waitAndClick(e.startSharingWebcam);
    await this.userPage2.hasElement(e.webcamMirroredVideoContainer, 'should display the attende 2 camera');

    await this.modPage.checkElementCount(e.webcamContainer, 1, 'should display one camera from the attende 2 for the moderator');
    await this.userPage2.checkElementCount(e.webcamMirroredVideoContainer, 1, 'should display one camera from the attendee 2 ');
    await this.initUserPage(true, context);
    await this.userPage.checkElementCount(e.webcamMirroredVideoContainer, 0, 'should not display any camera for the attendee 1');
  }

  async muteOnStart() {
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.waitAndClick(e.microphoneButton);
    await this.modPage.waitAndClick(e.joinEchoTestButton);
    await this.modPage.hasElement(e.unmuteMicButton, 'should display the unmute microphone button for the moderator');
  }

  async allowModsToUnmuteUsers(context) {
    await this.initUserPage(false, context);
    await this.userPage.waitAndClick(e.microphoneButton);
    await this.userPage.waitAndClick(e.joinEchoTestButton);
    await this.userPage.waitAndClick(e.muteMicButton);
    await this.userPage.hasElement(e.unmuteMicButton, 'should display the unmute microphone button for the attendee');

    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.unmuteUser);
    await this.userPage.hasElement(e.muteMicButton, 'should display the mute microphone button for the attendee');
  }

  async lockSettingsDisableCam() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator');
    await this.userPage.hasElementDisabled(e.joinVideo, 'should display the join video button disabled');
  }

  async lockSettingsDisableMic() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator');
    await this.userPage.hasElement(e.leaveListenOnly, 'should display the leave listen only', ELEMENT_WAIT_LONGER_TIME);
  }

  async lockSettingsDisablePublicChat() {
    await this.modPage.hasElement(e.whiteboard);
    await this.userPage.hasText(e.errorTypingIndicator, /locked/);
  }

  async lockSettingsHideUserList() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator');
    await this.modPage.checkElementCount(e.userListItem, 2, 'should display the two attendess for the moderator');
    await this.userPage.checkElementCount(e.userListItem, 1, 'should display one user(the moderator) for the first attendee');
    await this.userPage2.checkElementCount(e.userListItem, 1, 'should display one user(the moderator) for the second attendee');
  }

  async allowModsToEjectCameras() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator');
    await this.userPage.waitAndClick(e.joinVideo);
    await this.userPage.waitAndClick(e.startSharingWebcam);
    await this.userPage.hasElement(e.webcamMirroredVideoContainer, 'should display the webcam container for the attendee');
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.ejectCamera);
  }
}

exports.CreateParameters = CreateParameters;
