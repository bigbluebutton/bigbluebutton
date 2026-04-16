import { expect } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';
import { getScreenshareVideoCount, startScreenshare } from './util';

export class ScreenShare extends MultiUsers {
  async startSharing() {
    const { screensharingEnabled } = this.modPage.settings || {};

    await this.modPage.waitForSelector(e.whiteboard);

    if (!screensharingEnabled) {
      await this.modPage.hasElement(e.joinVideo, 'should display the join video button');
      await this.modPage.wasRemoved(e.startScreenSharing, 'should not display the start screenshare button');
      return;
    }
    await startScreenshare(this.modPage);
    await this.modPage.hasElement(e.isSharingScreen, 'should display the screenshare element');
  }

  async startSharingMultiUser(testPage: Page) {
    const { screensharingEnabled } = this.modPage.settings || {};

    await testPage.waitForSelector(e.whiteboard);

    if (!screensharingEnabled) {
      await this.modPage.hasElement(e.joinVideo, 'should display the join video button');
      await this.modPage.wasRemoved(e.startScreenSharing, 'should not display the start screenshare button');
      return;
    }
    await startScreenshare(testPage);
    await testPage.hasElement(e.isSharingScreen, 'should display the screenshare element');
  }

  async testMobileDevice() {
    await this.modPage.wasRemoved(e.startScreenSharing, 'should not display the start screenshare button');
  }

  async screenshareStopsExternalVideo() {
    const { screensharingEnabled } = this.modPage.settings || {};

    await this.modPage.waitForSelector(e.whiteboard);

    if (!screensharingEnabled) {
      await this.modPage.hasElement(e.joinVideo, 'should display the join video button');
      await this.modPage.wasRemoved(e.startScreenSharing, 'should not display the screenshare button');
      return;
    }

    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.shareExternalVideoBtn);
    await this.modPage.waitForSelector(e.closeModal);
    await this.modPage.fill(e.videoModalInput, e.youtubeLink);
    await this.modPage.waitAndClick(e.startShareVideoBtn);

    const modFrame = await this.modPage.getYoutubeFrame();
    await modFrame.hasElement('video', 'should display the video frame');

    await startScreenshare(this.modPage);
    await this.modPage.hasElement(e.isSharingScreen, 'should display the screenshare element');

    await this.modPage.hasElement(e.stopScreenSharing, 'should display the stop screenshare button');
    await this.modPage.waitAndClick(e.stopScreenSharing);
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard');
  }

  async stopSharing() {
    // Stop screenshare
    await this.modPage.waitAndClick(e.stopScreenSharing);
    // Verify screenshare is stopped
    await this.modPage.wasRemoved(e.isSharingScreen, 'should not display the screenshare element after stopping');
    await this.modPage.wasRemoved(e.stopScreenSharing, 'should not display the stop screenshare button after stopping');
    await this.modPage.hasElement(e.startScreenSharing, 'should display the start screenshare button after stopping');
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard after stopping screenshare');
  }

  // Test 1: Both moderator and another user (granted presenter) can screenshare in the same session
  async twoUsersShareSimultaneously() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);

    // Moderator (presenter) starts screenshare first
    await startScreenshare(this.modPage);
    await this.modPage.hasElement(e.isSharingScreen, 'moderator should show isSharingScreen');

    // Attendee should see the moderator's screenshare
    await this.userPage.hasElement(
      e.screenShareVideo,
      'attendee should see the screenshare video',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    // Moderator stops screenshare
    await this.modPage.waitAndClick(e.stopScreenSharing);
    await this.modPage.wasRemoved(e.isSharingScreen, 'moderator screenshare should stop', ELEMENT_WAIT_LONGER_TIME);

    // Now grant presenter to attendee
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.makePresenter);
    await this.userPage.hasElement(
      e.startScreenSharing,
      'attendee should have screenshare button after becoming presenter',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    // Attendee (now presenter) starts screenshare
    await startScreenshare(this.userPage);
    await this.userPage.hasElement(e.isSharingScreen, 'attendee should show isSharingScreen');

    // Moderator should see the attendee's screenshare
    await this.modPage.hasElement(
      e.screenShareVideo,
      'moderator should see attendee screenshare',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    // Cleanup
    await this.userPage.waitAndClick(e.stopScreenSharing);
  }

  // Test 2: Stopping a screenshare restores whiteboard and allows a new share
  async stoppingOneShareKeepsOtherActive() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);

    // Moderator starts screenshare
    await startScreenshare(this.modPage);
    await this.modPage.hasElement(e.isSharingScreen, 'moderator should show isSharingScreen');

    // Attendee sees the screenshare
    await this.userPage.hasElement(
      e.screenShareVideo,
      'attendee should see screenshare video',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    // Moderator stops screenshare
    await this.modPage.waitAndClick(e.stopScreenSharing);
    await this.modPage.wasRemoved(
      e.isSharingScreen,
      'moderator screenshare should be stopped',
      ELEMENT_WAIT_LONGER_TIME,
    );

    // Whiteboard should be visible again
    await this.modPage.hasElement(
      e.whiteboard,
      'moderator should see whiteboard after stopping',
      ELEMENT_WAIT_LONGER_TIME,
    );

    // Attendee's view should return to whiteboard
    await this.userPage.wasRemoved(
      e.screenShareVideo,
      'attendee screenshare video should disappear',
      ELEMENT_WAIT_LONGER_TIME,
    );

    // Moderator can start a new screenshare
    await startScreenshare(this.modPage);
    await this.modPage.hasElement(e.isSharingScreen, 'moderator should be able to start new screenshare');

    // Cleanup
    await this.modPage.waitAndClick(e.stopScreenSharing);
  }

  // Test 3: Multiple users can view an active screenshare
  async multipleUsersViewScreenshare() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);

    // Moderator starts screenshare
    await startScreenshare(this.modPage);
    await this.modPage.hasElement(e.isSharingScreen, 'moderator should show isSharingScreen');

    // Attendee should see the screenshare video
    await this.userPage.hasElement(
      e.screenShareVideo,
      'attendee should see the screenshare video',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    // Verify the screenshare video is visible to attendee
    const attendeeVideoCount = await getScreenshareVideoCount(this.userPage);
    expect(attendeeVideoCount, 'attendee should see at least one screenshare video').toBeGreaterThanOrEqual(1);

    // Cleanup
    await this.modPage.waitAndClick(e.stopScreenSharing);
    await this.userPage.wasRemoved(
      e.screenShareVideo,
      'attendee screenshare video should disappear after mod stops',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  // Test 4: New presenter can screenshare after presenter transfer
  async screenshareSurvivesPresenterChange() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);

    // Moderator starts screenshare
    await startScreenshare(this.modPage);
    await this.modPage.hasElement(e.isSharingScreen, 'moderator should show isSharingScreen');

    // Attendee can see the screenshare
    await this.userPage.hasElement(
      e.screenShareVideo,
      'attendee should see screenshare video',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    // Transfer presenter role to attendee - moderator's screenshare stops
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.makePresenter);

    // New presenter (attendee) can now start screenshare
    await this.userPage.hasElement(
      e.startScreenSharing,
      'new presenter should have screenshare button',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    // New presenter starts screenshare
    await startScreenshare(this.userPage);
    await this.userPage.hasElement(e.isSharingScreen, 'new presenter should show isSharingScreen');

    // Original moderator should see the new presenter's screenshare
    await this.modPage.hasElement(
      e.screenShareVideo,
      'moderator should see new presenter screenshare',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    // Cleanup
    await this.userPage.waitAndClick(e.stopScreenSharing);
  }

  // Test 5: Second user can screenshare after first user stops (sequential multi-user sharing)
  async attendeeSeesMultipleShares() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);

    // Moderator starts screenshare
    await startScreenshare(this.modPage);
    await this.modPage.hasElement(e.isSharingScreen, 'moderator should show isSharingScreen');

    // Attendee sees the screenshare
    await this.userPage.hasElement(
      e.screenShareVideo,
      'attendee should see moderator screenshare',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    const attendeeVideoCount1 = await getScreenshareVideoCount(this.userPage);
    expect(attendeeVideoCount1, 'attendee should see moderator screenshare video').toBeGreaterThanOrEqual(1);

    // Moderator stops screenshare
    await this.modPage.waitAndClick(e.stopScreenSharing);
    await this.userPage.wasRemoved(
      e.screenShareVideo,
      'attendee screenshare should disappear after mod stops',
      ELEMENT_WAIT_LONGER_TIME,
    );

    // Grant presenter to attendee
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.makePresenter);
    await this.userPage.hasElement(
      e.startScreenSharing,
      'attendee should have screenshare button',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    // Attendee starts screenshare
    await startScreenshare(this.userPage);
    await this.userPage.hasElement(e.isSharingScreen, 'attendee should show isSharingScreen');

    // Moderator sees the attendee's screenshare
    await this.modPage.hasElement(
      e.screenShareVideo,
      'moderator should see attendee screenshare',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    const modVideoCount = await getScreenshareVideoCount(this.modPage);
    expect(modVideoCount, 'moderator should see at least one screenshare video').toBeGreaterThanOrEqual(1);

    // Cleanup
    await this.userPage.waitAndClick(e.stopScreenSharing);
  }

  // Test 6: Screenshare coexists with meeting UI (actions bar, user list remain accessible)
  async screenshareCoexistsWithMeetingUI() {
    await this.modPage.waitForSelector(e.whiteboard);

    // Start screenshare
    await startScreenshare(this.modPage);
    await this.modPage.hasElement(e.isSharingScreen, 'should display screenshare element');

    // Verify core UI elements remain accessible during screenshare
    await this.modPage.hasElement(e.actions, 'actions bar should be visible during screenshare');
    await this.modPage.hasElement(e.userListToggleBtn, 'user list toggle should be accessible during screenshare');
    await this.modPage.hasElement(e.stopScreenSharing, 'stop screenshare button should be visible');

    // Verify audio join button remains accessible (user hasn't joined audio yet)
    await this.modPage.hasElement(e.joinAudio, 'audio button should be accessible during screenshare');

    // Verify camera button remains accessible
    await this.modPage.hasElement(e.joinVideo, 'camera button should be accessible during screenshare');

    // Stop screenshare and verify normal UI restored
    await this.modPage.waitAndClick(e.stopScreenSharing);
    await this.modPage.hasElement(e.whiteboard, 'whiteboard should be visible after stopping screenshare');
    await this.modPage.hasElement(e.startScreenSharing, 'start screenshare button should be visible after stopping');
  }
}
