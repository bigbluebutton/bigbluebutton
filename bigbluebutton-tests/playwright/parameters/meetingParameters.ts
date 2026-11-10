import { expect, test } from '@playwright/test';

import { VIDEO_LOADING_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { getDefaultLocaleValue } from '../core/util';
import { startScreenshare } from '../screenshare/util';
import { MultiUsers } from '../user/multiusers';
import { checkAvatarIcon } from '../user/util';

const WELCOME_WITH_KEYWORDS = 'Welcome to %%CONFNAME%%, conference %%CONFNUM%%';
const DIAL_NUMBER = '+1-613-555-0199';
// The host never resolves: the page only gets served through the route externalUpload() sets.
const EXTERNAL_UPLOAD_URL = 'https://bbb-test-stub.local/external-upload';
const EXTERNAL_UPLOAD_DESCRIPTION = 'Choose a file from the course library';

// Selectors core/elements.ts has no entry for
// a camera tile of the video dock, by the name of the user sharing the camera
const cameraTile = (userName: string) => `${e.webcamStreamItem}[data-user-name="${userName}"]`;
// a row of the participants list, by the whole user name
const userListItemOf = (userName: string) => `${e.userListItem}[aria-label="${userName}"]`;
// the external upload block of the upload dialog carries no data-test, so it is found by its heading
const externalUploadBlock = () =>
  `div[id="upload-modal"] > div:has-text("${getDefaultLocaleValue('app.presentationUploder.externalUploadTitle')}")`;

// the signalling socket of bbb-webrtc-sfu, which a LiveKit meeting only opens for media routed there
const isSfuSocket = (url: string) => url.includes('/bbb-webrtc-sfu');

export const sessionDetailsParameters = (voiceBridge: string) =>
  `welcome=${encodeURIComponent(WELCOME_WITH_KEYWORDS)}&dialNumber=${encodeURIComponent(DIAL_NUMBER)}` +
  `&voiceBridge=${voiceBridge}`;

export const EXTERNAL_UPLOAD_PARAMETERS =
  `presentationUploadExternalUrl=${encodeURIComponent(EXTERNAL_UPLOAD_URL)}` +
  `&presentationUploadExternalDescription=${encodeURIComponent(EXTERNAL_UPLOAD_DESCRIPTION)}`;

export class MeetingParameters extends MultiUsers {
  async sessionDetails(voiceBridge: string) {
    await this.modPage.waitAndClick(e.sessionDetailsButton);
    await this.modPage.hasElement(e.sessionDetailsModal, 'should open the session details from the meeting title');
    // createMeetingUrl names the meeting after its ID
    await this.modPage.hasText(
      e.sessionDetailsModal,
      `Welcome to ${this.modPage.meetingId}, conference ${voiceBridge}`,
      'should show the welcome message with the meeting name and the voice bridge in place of its keywords',
    );
    await this.modPage.hasText(e.sessionDetailsModal, DIAL_NUMBER, 'should show the number to dial in');
    // the client groups the PIN digits in threes from the right
    await this.modPage.hasText(
      e.sessionDetailsModal,
      `${voiceBridge.slice(0, -3)} ${voiceBridge.slice(-3)} #`,
      'should show the voice bridge as the PIN to dial in with',
    );
  }

  private async pinCamera(userName: string) {
    await this.modPage.waitAndClick(`${cameraTile(userName)} ${e.dropdownWebcamButton}`);
    await this.modPage.waitAndClick(e.pinWebcamBtn);
    await this.modPage.hasElement(
      `${cameraTile(userName)} ${e.pinVideoButton}`,
      `should pin the camera of ${userName}`,
    );
  }

  // the moderator pins the camera of the first attendee, then the camera of the second one
  private async pinBothAttendeeCameras() {
    await this.userPage.shareWebcam();
    await this.userPage2.shareWebcam();
    await this.modPage.hasElement(
      cameraTile(this.userPage.username),
      'should display the camera of the first attendee to the moderator',
      VIDEO_LOADING_WAIT_TIME,
    );
    await this.modPage.hasElement(
      cameraTile(this.userPage2.username),
      'should display the camera of the second attendee to the moderator',
      VIDEO_LOADING_WAIT_TIME,
    );
    await this.pinCamera(this.userPage.username);
    await this.pinCamera(this.userPage2.username);
  }

  async secondPinnedCameraUnpinsTheFirst() {
    await this.pinBothAttendeeCameras();
    await this.modPage.wasRemoved(
      `${cameraTile(this.userPage.username)} ${e.pinVideoButton}`,
      'should unpin the first camera once the second one is pinned',
    );
  }

  async secondPinnedCameraKeepsTheFirst() {
    await this.pinBothAttendeeCameras();
    await this.modPage.hasElement(
      `${cameraTile(this.userPage.username)} ${e.pinVideoButton}`,
      'should keep the first camera pinned once the second one is pinned',
    );
  }

  async externalUpload() {
    const context = this.modPage.page.context();
    await context.route(EXTERNAL_UPLOAD_URL, (route) =>
      route.fulfill({ contentType: 'text/html', body: '<html><body>external upload</body></html>' }),
    );
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.hasText(
      externalUploadBlock(),
      EXTERNAL_UPLOAD_DESCRIPTION,
      'should show the description of the external upload in the upload dialog',
    );
    const externalUploadPage = await this.modPage.handleNewTab(`${externalUploadBlock()} button`, context);
    await expect(externalUploadPage, 'should open the external upload URL in a new page').toHaveURL(
      EXTERNAL_UPLOAD_URL,
    );
  }

  // Every row of the participants list keeps its options menu mounted, so the visible
  // items are those of the open menu. A guest's promotion depends on allowPromoteGuestToModerator
  // only while bbb-web has authenticatedGuest on, its default.
  async promoteOptionOnGuest(guestCanBePromoted: boolean) {
    const promoteOption = `${e.promoteToModerator}:visible`;
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.waitAndClick(`${userListItemOf(this.userPage.username)} ${e.moreOptionsUserItemButton}`);
    await this.modPage.hasElement(promoteOption, 'should offer to promote an attendee who is not a guest');
    await this.modPage.press('Escape');
    await this.modPage.wasRemoved(promoteOption, 'should close the options of the attendee');

    await this.modPage.waitAndClick(`${userListItemOf(this.userPage2.username)} ${e.moreOptionsUserItemButton}`);
    await this.modPage.hasElement(`${e.makePresenter}:visible`, 'should open the options of the guest');
    if (guestCanBePromoted) {
      await this.modPage.hasElement(promoteOption, 'should offer to promote the guest');
      await this.userPage2.waitAndClick(e.usersListSidebarButton);
      await checkAvatarIcon(this.userPage2, false);
      await this.modPage.waitAndClick(promoteOption);
      await checkAvatarIcon(this.userPage2);
    } else {
      await this.modPage.wasRemoved(
        promoteOption,
        'should not offer to promote the guest (needs authenticatedGuest=true, the bbb-web default)',
      );
    }
  }

  async webcamThroughSfu(socketUrls: string[]) {
    await this.modPage.shareWebcam();
    expect(socketUrls.some(isSfuSocket), 'should signal the webcam through bbb-webrtc-sfu').toBe(true);
  }

  async screenshareThroughSfu(socketUrls: string[]) {
    test.skip(!this.modPage.settings?.screensharingEnabled, 'Screen sharing is disabled');
    await startScreenshare(this.modPage);
    expect(socketUrls.some(isSfuSocket), 'should signal the screen share through bbb-webrtc-sfu').toBe(true);
  }

  async breakoutCaptureDefaults() {
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await this.modPage.waitAndClick(e.moreOptionsToggle);
    await this.modPage.hasElement(e.captureBreakoutWhiteboard, 'should offer to save the whiteboard of the rooms');
    await this.modPage.hasElement(e.captureBreakoutSharedNotes, 'should offer to save the shared notes of the rooms');
    await this.modPage.hasElementChecked(
      e.captureBreakoutWhiteboard,
      'should check "Save whiteboard" from the start when breakoutRoomsCaptureSlides is true',
    );
    await this.modPage.hasElementChecked(
      e.captureBreakoutSharedNotes,
      'should check "Save shared notes" from the start when breakoutRoomsCaptureNotes is true',
    );
  }
}
