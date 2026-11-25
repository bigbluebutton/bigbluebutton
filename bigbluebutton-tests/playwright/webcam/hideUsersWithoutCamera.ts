import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { checkNotificationText } from '../notifications/util';
import { MultiUsers } from '../user/multiusers';

export const HIDE_USERS_WITHOUT_CAMERA_PARAMETER = 'hideUsersWithoutCamera=true';
export const LAYOUT_VIEW_DISABLED_PARAMETER = 'disabledFeatures=layoutView';
// Longer than the client's 3 s delay before it restores the presentation.
const RESTORE_DELAY_WATCH_TIME = 5000;

export class HideUsersWithoutCamera extends MultiUsers {
  // Moderator shares a camera, the attendee doesn't. With the presentation
  // minimized (grid mode), the attendee sees the moderator's camera tile plus
  // their own avatar tile; the meeting-wide toggle hides avatar tiles for
  // everyone and keeps the camera tile.
  async hideAndRestoreUsersWithoutCamera(): Promise<void> {
    await this.userPage.wasRemoved(e.layoutViewButton, 'should not show the layout view button to attendees');

    await this.modPage.shareWebcam();
    // The presenter minimizing the presentation propagates grid mode to attendees.
    await this.modPage.waitAndClick(e.minimizePresentation);

    await this.userPage.hasElementCount(e.webcamStreamItem, 1, 'should show the moderator camera tile');
    await this.userPage.hasElementCount(e.webcamGridItem, 1, 'should show the attendee avatar tile before hiding');

    await this.modPage.waitAndClick(e.layoutViewButton);
    await this.modPage.hasElement(e.layoutViewPanel, 'should open the layout view panel');
    await this.modPage.hasElementNotChecked(e.hideUsersWithoutCameraToggle, 'should start with the toggle off');
    await this.modPage.page.locator(e.hideUsersWithoutCameraToggle).click();
    await this.modPage.hasElementChecked(e.hideUsersWithoutCameraToggle, 'should turn the toggle on');

    await this.userPage.wasRemoved(
      e.webcamGridItem,
      'should hide avatar tiles for the attendee',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.wasRemoved(
      e.webcamGridItem,
      'should hide avatar tiles for the moderator too',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.userPage.hasElementCount(e.webcamStreamItem, 1, 'should keep the camera tile visible');

    await this.modPage.page.locator(e.hideUsersWithoutCameraToggle).click();
    await this.userPage.hasElement(
      e.webcamGridItem,
      'should restore avatar tiles when turned off',
      ELEMENT_WAIT_LONGER_TIME,
    );

    await this.modPage.waitAndClick(e.closeLayoutViewPanel);
    await this.modPage.wasRemoved(e.layoutViewPanel, 'should close the layout view panel');
  }

  // Same scenario in a meeting created with hideUsersWithoutCamera=true: the
  // avatar tiles are hidden from the start, until the moderator turns it off.
  async startWithUsersWithoutCameraHidden(): Promise<void> {
    await this.modPage.shareWebcam();
    await this.modPage.waitAndClick(e.minimizePresentation);

    await this.userPage.hasElementCount(e.webcamStreamItem, 1, 'should show the moderator camera tile');
    await this.userPage.hasElementCount(e.webcamGridItem, 0, 'should start with avatar tiles hidden for the attendee');
    await this.modPage.hasElementCount(e.webcamGridItem, 0, 'should start with avatar tiles hidden for the moderator');

    await this.modPage.waitAndClick(e.layoutViewButton);
    await this.modPage.hasElementChecked(e.hideUsersWithoutCameraToggle, 'should start with the toggle on');
    await this.modPage.page.locator(e.hideUsersWithoutCameraToggle).click();
    await this.userPage.hasElement(
      e.webcamGridItem,
      'should show avatar tiles once turned off',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  // Nobody shares a camera, so the toggle would leave the minimized presentation over an
  // empty grid: it comes back for everyone instead. The second moderator, who isn't the
  // presenter, changes the option, so their toast can only be the option's confirmation.
  // Minimizing it again afterwards is respected.
  async restorePresentationWhenGridEmpties(): Promise<void> {
    await this.modPage.waitAndClick(e.minimizePresentation);
    await this.userPage.hasElement(e.restorePresentation, 'should minimize the presentation for the attendee');
    await this.userPage.hasElementCount(e.webcamGridItem, 3, 'should show the avatar tiles in the grid');

    await this.modPage2.waitAndClick(e.layoutViewButton);
    await this.modPage2.page.locator(e.hideUsersWithoutCameraToggle).click();
    await this.modPage2.hasElementChecked(e.hideUsersWithoutCameraToggle, 'should turn the toggle on');
    await checkNotificationText(this.modPage2, e.layoutUpdateToast);
    await this.modPage.hasElement(
      e.minimizePresentation,
      'should restore the presentation for the presenter',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.userPage.hasElement(
      e.minimizePresentation,
      'should restore the presentation for the attendee',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage2.waitAndClick(e.closeLayoutViewPanel);
    await this.modPage2.wasRemoved(e.layoutViewPanel, 'should close the layout view panel');

    await this.modPage.waitAndClick(e.minimizePresentation);
    await this.userPage.hasElement(e.restorePresentation, 'should minimize the presentation again for the attendee');
    // Past the restore delay, so a restore that this minimize started would have happened.
    await this.modPage.page.waitForTimeout(RESTORE_DELAY_WATCH_TIME);
    await this.modPage.hasElement(e.restorePresentation, 'should keep the presentation minimized for the presenter');
    await this.userPage.hasElement(e.restorePresentation, 'should keep the presentation minimized for the attendee');
    await this.userPage.hasElementCount(e.webcamGridItem, 0, 'should keep the avatar tiles hidden');
  }

  // In a meeting created with the option on, the moderator's camera fills the stage over
  // the minimized presentation. When it stops, the presentation comes back for everyone.
  async restorePresentationWhenLastCameraStops(): Promise<void> {
    await this.modPage.shareWebcam();
    await this.modPage.waitAndClick(e.minimizePresentation);
    await this.userPage.hasElement(e.restorePresentation, 'should minimize the presentation for the attendee');
    await this.userPage.hasElementCount(e.webcamStreamItem, 1, 'should show the moderator camera tile');

    await this.modPage.waitAndClick(e.leaveVideo);
    await this.userPage.hasElement(
      e.minimizePresentation,
      'should restore the presentation for the attendee once the last camera stops',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.hasElement(
      e.minimizePresentation,
      'should restore the presentation for the moderator once the last camera stops',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  // With disabledFeatures=layoutView the button is gone for moderators, while
  // the grid itself keeps the attendee's avatar tile.
  async layoutViewDisabled(): Promise<void> {
    await this.modPage.shareWebcam();
    await this.modPage.waitAndClick(e.minimizePresentation);

    await this.userPage.hasElementCount(e.webcamGridItem, 1, 'should keep the attendee avatar tile in the grid');
    await this.modPage.wasRemoved(e.layoutViewButton, 'should not show the layout view button to moderators');
  }
}
