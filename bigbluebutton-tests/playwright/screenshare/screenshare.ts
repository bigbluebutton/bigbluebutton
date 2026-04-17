import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';
import { openLockViewers } from '../user/util';
import { dwellOnBehavior, expectDecodedFrames, expectVisiblyRendered, startScreenshare } from './util';

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

  // R3: disableMultiScreenshare=true hides the button from locked viewers
  async viewerScreenshareLockedByApiParam() {
    // With lockSettingsDisableMultiScreenshare=true and lockOnJoin=true,
    // the viewer is locked and disableMultiScreenshare is active.
    // The start screenshare button should not be visible.
    await this.userPage.wasRemoved(
      e.startScreenSharing,
      'viewer start screenshare button should be hidden when disableMultiScreenshare is active',
    );
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
    if (!screensharingEnabled) return;

    // broadcaster_moderator starts screenshare - this stream must survive the lock
    await startScreenshare(this.modPage);
    await this.modPage.hasElement(e.stopScreenSharing, 'broadcaster_moderator should be sharing');

    // broadcaster_viewer starts screenshare - this stream must be stopped by the lock
    await startScreenshare(this.userPage);
    await this.userPage.hasElement(e.stopScreenSharing, 'broadcaster_viewer should be sharing before lock');

    // Dwell on "both shares active" so the recording captures the simultaneity window
    await dwellOnBehavior(this.modPage2.page, 'both shares active before lock', 4000);

    // Prove both streams are visible and decoding from moderator_controller perspective
    await expectDecodedFrames(this.modPage2.page, 'video[id^="screenshareVideo"]');

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

    // broadcaster_moderator stream must still be decoding after the lock was applied
    await expectDecodedFrames(this.modPage2.page, 'video[id^="screenshareVideo"]');

    // broadcaster_moderator stop button must still be visible, confirming the share is alive
    await this.modPage.hasElement(
      e.stopScreenSharing,
      'broadcaster_moderator screenshare must continue after lock is applied to viewers',
    );
  }
}
