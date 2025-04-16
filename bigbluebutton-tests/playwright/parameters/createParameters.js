const { expect } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const { messageModerator } = require('../parameters/constants');
const { sleep } = require('../core/helpers');

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

    await this.initUserPage(false, context, { shouldAvoidLayoutCheck: true });
    await this.userPage.hasElement('p[class="error-message"]', 'should display the error message for the attendee, the number of max participants should not be passed')
  }

  async duration() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator');
    await this.modPage.hasText(e.timeRemaining, /[1-2]:[0-5][0-9]/, 'should display the time remaining of the meeting decreasing');
  }

  async moderatorOnlyMessage() {
    await this.modPage.waitForSelector(e.whiteboard);
    // check for the mod only message on the mod page
    await this.modPage.waitAndClick(e.presentationTitle);
    await this.modPage.hasElement(e.simpleModal, 'should display meeting details modal');
    await this.modPage.hasText(e.simpleModal, messageModerator, 'should display the moderator only message on meeting detail modal');
    // join a user and check if the message is not displayed
    await this.initUserPage();
    await this.userPage.waitForSelector(e.whiteboard);
    await this.userPage.waitAndClick(e.presentationTitle);
    await this.userPage.hasElement(e.simpleModal, 'should display meeting details modal');
    const modalLocator = this.userPage.getLocator(e.simpleModal);
    await expect(modalLocator, 'should not display the moderator only message on meeting detail modal').not.toContainText(messageModerator);
  }

  async webcamsOnlyForModerator(context) {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator');

    await this.userPage2.waitAndClick(e.joinVideo);
    await this.userPage2.waitAndClick(e.startSharingWebcam);
    await this.userPage2.hasElement(e.webcamMirroredVideoContainer, 'should display the attendee 2 camera');

    await this.modPage.hasElementCount(e.webcamContainer, 1, 'should display one camera from the attendee 2 for the moderator');
    await this.userPage2.hasElementCount(e.webcamMirroredVideoContainer, 1, 'should display one camera from the attendee 2 ');
    await this.initUserPage(true, context);
    await this.userPage.hasElementCount(e.webcamMirroredVideoContainer, 0, 'should not display any camera for the attendee 1');
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
    const unmuteMicButton = this.userPage.getLocator(e.unmuteMicButton);
    await expect(unmuteMicButton, 'should the unmute button be disabled when microphone is locked').toBeDisabled();
  }

  async lockSettingsDisablePublicChat() {
    await this.modPage.hasElement(e.whiteboard);
    await this.userPage.hasText(e.errorTypingIndicator, /locked/);
  }

  async lockSettingsHideUserList() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator');
    await this.modPage.hasElementCount(e.userListItem, 2, 'should display the two attendees for the moderator');
    await this.userPage.hasElementCount(e.userListItem, 1, 'should display one user(the moderator) for the first attendee');
    await this.userPage2.hasElementCount(e.userListItem, 1, 'should display one user(the moderator) for the second attendee');
  }

  async allowModsToEjectCameras() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator');
    await this.userPage.waitAndClick(e.joinVideo);
    await this.userPage.waitAndClick(e.startSharingWebcam);
    await this.userPage.hasElement(e.webcamMirroredVideoContainer, 'should display the webcam container for the attendee');
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.ejectCamera);
  }

  async overrideDefaultPresentation() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);
    await sleep(1500);  // wait for the whiteboard zoom to stabilize
    await expect(
      this.modPage.page,
      'should display the overridden presentation for the mod',
    ).toHaveScreenshot('mod-page-overridden-default-presentation.png');
    await expect(
      this.userPage.page,
      'should display the overridden presentation for the viewer',
    ).toHaveScreenshot('viewer-page-overridden-default-presentation.png');
  }
}

exports.CreateParameters = CreateParameters;
