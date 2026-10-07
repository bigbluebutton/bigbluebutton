import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';

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
}
