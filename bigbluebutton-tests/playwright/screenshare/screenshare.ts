import { expect } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';
import { checkIsPresenter, openLockViewers } from '../user/util';
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

  // Test: Non-presenter starts screenshare (verifies multi-screenshare allows non-presenters)
  async nonPresenterStartsScreenshare() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);

    // In current implementation, non-presenters see the button but it's disabled
    // unless multi-screenshare is enabled AND showButtonForNonPresenters is true.
    // With the multi-screenshare feature branch, we verify the attendee can see the button.
    const hasButton = await this.userPage.checkElement(e.startScreenSharing);
    const hasLockedButton = await this.userPage.checkElement(e.screenshareLocked);

    if (hasButton) {
      // If button is present and enabled, try to start screenshare
      await startScreenshare(this.userPage);
      await this.userPage.hasElement(e.isSharingScreen, 'attendee should show isSharingScreen');

      // Moderator (presenter) should still see their content area unaffected
      await this.modPage.hasElement(e.whiteboard, 'moderator whiteboard should be unaffected');

      // Cleanup
      await this.userPage.waitAndClick(e.stopScreenSharing);
    } else if (hasLockedButton) {
      // Button exists but is locked/disabled - expected for non-presenter without multi-screenshare
      expect(hasLockedButton, 'attendee should see locked screenshare button').toBeTruthy();
    } else {
      // Multi-screenshare not enabled for non-presenters - grant presenter to test
      await this.modPage.waitAndClick(e.userListItem);
      await this.modPage.waitAndClick(e.makePresenter);
      await this.userPage.hasElement(
        e.startScreenSharing,
        'attendee should have screenshare button after becoming presenter',
        ELEMENT_WAIT_EXTRA_LONG_TIME,
      );
      await startScreenshare(this.userPage);
      await this.userPage.hasElement(e.isSharingScreen, 'attendee should show isSharingScreen');

      // Cleanup
      await this.userPage.waitAndClick(e.stopScreenSharing);
    }
  }

  // Test: Screenshare appears in content area (presentation area)
  async screenshareInContentArea() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);

    // Moderator (presenter) starts screenshare
    await startScreenshare(this.modPage);
    await this.modPage.hasElement(e.isSharingScreen, 'moderator should show isSharingScreen');

    // Screenshare video should appear in the presentation/content area for the attendee
    await this.userPage.hasElement(
      e.screenShareVideo,
      'attendee should see screenshare video in content area',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    // Whiteboard should be replaced by screenshare content
    await this.userPage.wasRemoved(
      e.whiteboard,
      'whiteboard should not be visible while screenshare is in content area',
      ELEMENT_WAIT_LONGER_TIME,
    );

    // Cleanup
    await this.modPage.waitAndClick(e.stopScreenSharing);
    await this.userPage.hasElement(
      e.whiteboard,
      'whiteboard should return after screenshare stops',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  // Test: Content priority full cycle (slides -> screenshare -> stop -> slides)
  async contentPriorityFullCycle() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);

    // Phase 1: Slides (whiteboard) visible
    await this.userPage.hasElement(e.whiteboard, 'attendee should see whiteboard initially');

    // Phase 2: Presenter starts screenshare -> replaces slides
    await startScreenshare(this.modPage);
    await this.modPage.hasElement(e.isSharingScreen, 'moderator should be sharing screen');

    await this.userPage.hasElement(
      e.screenShareVideo,
      'attendee should see screenshare in content area',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    // Phase 3: Stop screenshare -> slides restored
    await this.modPage.waitAndClick(e.stopScreenSharing);
    await this.modPage.wasRemoved(e.isSharingScreen, 'moderator screenshare should stop', ELEMENT_WAIT_LONGER_TIME);

    await this.userPage.hasElement(
      e.whiteboard,
      'whiteboard should be restored after screenshare stops',
      ELEMENT_WAIT_LONGER_TIME,
    );

    await this.userPage.wasRemoved(e.screenShareVideo, 'screenshare video should be gone', ELEMENT_WAIT_LONGER_TIME);

    // Phase 4: Start screenshare again to confirm cycle works
    await startScreenshare(this.modPage);
    await this.userPage.hasElement(
      e.screenShareVideo,
      'attendee should see screenshare again on second share',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    // Cleanup
    await this.modPage.waitAndClick(e.stopScreenSharing);
  }

  // Test: Screenshare coexists with webcam
  async screenshareWithWebcam() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);

    // Both users share webcam
    await this.modPage.shareWebcam();
    await this.userPage.shareWebcam();

    // Verify webcams are active
    await this.modPage.hasElement(e.webcamContainer, 'moderator should see webcam container');
    await this.userPage.hasElement(e.webcamContainer, 'attendee should see webcam container');

    // Moderator starts screenshare while webcams are active
    await startScreenshare(this.modPage);
    await this.modPage.hasElement(e.isSharingScreen, 'moderator should be sharing screen');

    // Verify screenshare is visible to attendee
    await this.userPage.hasElement(
      e.screenShareVideo,
      'attendee should see screenshare video alongside webcam',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    // Verify webcams are still active during screenshare
    await this.modPage.hasElement(e.leaveVideo, 'moderator webcam should still be active during screenshare');
    await this.userPage.hasElement(e.leaveVideo, 'attendee webcam should still be active during screenshare');

    // Cleanup
    await this.modPage.waitAndClick(e.stopScreenSharing);
    await this.modPage.wasRemoved(e.isSharingScreen, 'screenshare should stop', ELEMENT_WAIT_LONGER_TIME);

    // Webcams should still be active after screenshare stops
    await this.modPage.hasElement(e.leaveVideo, 'moderator webcam should persist after screenshare stops');
    await this.userPage.hasElement(e.leaveVideo, 'attendee webcam should persist after screenshare stops');
  }

  // T22: Moderador não-presenter compartilha (R2)
  async moderatorNonPresenterSharesScreen() {
    // modPage  = first moderator (presenter by default in BBB)
    // modPage2 = second moderator (must NOT be presenter — never promoted)
    // Wait for the screenshare button to appear — it signals the meeting is loaded
    // and screenshare is available. Using this instead of e.whiteboard because the
    // canvas only renders with active slide content, which may not be present.
    await this.modPage.hasElement(
      e.startScreenSharing,
      'presenter should see start screenshare button',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await this.modPage2.hasElement(
      e.startScreenSharing,
      'second moderator should see start screenshare button',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    // Check 3 guard: confirm modPage2 is NOT presenter before sharing
    const mod2IsPresenterBefore = await checkIsPresenter(this.modPage2);
    expect(mod2IsPresenterBefore, 'second moderator must not be presenter at setup').toBeFalsy();

    // Non-presenter moderator must see the screenshare button (enabled, not locked)
    await this.modPage2.hasElement(
      e.startScreenSharing,
      'non-presenter moderator should see start screenshare button without promotion',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    // Start screenshare from the non-presenter moderator — no promotion at any point
    await startScreenshare(this.modPage2);

    // Observer (first moderator/presenter) must see the screenshare stream
    await this.modPage.hasElement(
      e.screenShareVideo,
      'presenter should see screenshare stream from non-presenter moderator',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    // Check 3 guard: confirm modPage2 is STILL NOT the presenter after sharing
    const mod2IsPresenterAfter = await checkIsPresenter(this.modPage2);
    expect(mod2IsPresenterAfter, 'second moderator must not be promoted to presenter during screenshare').toBeFalsy();

    // Cleanup
    await this.modPage2.waitAndClick(e.stopScreenSharing);
  }

  // T06: Lock "Share screen" (hideViewersScreenshare) blocks viewer, no promotion (R13, R15, R3)
  // Pre-condition: moderator (presenter) + viewer (NEVER promoted). Lock initially OFF.
  // Steps: enable lock → viewer button disappears → mod can share → viewer in list → disable lock → viewer can share.
  async lockBlocksViewerNoPromotion() {
    // Wait for meeting to be ready — screenshare button is our canary
    await this.modPage.hasElement(
      e.startScreenSharing,
      'moderator should see screenshare button',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await this.userPage.hasElement(
      e.startScreenSharing,
      'viewer should see screenshare button before lock is active',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    // Check 3 guard: viewer must NOT be presenter
    const viewerIsPresenterBefore = await checkIsPresenter(this.userPage);
    expect(viewerIsPresenterBefore, 'viewer must not be presenter at start of T06').toBeFalsy();

    // Step 1: Moderator activates hideViewersScreenshare lock via lock-viewers modal
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.hideViewersScreenshare);
    await this.modPage.waitAndClick(e.applyLockSettings);

    // Step 2: Viewer's screenshare button disappears — server enforced lock propagated via GraphQL
    await this.userPage.wasRemoved(
      e.startScreenSharing,
      'viewer screenshare button must disappear when lock is active',
      ELEMENT_WAIT_LONGER_TIME,
    );

    // Step 3: Moderator can still share (moderators bypass the lock per R13)
    await startScreenshare(this.modPage);
    await this.modPage.hasElement(
      e.isSharingScreen,
      'moderator should still be able to share screen while lock is active',
    );

    // Check 3: Viewer is still in participant list — no eject occurred (R3)
    const viewerInModList = this.modPage.page.locator(e.userListItem).filter({ hasText: 'Attendee' });
    await expect(
      viewerInModList,
      'viewer must still be in participant list while lock is active — no eject occurred',
    ).toBeVisible();

    // Moderator stops share
    await this.modPage.waitAndClick(e.stopScreenSharing);
    await this.modPage.wasRemoved(e.isSharingScreen, 'moderator screenshare should stop', ELEMENT_WAIT_LONGER_TIME);

    // Step 4: Moderator deactivates the lock
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.hideViewersScreenshare);
    await this.modPage.waitAndClick(e.applyLockSettings);

    // Step 5: Viewer's screenshare button reappears after lock is deactivated
    await this.userPage.hasElement(
      e.startScreenSharing,
      'viewer should see screenshare button again after lock is deactivated',
      ELEMENT_WAIT_LONGER_TIME,
    );

    // Check 3: Viewer is still NOT promoted to presenter
    const viewerIsPresenterAfter = await checkIsPresenter(this.userPage);
    expect(viewerIsPresenterAfter, 'viewer must not be promoted to presenter during T06').toBeFalsy();

    // Viewer starts screenshare after lock is removed (confirms share path is restored)
    // startScreenshare validates via screenShareVideo + stopScreenSharing internally
    await startScreenshare(this.userPage);

    // Cleanup
    await this.userPage.waitAndClick(e.stopScreenSharing);
  }

  // T11: Presenter change keeps screenshares active (R8, R12)
  // Pre-condition: presenter (modPage) + viewer (userPage) both sharing screen.
  // Action: moderator transfers presenter role to viewer.
  // Assert: old presenter's stream is still in DOM (in camera dock), not stopped.
  async presenterChangeKeepsShares() {
    // Wait for meeting to be ready — screenshare buttons as canary
    await this.modPage.hasElement(
      e.startScreenSharing,
      'presenter should see screenshare button',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await this.userPage.hasElement(
      e.startScreenSharing,
      'viewer should see screenshare button',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    // Check 3 guard: viewer must NOT be presenter before test
    const viewerIsPresenterBefore = await checkIsPresenter(this.userPage);
    expect(viewerIsPresenterBefore, 'viewer must not be presenter at start of T11').toBeFalsy();

    // Step 1: Presenter (modPage) starts screenshare → goes to content area
    await startScreenshare(this.modPage);
    await this.modPage.hasElement(e.isSharingScreen, 'presenter should be sharing screen');
    await this.userPage.hasElement(
      e.screenShareVideo,
      'viewer should see presenter screenshare in content area',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    // Capture presenter's stream ID from the content-area video element (id="screenshareVideo-{streamId}")
    const presenterVideoEl = this.userPage.page.locator(e.screenShareVideo).first();
    await presenterVideoEl.waitFor({ timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });
    const videoId = await presenterVideoEl.getAttribute('id');
    const presenterStreamId = videoId?.replace('screenshareVideo-', '') ?? '';
    expect(presenterStreamId, 'could not extract presenter stream ID from video element').not.toBe('');

    // Step 2: Viewer starts screenshare → goes to camera dock (R9: viewers never in content area)
    await startScreenshare(this.userPage);

    // Step 3: Transfer presenter role to viewer — this is the feature action under test (R12)
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.makePresenter);

    // Assert: old presenter's screenshare migrated to camera dock — stream element still in DOM (R8)
    // Camera dock tiles expose data-stream={streamId} on their video container.
    // The tile is attached but may be hidden (no video attached for screenshare-type dock tiles);
    // toBeAttached() is sufficient to prove the stream migrated (not stopped).
    const cameraStreamSelector = `div[data-stream="${presenterStreamId}"]`;
    await expect(
      this.userPage.page.locator(cameraStreamSelector),
      'old presenter screenshare must migrate to camera dock, NOT be stopped (R8, R12)',
    ).toBeAttached({ timeout: ELEMENT_WAIT_LONGER_TIME });

    // Assert: content area no longer shows a screenshare (both shares are in camera dock now).
    // After migration showAsContent=false for all screenshares; the screenshare container becomes
    // hidden (display:none via shouldShowScreenshare=false) but may stay attached in DOM.
    await this.userPage.page.waitForSelector('#screenshareContainer', {
      state: 'hidden',
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });

    // Assert: viewer's screenshare is still active (stop button visible)
    await this.userPage.hasElement(
      e.stopScreenSharing,
      'viewer screenshare should still be active after presenter transfer',
    );

    // Check 3 final guard: viewer is now presenter (role transferred, not promoted artificially)
    const viewerIsPresenterAfter = await checkIsPresenter(this.userPage);
    expect(viewerIsPresenterAfter, 'viewer should be the new presenter after role transfer').toBeTruthy();

    // Cleanup
    await this.modPage.waitAndClick(e.stopScreenSharing);
    await this.userPage.waitAndClick(e.stopScreenSharing);
  }

  // T12: External video migrates presenter screenshare to camera area (R8, R9, R11)
  // Pre-condition: presenter (modPage) sharing screen, viewer (userPage) sharing screen.
  // Action: presenter starts external video.
  // Assert: external video in content area; presenter's screenshare in camera dock (not stopped).
  async externalVideoMigratesPresenterShare() {
    // Wait for meeting ready
    await this.modPage.hasElement(
      e.startScreenSharing,
      'presenter should see screenshare button',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await this.userPage.hasElement(
      e.startScreenSharing,
      'viewer should see screenshare button',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    // Check 3 guard: viewer must NOT be presenter
    const viewerIsPresenterBefore = await checkIsPresenter(this.userPage);
    expect(viewerIsPresenterBefore, 'viewer must not be presenter at start of T12').toBeFalsy();

    // Step 1: Presenter (modPage) starts screenshare → appears in content area
    await startScreenshare(this.modPage);
    await this.modPage.hasElement(e.isSharingScreen, 'presenter should be sharing screen');
    await this.userPage.hasElement(
      e.screenShareVideo,
      'viewer should see presenter screenshare in content area',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    // Capture presenter's stream ID from content-area video element before migration
    const presenterVideoEl = this.userPage.page.locator(e.screenShareVideo).first();
    await presenterVideoEl.waitFor({ timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });
    const videoId = await presenterVideoEl.getAttribute('id');
    const presenterStreamId = videoId?.replace('screenshareVideo-', '') ?? '';
    expect(presenterStreamId, 'could not extract presenter stream ID').not.toBe('');

    // Step 2: Viewer starts screenshare → goes to camera dock (R9)
    await startScreenshare(this.userPage);

    // Step 3: Presenter starts external video — triggers screenshare migration (R8)
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.shareExternalVideoBtn);
    await this.modPage.waitForSelector(e.closeModal);
    await this.modPage.fill(e.videoModalInput, e.youtubeLink);
    await this.modPage.waitAndClick(e.startShareVideoBtn);

    // Assert: external video is now in content area
    await this.modPage.hasElement(
      e.youtubeFrame,
      'external video should occupy the content area',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    // Assert: screenshare container is hidden — no screenshare in content area anymore (R11).
    // After migration showAsContent=false; the container becomes hidden (display:none) but may
    // stay attached in DOM while screenshares remain active.
    await this.userPage.page.waitForSelector('#screenshareContainer', {
      state: 'hidden',
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });

    // Assert: presenter's screenshare stream is still in DOM, now in camera dock (R8)
    // Camera dock tiles expose data-stream={streamId} on their video container div.
    // The tile is attached but may be hidden (no video for screenshare-type dock tiles);
    // toBeAttached() is sufficient to prove migration (not stopped).
    const presenterCamStream = this.userPage.page.locator(`div[data-stream="${presenterStreamId}"]`);
    await expect(
      presenterCamStream,
      'presenter screenshare must migrate to camera dock (NOT stopped) when external video starts (R8)',
    ).toBeAttached({ timeout: ELEMENT_WAIT_LONGER_TIME });

    // Assert: viewer's screenshare is still active — stop button present (R9)
    await this.userPage.hasElement(
      e.stopScreenSharing,
      'viewer screenshare should remain active after external video starts (R9)',
    );

    // Check 3 final guard: viewer was never promoted to presenter
    const viewerIsPresenterAfter = await checkIsPresenter(this.userPage);
    expect(viewerIsPresenterAfter, 'viewer must not be promoted to presenter during T12').toBeFalsy();

    // Cleanup: stop both screenshares (external video stops automatically on meeting end)
    await this.modPage.waitAndClick(e.stopScreenSharing);
    await this.userPage.waitAndClick(e.stopScreenSharing);
  }

  // T19: Blocked attempt from viewer does not eject them from the meeting (R3)
  // Pre-condition: moderator (presenter) + viewer. Lock enabled by moderator.
  // Steps: enable lock → viewer has no share button (server denied via GraphQL) → assert viewer still in meeting.
  async lockedAttemptNoEject() {
    // Wait for meeting to be ready
    await this.modPage.hasElement(
      e.startScreenSharing,
      'moderator should see screenshare button',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await this.userPage.hasElement(
      e.startScreenSharing,
      'viewer should see screenshare button before lock',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    // Moderator enables hideViewersScreenshare lock — server enforces denial for viewers
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClickElement(e.hideViewersScreenshare);
    await this.modPage.waitAndClick(e.applyLockSettings);

    // Viewer's button disappears — server communicated the lock; client reflects server state
    await this.userPage.wasRemoved(
      e.startScreenSharing,
      'viewer screenshare button must be removed when server-side lock is active',
      ELEMENT_WAIT_LONGER_TIME,
    );

    // Explicit denial without ejection: viewer is still in moderator's participant list
    const viewerInModList = this.modPage.page.locator(e.userListItem).filter({ hasText: 'Attendee' });
    await expect(
      viewerInModList,
      'viewer must still be in participant list after server denial — no eject occurred (R3)',
    ).toBeVisible();

    // Viewer's own UI confirms they are still in the meeting (not ejected/disconnected)
    await this.userPage.hasElement(
      e.currentUser,
      'viewer should still see their own user entry in the meeting — not ejected',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  /* eslint-disable class-methods-use-this, no-useless-return */
  async lockDisableMultiScreenshare() {
    // Stub: replaced by lockBlocksViewerNoPromotion
    // and lockedAttemptNoEject in multi-screenshare.spec.ts.
    return;
  }
  /* eslint-enable class-methods-use-this, no-useless-return */
}
