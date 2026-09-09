import { BrowserContext, expect, Page as PlaywrightPage } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME, VIDEO_LOADING_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { InitOptionsProps } from '../core/page';
import { InitExtraPageOptionsProps, MultiUsers } from '../user/multiusers';
import { setGuestPolicyOption } from '../user/util';
import { NO_PRE_FLIGHT_INIT_OPTIONS, PRE_FLIGHT_INIT_OPTIONS } from './util';

export class PreFlight extends MultiUsers {
  // The attendee is the one held by the pre-flight; the moderator goes through
  // the regular flow and observes the server side of the join.
  async initModPage(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await super.initModPage(page, { ...NO_PRE_FLIGHT_INIT_OPTIONS, ...options });
  }

  async initUserPageWithPreFlight(context?: BrowserContext, options: InitOptionsProps = {}) {
    await this.initUserPage(context || this.context, { ...PRE_FLIGHT_INIT_OPTIONS, ...options });
    // Same first-paint budget as init()'s layout wait, which is skipped here.
    await this.userPage.hasElement(
      e.preFlight,
      'should display the pre-flight screen before joining',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
  }

  // The toggle starts in autoShareWebcam's state, off by default.
  async enableCamera() {
    await this.userPage.waitAndClick(e.preFlightCameraToggle);
    await this.userPage.hasElement(
      e.webcamMirroredVideoPreview,
      'should display the camera preview once the camera is toggled on',
      VIDEO_LOADING_WAIT_TIME,
    );
  }

  async confirmJoin() {
    await this.userPage.waitAndClick(e.preFlightJoinButton);
    await this.userPage.waitForSelector(e.layoutContainer, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.userPage.wasRemoved(e.preFlight, 'should remove the pre-flight screen after joining');
  }

  async joinsOnlyAfterConfirmation() {
    await this.initUserPageWithPreFlight();

    // Both absences are read after settled positive signals (the pre-flight is
    // rendered, the moderator's own list item is up), so a join in flight would
    // already have landed.
    await this.userPage.hasElement(e.preFlightJoinButton, 'should display the join button in the pre-flight');
    // Opened so the attendee's absence is asserted over a rendered list.
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.hasElement(e.currentUser, "should display the moderator's own user list item");
    expect(
      await this.userPage.checkElement(e.layoutContainer),
      'should not render the meeting layout before the join is confirmed',
    ).toBeFalsy();
    expect(
      await this.modPage.checkElement(e.viewerAvatar),
      'should not display the attendee in the user list before the join is confirmed',
    ).toBeFalsy();

    await this.confirmJoin();
    await this.modPage.hasElement(
      e.viewerAvatar,
      'should display the attendee in the user list after the join is confirmed',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  async joinsAudioWithoutModal() {
    await this.initUserPageWithPreFlight();
    await this.confirmJoin();

    await this.userPage.hasElement(
      e.muteMicButton,
      'should join the audio unmuted with the pre-flight microphone selection',
      ELEMENT_WAIT_LONGER_TIME,
    );
    // Only meaningful once the audio has settled: before that the modal simply
    // hasn't had the chance to open.
    expect(
      await this.userPage.checkElement(e.audioModal),
      'should not display the audio modal after the pre-flight',
    ).toBeFalsy();
  }

  async joinsMutedWhenMicToggledOff() {
    await this.initUserPageWithPreFlight();
    await this.userPage.waitAndClick(e.preFlightMuteToggle);
    await this.confirmJoin();

    await this.userPage.hasElement(
      e.unmuteMicButton,
      'should join the audio muted when the microphone is toggled off in the pre-flight',
      ELEMENT_WAIT_LONGER_TIME,
    );
    expect(
      await this.userPage.checkElement(e.audioModal),
      'should not display the audio modal after the pre-flight',
    ).toBeFalsy();
  }

  async sharesCameraWithoutPreviewModal() {
    await this.initUserPageWithPreFlight();
    await this.enableCamera();

    await this.confirmJoin();
    await this.userPage.hasElement(
      e.leaveVideo,
      'should share the camera picked in the pre-flight right after joining',
      VIDEO_LOADING_WAIT_TIME,
    );
    expect(
      await this.userPage.checkElement(e.startSharingWebcam),
      'should not display the video preview modal after joining',
    ).toBeFalsy();
    await this.modPage.hasElement(
      e.webcamContainer,
      "should display the attendee's camera for the moderator",
      VIDEO_LOADING_WAIT_TIME,
    );
  }

  async keepsCameraOffWhenToggled() {
    await this.initUserPageWithPreFlight();
    await this.enableCamera();
    await this.userPage.waitAndClick(e.preFlightCameraToggle);
    await this.userPage.wasRemoved(
      e.webcamMirroredVideoPreview,
      'should stop the camera preview when the camera is toggled off',
    );

    await this.confirmJoin();
    await this.userPage.hasElement(
      e.joinVideo,
      'should not share the camera when it is toggled off in the pre-flight',
      ELEMENT_WAIT_LONGER_TIME,
    );
    expect(
      await this.userPage.checkElement(e.webcamMirroredVideoContainer),
      'should not display the own camera when it is toggled off in the pre-flight',
    ).toBeFalsy();
  }

  async picksDevicesInTheSetupPanel() {
    await this.initUserPageWithPreFlight();
    // The camera and quality selectors are disabled while the camera is off.
    await this.enableCamera();

    const selectors = [
      e.preFlightOutputDevice,
      e.preFlightInputDevice,
      e.preFlightCameraDevice,
      e.preFlightCameraQuality,
    ];

    for (const selector of selectors) {
      await this.userPage.waitAndClick(selector);
      // nth=0: an unscoped locator over a multi-entry list trips strict mode.
      await this.userPage.hasElement(`${e.selectMenuItem} >> nth=0`, `should list the devices of ${selector}`);
      await this.userPage.waitAndClick(`${e.selectMenuItem} >> nth=0`);
      await this.userPage.wasRemoved(`${e.selectMenuItem} >> nth=0`, `should close the dropdown of ${selector}`);
    }

    await this.confirmJoin();
    await this.userPage.hasElement(
      e.muteMicButton,
      'should connect the audio with the device picked in the pre-flight',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  async guestLobbyWithinPreFlight() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    // The policy has to reach the server before the guest joins, or they walk in.
    await this.modPage.page.waitForTimeout(500);
    await this.initUserPageWithPreFlight();

    await this.userPage.hasText(
      e.guestMessage,
      /wait/,
      'should display the waiting message in the pre-flight guest lobby',
    );
    await this.userPage.hasText(
      e.positionInWaitingQueue,
      /first/,
      'should display the position in the waiting queue in the pre-flight guest lobby',
    );
    expect(
      await this.userPage.checkElement(e.preFlightJoinButton),
      'should not display the join button while the guest waits for approval',
    ).toBeFalsy();

    // The waiting queues live in the user list, which starts collapsed.
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.waitAndClick(e.allowEveryone);
    await this.userPage.hasElement(
      e.preFlightJoinButton,
      'should display the join button once the guest is approved',
      ELEMENT_WAIT_LONGER_TIME,
    );

    await this.confirmJoin();
    await this.modPage.hasElement(
      e.viewerAvatar,
      'should display the approved guest in the user list after they join',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  // With the setting off the client keeps the previous flow.
  async disabledByDefault() {
    await this.initUserPage(this.context, NO_PRE_FLIGHT_INIT_OPTIONS);
    expect(
      await this.userPage.checkElement(e.preFlight),
      'should not display the pre-flight screen when the setting is off',
    ).toBeFalsy();
    await this.userPage.hasElement(e.layoutContainer, 'should join the meeting without any confirmation');
  }
}
