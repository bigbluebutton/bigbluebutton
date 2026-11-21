import { test } from '@playwright/test';

import { VIDEO_LOADING_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';
import { checkAvatarIcon } from '../user/util';

export const REQUEST_CAMERA_PARAMETER = 'allowModsToRequestCameraShare=true';

export class RequestCamera extends MultiUsers {
  // Both role changes force a graphql reconnection, which lost the mic prompt.
  async requestSurvivesPromotion() {
    await this.askAttendeeToShareCamera();
    await this.modPage.waitAndClick(e.otherUserMoreOptionsButton);
    await this.modPage.waitAndClick(e.promoteToModerator);
    await checkAvatarIcon(this.userPage);
    await this.userPage.hasElement(
      e.confirmShareCamera,
      'should keep the camera request prompt for the promoted attendee',
    );
    await this.acceptAndShare();
    await this.modPage.hasElement(
      e.webcamStreamItem,
      "should display the promoted attendee's camera for the moderator",
      VIDEO_LOADING_WAIT_TIME,
    );
  }

  async requestSurvivesPresenterChange() {
    await this.askAttendeeToShareCamera();
    await this.modPage.waitAndClick(e.otherUserMoreOptionsButton);
    await this.modPage.waitAndClick(e.makePresenter);
    await this.userPage.hasText(e.currentUser, 'Presenter', 'should make the attendee the presenter');
    await this.userPage.hasElement(e.confirmShareCamera, 'should keep the camera request prompt for the new presenter');
    await this.acceptAndShare();
    await this.modPage.hasElement(
      e.webcamStreamItem,
      "should display the new presenter's camera for the moderator",
      VIDEO_LOADING_WAIT_TIME,
    );
  }

  async attendeeAcceptsRequest() {
    await this.askAttendeeToShareCamera();
    await this.acceptAndShare();
    await this.modPage.hasElement(
      e.webcamStreamItem,
      "should display the attendee's camera for the moderator",
      VIDEO_LOADING_WAIT_TIME,
    );
    // The server drops a request the target cannot answer, and drops it silently.
    await this.modPage.waitAndClick(e.otherUserMoreOptionsButton);
    // Remove needs no create parameter, so it proves the menu opened and the
    // assertion below is not passing on a menu that never rendered.
    await this.modPage.hasElement(e.removeUser, "should open the attendee's options");
    await this.modPage.wasRemoved(
      e.requestUserCamera,
      'should stop offering the camera request while the attendee shares',
    );
  }

  async attendeeDeniesRequest() {
    await this.askAttendeeToShareCamera();
    await this.userPage.waitAndClick(e.denyShareCamera);
    await this.userPage.wasRemoved(e.denyShareCamera, 'should dismiss the camera request prompt for the attendee');
    await this.userPage.hasElement(e.joinVideo, 'should leave the attendee out of camera sharing');
    await this.userPage.wasRemoved(e.webcamMirroredVideoContainer, 'should not share the attendee camera');
    await this.modPage.wasRemoved(e.webcamStreamItem, 'should not display any camera for the moderator');
    // Answering clears the request, so the moderator may ask again.
    await this.modPage.waitAndClick(e.otherUserMoreOptionsButton);
    await this.modPage.hasElement(e.requestUserCamera, 'should offer the camera request again after a decline');
  }

  // The consent modal is an overlay, so the attendee cannot open its sidebar later.
  async openUserLists() {
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.userPage.waitAndClick(e.usersListSidebarButton);
  }

  private async askAttendeeToShareCamera() {
    await this.modPage.waitAndClick(e.otherUserMoreOptionsButton);
    await this.modPage.waitAndClick(e.requestUserCamera);
    // The toast is the moderator's only feedback.
    await this.modPage.hasText(
      e.smallToastMsg,
      e.cameraRequestSentToast,
      'should confirm to the moderator that the camera request was sent',
    );
    await this.userPage.hasElement(e.confirmShareCamera, 'should prompt the attendee to share their camera');
  }

  private async acceptAndShare() {
    const { skipVideoPreview, skipVideoPreviewOnFirstJoin } = this.userPage.settings || {};

    await this.userPage.waitAndClick(e.confirmShareCamera);
    // Accepting hands over to the regular sharing flow, video preview included.
    if (!(skipVideoPreview || skipVideoPreviewOnFirstJoin)) {
      await this.userPage.hasElement(
        e.webcamMirroredVideoPreview,
        'should open the video preview for the attendee',
        VIDEO_LOADING_WAIT_TIME,
      );
      await this.userPage.waitAndClick(e.startSharingWebcam);
    }
    await this.userPage.hasElement(
      e.webcamMirroredVideoContainer,
      'should share the attendee camera',
      VIDEO_LOADING_WAIT_TIME,
    );
  }

  async skipUnlessWebcamSharingEnabled() {
    const { webcamSharingEnabled } = this.userPage.settings || {};
    test.skip(!webcamSharingEnabled, 'Webcam sharing is disabled');
  }
}
