import { expect } from '@playwright/test';

import { ELEMENT_WAIT_TIME, VIDEO_LOADING_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { checkDefaultLocationReset, checkScreenshots } from '../layouts/util';
import { MultiUsers } from '../user/multiusers';
import { constants } from './constants';

const { messageModerator } = constants;

export class CreateParameters extends MultiUsers {
  async recordMeeting() {
    await this.modPage.hasElement(e.recordingIndicator, 'should the recording indicator to be displayed');
  }

  async bannerText() {
    await this.modPage.hasElement(e.actions, 'should the actions button be displayed');
    await this.modPage.hasElement(e.notificationBannerBar, 'should display the banner text on the top of the meeting');
  }

  async bannerColor(colorToRGB: string) {
    await this.modPage.hasElement(e.notificationBannerBar, 'should display the banner bar');
    const notificationLocator = this.modPage.page.locator(e.notificationBannerBar);
    const notificationBarColor = await notificationLocator.evaluate(
      (elem) => getComputedStyle(elem).backgroundColor,
      e.notificationBannerBar,
    );
    await expect(notificationBarColor, 'should display the banner bar with the color changed').toBe(colorToRGB);
  }

  async maxParticipants() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the first moderator');
    await this.modPage2.hasElement(e.whiteboard, 'should display the whiteboard for the second moderator');

    await this.initUserPage(this.modPage.context, { shouldCloseAudioModal: false, shouldAvoidLayoutCheck: true });
    await this.userPage.hasElement(
      'p[class="error-message"]',
      'should display the error message for the attendee, the number of max participants should not be passed',
    );
  }

  async duration() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator');
    await this.modPage.hasText(
      e.timeRemaining,
      /[1-2]:[0-5][0-9]/,
      'should display the time remaining of the meeting decreasing',
    );
  }

  async moderatorOnlyMessage() {
    await this.modPage.waitForSelector(e.whiteboard);
    // check for the mod only message on the mod page
    await this.modPage.waitAndClick(e.presentationTitle);
    await this.modPage.hasElement(e.simpleModal, 'should display meeting details modal');
    await this.modPage.hasText(
      e.simpleModal,
      messageModerator,
      'should display the moderator only message on meeting detail modal',
    );
    // join a user and check if the message is not displayed
    await this.initUserPage();
    await this.userPage.waitForSelector(e.whiteboard);
    await this.userPage.waitAndClick(e.presentationTitle);
    await this.userPage.hasElement(e.simpleModal, 'should display meeting details modal');
    const modalLocator = this.userPage.page.locator(e.simpleModal);
    await expect(
      modalLocator,
      'should not display the moderator only message on meeting detail modal',
    ).not.toContainText(messageModerator);
  }

  async webcamsOnlyForModerator() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator');

    await this.userPage2.waitAndClick(e.joinVideo);
    await this.userPage2.waitAndClick(e.startSharingWebcam);
    await this.userPage2.hasElement(e.webcamMirroredVideoContainer, 'should display the attendee 2 camera');

    await this.modPage.hasElementCount(
      e.webcamContainer,
      1,
      'should display one camera from the attendee 2 for the moderator',
    );
    await this.userPage2.hasElementCount(
      e.webcamMirroredVideoContainer,
      1,
      'should display one camera from the attendee 2 ',
    );
    await this.initUserPage();
    await this.userPage.hasElementCount(
      e.webcamMirroredVideoContainer,
      0,
      'should not display any camera for the attendee 1',
    );
  }

  async muteOnStart() {
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.waitAndClick(e.microphoneButton);
    await this.modPage.waitAndClick(e.joinEchoTestButton);
    await this.modPage.hasElement(e.unmuteMicButton, 'should display the unmute microphone button for the moderator');
  }

  async allowModsToUnmuteUsers() {
    await this.initUserPage(this.modPage.context, { shouldCloseAudioModal: false });
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
    const unmuteMicButton = this.userPage.page.locator(e.unmuteMicButton);
    await expect(unmuteMicButton, 'should the unmute button be disabled when microphone is locked').toBeDisabled();
  }

  async lockSettingsDisablePublicChat() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator');
    await this.userPage.hasText(
      e.errorTypingIndicator,
      /locked/,
      'should display the error message when typing on chat',
    );
  }

  async lockSettingsHideUserList() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator');
    await this.modPage.hasElementCount(e.userListItem, 2, 'should display the two attendees for the moderator');
    await this.userPage.hasElementCount(
      e.userListItem,
      1,
      'should display one user(the moderator) for the first attendee',
    );
    await this.userPage2.hasElementCount(
      e.userListItem,
      1,
      'should display one user(the moderator) for the second attendee',
    );
  }

  async allowModsToEjectCameras() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator');
    await this.userPage.waitAndClick(e.joinVideo);
    await this.userPage.waitAndClick(e.startSharingWebcam);
    await this.userPage.hasElement(
      e.webcamMirroredVideoContainer,
      'should display the webcam container for the attendee',
    );
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.ejectCamera);
  }

  async overrideDefaultPresentation() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);
    await this.userPage.page.waitForTimeout(1500); // wait for the whiteboard zoom to stabilize
    await expect(this.modPage.page, 'should display the overridden presentation for the mod').toHaveScreenshot(
      'mod-page-overridden-default-presentation.png',
    );
    await expect(this.userPage.page, 'should display the overridden presentation for the viewer').toHaveScreenshot(
      'viewer-page-overridden-default-presentation.png',
    );
  }

  async customLayout() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);

    await this.modPage.shareWebcam();
    await this.userPage.shareWebcam();

    await checkScreenshots(this, 'should be on custom layout', 'video', 'custom-layout', 1);

    // checking the default location being reset when dropping into a non-available location
    await checkDefaultLocationReset(this.modPage);

    await this.modPage.dragAndDropWebcams(e.dropAreaSidebarBottom);
    await checkScreenshots(this, 'should be on custom layout', 'video', 'custom-layout', 2);

    await this.modPage.dragAndDropWebcams(e.dropAreaSidebarBottom);
    await checkScreenshots(this, 'should be on custom layout', 'video', 'custom-layout', 3);

    await this.modPage.waitAndClick(e.userListToggleBtn);
    await this.modPage.wasRemoved(e.chatButton, 'should not be displayed the chat button');
    await this.modPage.wasRemoved(e.sendButton, 'should not be displayed the send button');
    await this.modPage.page.waitForTimeout(1000);

    await checkScreenshots(this, 'should be on custom layout', 'video', 'custom-layout', 4);
  }

  async smartLayout() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);
    await checkScreenshots(
      this,
      'should the cameras be above the presentation',
      [e.webcamContainer, e.webcamMirroredVideoContainer],
      'smart-layout',
      1,
    );

    await this.modPage.waitAndClick(e.userListToggleBtn);
    await this.modPage.wasRemoved(e.chatButton, 'should not be displayed the chat button after opening the user list');
    await this.modPage.page.waitForTimeout(1000); // wait for the whiteboard zoom to stabilize

    await checkScreenshots(
      this,
      'should the cameras be on the side of presentation',
      [e.webcamContainer, e.webcamMirroredVideoContainer],
      'smart-layout',
      2,
    );
  }

  async presentationFocus() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);

    await this.modPage.shareWebcam();
    await this.userPage.shareWebcam();

    await checkScreenshots(
      this,
      'should be the layout focus on presentation',
      [e.webcamContainer, e.webcamMirroredVideoContainer],
      'focus-on-presentation',
    );
  }

  async videoFocus() {
    await this.modPage.waitForSelector(e.whiteboard);

    await this.modPage.waitAndClick(e.joinVideo);
    await this.modPage.page.bringToFront();
    await this.modPage.hasElement(
      e.webcamMirroredVideoPreview,
      'should display the video preview when sharing webcam ',
      ELEMENT_WAIT_TIME,
    );
    await this.modPage.waitAndClick(e.startSharingWebcam);

    await this.modPage.waitForSelector(e.webcamMirroredVideoContainer, VIDEO_LOADING_WAIT_TIME);
    await this.modPage.waitForSelector(e.leaveVideo, VIDEO_LOADING_WAIT_TIME);

    await checkScreenshots(
      this,
      'should be the video focus layout',
      [e.webcamContainer, e.webcamMirroredVideoContainer],
      'video-focus',
    );
  }

  async camerasOnly() {
    await this.modPage.wasRemoved(e.whiteboard, 'should not display the whiteboard for the moderator');
    await this.userPage.wasRemoved(e.whiteboard, 'should not display the whiteboard for the attendee');

    await this.modPage.shareWebcam();
    await this.userPage.shareWebcam();

    await checkScreenshots(
      this,
      'should be the cameras only layout',
      [e.webcamContainer, e.webcamMirroredVideoContainer],
      'cameras-only',
    );
  }

  async presentationOnly() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);

    await this.modPage.wasRemoved(e.joinVideo, 'should not display the join video button for the moderator');
    await this.userPage.wasRemoved(e.joinVideo, 'should not display the join video button for the attendee');
    await this.userPage.page.waitForTimeout(1000);

    await checkScreenshots(
      this,
      'should be the presentation only layout',
      [e.webcamContainer, e.webcamMirroredVideoContainer],
      'presentation-only',
    );
  }

  async participantsAndChatOnly() {
    await this.modPage.wasRemoved(e.whiteboard, 'should not display the whiteboard for the moderator');
    await this.userPage.wasRemoved(e.whiteboard, 'should not display the whiteboard for the attendee');
    await this.modPage.wasRemoved(e.joinVideo, 'should not display the join video button for the moderator');
    await this.userPage.wasRemoved(e.joinVideo, 'should not display the join video button for the attendee');

    await this.modPage.hasElement(e.chatMessages, 'should display the chat messages for the moderator');
    await this.modPage.hasElement(e.userListContent, 'should display the user list for the moderator');
    await this.userPage.hasElement(e.chatMessages, 'should display the chat messages for the attendee');
    await this.userPage.hasElement(e.userListContent, 'should display the user list for the attendee');

    await checkScreenshots(
      this,
      'should be the participants and chat only layout',
      [e.webcamContainer, e.webcamMirroredVideoContainer],
      'participants-and-chat-only',
    );
  }

  async mediaOnly() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator');
    await this.userPage.hasElement(e.whiteboard, 'should display the whiteboard for the attendee');
    await this.modPage.hasElement(e.joinVideo, 'should display the join video button for the moderator');
    await this.userPage.hasElement(e.joinVideo, 'should display the join video button for the attendee');
    await this.modPage.hasElement(
      e.startScreenSharing,
      'should display the start screen sharing button for the moderator',
    );

    await this.modPage.wasRemoved(e.chatMessages, 'should not display the chat messages for the moderator');
    await this.modPage.wasRemoved(e.userListContent, 'should not display the user list for the moderator');
    await this.userPage.wasRemoved(e.chatMessages, 'should not display the chat messages for the attendee');
    await this.userPage.wasRemoved(e.userListContent, 'should not display the user list for the attendee');

    await this.userPage.page.waitForTimeout(1000);

    await checkScreenshots(
      this,
      'should be the media only layout',
      [e.webcamContainer, e.webcamMirroredVideoContainer],
      'media-only',
    );
  }
}
