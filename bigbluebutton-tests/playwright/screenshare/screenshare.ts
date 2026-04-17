import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';
import { openLockViewers } from '../user/util';
import { startScreenshare } from './util';

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

  // R1: Viewer sees the start screenshare button and can share
  async viewerCanStartScreenshare() {
    const { screensharingEnabled } = this.modPage.settings || {};
    if (!screensharingEnabled) {
      await this.userPage.wasRemoved(e.startScreenSharing, 'screenshare feature disabled');
      return;
    }
    // The viewer should see the start button (multi-screenshare feature)
    await this.userPage.hasElement(e.startScreenSharing, 'viewer should see the start screenshare button');
    await startScreenshare(this.userPage);
    await this.userPage.hasElement(e.stopScreenSharing, 'viewer should see the stop screenshare button after starting');
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

  // R3+R4: Enable disableMultiScreenshare via UI while a viewer is already sharing
  async enableDisableMultiScreenshareStopsViewerShare() {
    const { screensharingEnabled } = this.modPage.settings || {};
    if (!screensharingEnabled) return;

    // Viewer starts screenshare first
    await startScreenshare(this.userPage);
    await this.userPage.hasElement(e.stopScreenSharing, 'viewer should be sharing before lock is applied');

    // Moderator opens lock viewers and enables disableMultiScreenshare
    await openLockViewers(this.modPage);
    await this.modPage.waitAndClick(e.participantPermissionsTab);
    // The lockScreenshare checkbox is checked=true when disableMultiScreenshare=false (meaning "allow").
    // Unchecking it means "disallow" (disableMultiScreenshare=true).
    await this.modPage.waitAndClick(e.lockScreenshare);
    await this.modPage.waitAndClick(e.applyLockSettings);

    // Viewer's screenshare should have been forcibly stopped by the server
    await this.userPage.wasRemoved(
      e.stopScreenSharing,
      'viewer screenshare should be stopped after moderator enables disableMultiScreenshare',
    );
  }
}
