import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';
import { openLockViewers } from '../user/util';
import {
  dwellOnBehavior,
  expectDecodedFrames,
  expectMultipleDecodedVideos,
  expectVideosRenderedSideBySide,
  expectVisiblyRendered,
  stabilityWindow,
  startScreenshare,
} from './util';

export class ScreenShare extends MultiUsers {
  async startSharing() {
    const { screensharingEnabled } = this.modPage.settings || {};

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

  // R1 / T01: viewer (broadcaster_viewer) starts screenshare; moderator (observer_moderator) observes decoded frames
  async viewerCanStartScreenshare() {
    const { screensharingEnabled } = this.modPage.settings || {};
    if (!screensharingEnabled) {
      await this.userPage.wasRemoved(e.startScreenSharing, 'screenshare feature disabled');
      return;
    }
    // broadcaster_viewer starts screenshare
    await this.userPage.hasElement(e.startScreenSharing, 'viewer should see the start screenshare button');
    await startScreenshare(this.userPage);
    // stop button must be visibly rendered on the viewer's own page
    await expectVisiblyRendered(this.userPage.page, e.stopScreenSharing);
    // hold live state long enough for the recording to capture the active share
    await dwellOnBehavior(this.modPage.page, 'viewer screenshare visible for moderator', 4000);
    // observer_moderator must see the viewer stream decoding from their perspective
    await expectDecodedFrames(this.modPage.page, 'video[id^="screenshareVideo"]');
  }

  // R3 inverse / T15: with disableMultiScreenshare inactive a viewer share stays allowed
  // and reaches the moderator observer
  async viewerShareAllowedWithLockInactive() {
    const { screensharingEnabled } = this.modPage.settings || {};
    if (!screensharingEnabled) {
      await this.userPage.wasRemoved(e.startScreenSharing, 'screenshare feature disabled');
      return;
    }
    // viewer_broadcaster starts screenshare with disableMultiScreenshare=false (default - lock inactive)
    await this.userPage.hasElement(e.startScreenSharing, 'viewer should see start button when lock is inactive');
    await startScreenshare(this.userPage);
    // hold the allowed state for the recording
    await dwellOnBehavior(this.modPage.page, 'viewer share allowed - lock inactive', 4000);
    // moderator_observer must see the viewer stream decoding - confirms lock absence permits publishing
    await expectDecodedFrames(this.modPage.page, 'video[id^="screenshareVideo"]');
  }

  // R3: disableMultiScreenshare=true hides the button from locked viewers (API-param path)
  async viewerScreenshareLockedByApiParam() {
    const { screensharingEnabled } = this.modPage.settings || {};
    if (!screensharingEnabled) {
      await this.userPage.wasRemoved(e.startScreenSharing, 'screenshare feature disabled');
      return;
    }
    // With lockSettingsDisableMultiScreenshare=true and lockSettingsLockOnJoin=true,
    // the viewer is locked and disableMultiScreenshare is active.
    // The start screenshare button should not be visible.
    await this.userPage.wasRemoved(
      e.startScreenSharing,
      'viewer start screenshare button should be hidden when disableMultiScreenshare is active',
    );
  }

  // R3 / T03 UI-toggle path: moderator activates disableMultiScreenshare via lock-viewers panel,
  // viewer's share button disappears, moderator deactivates lock, viewer can share successfully
  async viewerScreenshareLockedByUiToggle() {
    const { screensharingEnabled } = this.modPage.settings || {};
    if (!screensharingEnabled) {
      await this.userPage.wasRemoved(e.startScreenSharing, 'screenshare feature disabled');
      return;
    }

    // viewer_target: start button must be visible when lock is inactive (default)
    await this.userPage.hasElement(
      e.startScreenSharing,
      'viewer start screenshare button should be visible when lock is inactive',
    );

    // moderator_controller: activate disableMultiScreenshare via lock-viewers UI.
    // lockScreenshare is checked=true when disableMultiScreenshare=false (allow).
    // Clicking it unchecks it, meaning disableMultiScreenshare=true (block viewers).
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClick(e.participantPermissionsTab);
    await this.modPage.waitAndClick(e.lockScreenshare);
    await this.modPage.waitAndClick(e.applyLockSettings);

    // dwell so the recording captures the locked state in the moderator's panel view
    await dwellOnBehavior(this.modPage.page, 'disableMultiScreenshare lock active via UI toggle', 4000);

    // viewer_target: start button must be removed from the DOM when lock is active
    await this.userPage.wasRemoved(
      e.startScreenSharing,
      'viewer start screenshare button must be hidden when disableMultiScreenshare is active via UI',
    );

    // moderator_controller: deactivate the lock (re-check = disableMultiScreenshare=false, allow viewers)
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClick(e.participantPermissionsTab);
    await this.modPage.waitAndClick(e.lockScreenshare);
    await this.modPage.waitAndClick(e.applyLockSettings);

    // dwell so the recording captures the unlocked state
    await dwellOnBehavior(this.modPage.page, 'disableMultiScreenshare lock deactivated - viewer share allowed', 4000);

    // viewer_target: can now start screenshare (lock is off)
    await startScreenshare(this.userPage);

    // dwell on the active share so the recording confirms the allowed path
    await dwellOnBehavior(this.modPage.page, 'viewer share active after lock deactivation', 4000);

    // moderator_controller: must observe decoded frames from the viewer's stream
    await expectDecodedFrames(this.modPage.page, 'video[id^="screenshareVideo"]');
  }

  // R14: Lock viewers UI shows the two new screenshare toggles
  async lockViewersUiHasScreenshareToggles() {
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClick(e.participantPermissionsTab);
    await this.modPage.hasElement(e.lockScreenshare, 'lock-viewers should have the disable multi-screenshare toggle');
    await this.modPage.hasElement(
      e.hideViewersScreenshare,
      'lock-viewers should have the hide viewers screenshare toggle',
    );
  }

  // R4: Three actors:
  //   broadcaster_moderator = modPage  (starts screenshare, must survive the lock)
  //   broadcaster_viewer    = userPage (starts screenshare, must be stopped by the lock)
  //   moderator_controller  = modPage2 (applies the lock, observes the outcome)
  async enableDisableMultiScreenshareStopsViewerShare() {
    const { screensharingEnabled } = this.modPage.settings || {};
    if (!screensharingEnabled) {
      await this.modPage.wasRemoved(e.startScreenSharing, 'screenshare feature disabled');
      await this.userPage.wasRemoved(e.startScreenSharing, 'screenshare feature disabled');
      return;
    }

    // broadcaster_moderator starts screenshare - this stream must survive the lock
    await startScreenshare(this.modPage);
    await this.modPage.hasElement(e.stopScreenSharing, 'broadcaster_moderator should be sharing');

    // Prove moderator stream is decoding on modPage2 before the viewer share starts
    await dwellOnBehavior(this.modPage2.page, 'broadcaster_moderator share active', 4000);
    await expectDecodedFrames(this.modPage2.page, 'video[id^="screenshareVideo"]');

    // broadcaster_viewer starts screenshare - this stream must be stopped by the lock
    await startScreenshare(this.userPage);
    await this.userPage.hasElement(e.stopScreenSharing, 'broadcaster_viewer should be sharing before lock');

    // Dwell on "both shares active" so the recording captures the simultaneity window
    await dwellOnBehavior(this.modPage2.page, 'both shares active before lock', 4000);

    // moderator_controller activates disableMultiScreenshare via lock-viewers panel
    await openLockViewers(this.modPage2);
    await this.modPage2.waitAndClick(e.participantPermissionsTab);
    // The lockScreenshare checkbox is checked=true when disableMultiScreenshare=false (allow).
    // Unchecking it means disallow (disableMultiScreenshare=true).
    await this.modPage2.waitAndClick(e.lockScreenshare);
    await this.modPage2.waitAndClick(e.applyLockSettings);

    // Dwell on lock-applied state so the recording shows the transition
    await dwellOnBehavior(this.modPage2.page, 'lock applied - broadcaster_viewer share stopping', 4000);

    // broadcaster_viewer screenshare must have been forcibly stopped server-side
    await this.userPage.wasRemoved(
      e.stopScreenSharing,
      'broadcaster_viewer screenshare must stop after moderator_controller enables disableMultiScreenshare',
    );

    // Dwell on "only moderator share remains" so the recording confirms the final state
    await dwellOnBehavior(this.modPage2.page, 'only broadcaster_moderator share active', 4000);

    // broadcaster_moderator stop button must still be visible, confirming the share is alive
    await this.modPage.hasElement(
      e.stopScreenSharing,
      'broadcaster_moderator screenshare must continue after lock is applied to viewers',
    );
  }

  // R2 / T02: Two screenshares active simultaneously; observer must see BOTH decoded streams.
  // Actors: broadcaster_moderator (modPage), broadcaster_viewer (userPage),
  //         observer_moderator (modPage2)
  //
  // Flow: broadcaster_moderator (presenter) starts first. broadcaster_viewer shares
  // concurrently as a non-presenter — this is permitted per R1.  Both broadcasters hold
  // their stop-button before the decisive observer check.
  //
  // Expected outcome on the current build: FAIL at the stabilityWindow assertion because the
  // HTML5 frontend renders a single <video id="screenshareVideo"> element; the observer DOM
  // can never hold 2 matching elements simultaneously, regardless of how many broadcasters share.
  async twoSharesActiveSide() {
    const { screensharingEnabled } = this.modPage.settings || {};
    if (!screensharingEnabled) return;

    // Step 2: broadcaster_moderator starts screenshare first.
    // observer_moderator confirms the first stream is decoding before the second share is added.
    await startScreenshare(this.modPage);
    await this.modPage.hasElement(e.stopScreenSharing, 'broadcaster_moderator should be sharing');
    await dwellOnBehavior(this.modPage2.page, 'first screenshare active - observer verifying initial stream', 2000);
    await expectDecodedFrames(this.modPage2.page, 'video[id^="screenshareVideo"]', 10, 2500);

    // Step 3: broadcaster_viewer starts a concurrent screenshare as a non-presenter.
    // Per R1, non-presenters may share.  Both stop-buttons must be visible confirming two
    // independent share sessions are live from the server's perspective.
    await startScreenshare(this.userPage);
    await this.userPage.hasElement(e.stopScreenSharing, 'broadcaster_viewer should be sharing concurrently');
    await this.modPage.hasElement(
      e.stopScreenSharing,
      'broadcaster_moderator share must coexist with broadcaster_viewer share',
    );

    // Dwell so the recording captures the "both sharing" window.
    await dwellOnBehavior(this.modPage2.page, 'both screenshares active simultaneously - observer perspective', 4000);

    // Step 4 (DECISIVE): observer_moderator MUST see exactly 2 decoded video elements.
    // The current frontend renders a single <video id="screenshareVideo"> DOM element;
    // there is no second video sink.  expectMultipleDecodedVideos will throw:
    //   "Expected 2 video elements matching 'video[id^="screenshareVideo"]', found 1"
    await stabilityWindow(this.modPage2.page, 3000, 500, async () => {
      await expectMultipleDecodedVideos(this.modPage2.page, 'video[id^="screenshareVideo"]', 2, 10, 2500);
      await expectVideosRenderedSideBySide(this.modPage2.page, 'video[id^="screenshareVideo"]', 2, 120);
    });

    // Step 5: broadcaster_moderator stops their share; broadcaster_viewer's share must survive.
    await this.modPage.waitAndClick(e.stopScreenSharing);
    await dwellOnBehavior(
      this.modPage2.page,
      'only broadcaster_viewer share active after first broadcaster stops',
      2000,
    );
    await expectDecodedFrames(this.modPage2.page, 'video[id^="screenshareVideo"]', 5, 2000);
  }

  // R14 / T14 regression: existing lock settings must still apply their effects after multi-screenshare changes.
  // Actors: moderator_controller (modPage), viewer_target (userPage)
  async lockViewersRegressionEffects() {
    // --- disableCam: viewer's join-video button must be disabled when lockShareWebcam is active ---
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClick(e.participantPermissionsTab);
    await this.modPage.waitAndClick(e.lockShareWebcam);
    await this.modPage.waitAndClick(e.applyLockSettings);

    await dwellOnBehavior(this.modPage.page, 'lockShareWebcam active - viewer joinVideo disabled', 4000);
    await this.userPage.hasElementDisabled(
      e.joinVideo,
      'join video button should be disabled when lockShareWebcam is active',
    );

    // --- lockPublicChat: viewer's public chat input must be disabled when lockPublicChat is active ---
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClick(e.participantPermissionsTab);
    await this.modPage.waitAndClick(e.lockPublicChat);
    await this.modPage.waitAndClick(e.applyLockSettings);

    await dwellOnBehavior(this.modPage.page, 'lockPublicChat active - viewer chatBox disabled', 4000);
    await this.userPage.hasElementDisabled(
      e.chatBox,
      'public chat input should be disabled when lockPublicChat is active',
    );
  }
}
