import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { ClientSettingsOverrides, Page } from '../core/page';
import { checkNotificationText } from '../notifications/util';
import { MultiUsers } from '../user/multiusers';

// The packaged page sizes the scenario starts from, provisioned per meeting. Audio-only tiles
// are off so that a user left in audio can't take a camera slot.
export const CAMERA_PAGE_SIZE_CLIENT_SETTINGS_OVERRIDE: ClientSettingsOverrides = {
  public: {
    app: { defaultSettings: { application: { paginationEnabled: true } } },
    kurento: {
      cameraSortingModes: { showAudioOnlyOnFirstPage: false },
      pagination: {
        desktopPageSizes: { moderator: 0, viewer: 5 },
        layoutViewMaxPageSize: 12,
      },
      paginationThresholds: { enabled: false },
    },
  },
};

// More cameras than the meeting's page size, fewer than the attendees' configured 5.
export const WEBCAM_USERS = 3;
export const WEBCAM_GRID_DISABLED_PARAMETER = 'disabledFeatures=webcamGrid';
const MEETING_PAGE_SIZE = 2;

const cameras = (participant: Page) => participant.page.locator(e.webcamVideoList).locator(e.webcamStreamItem);

export class CameraPageSize extends MultiUsers {
  private async joinAttendee(name: string): Promise<Page> {
    const attendee = new Page(this.browser, await this.context.newPage(), this.modPage.testInfo);
    await attendee.init(false, { fullName: name, meetingId: this.modPage.meetingId });
    return attendee;
  }

  // The moderator lowers the page size with the slider. Every user, moderators included,
  // then pages the cameras by it, and so does a user who joins later.
  async setCameraPageSizeForEveryone(): Promise<void> {
    await this.userPage.wasRemoved(e.layoutViewButton, 'should not show the layout view button to attendees');

    for (let i = 1; i <= WEBCAM_USERS; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const attendee = await this.joinAttendee(`Webcam${i}`);
      // eslint-disable-next-line no-await-in-loop
      await attendee.shareWebcam();
    }
    await this.modPage.waitAndClick(e.minimizePresentation);
    await expect(cameras(this.userPage), 'the attendee should see every camera within the page size of 5').toHaveCount(
      WEBCAM_USERS,
      { timeout: ELEMENT_WAIT_LONGER_TIME },
    );
    await this.userPage.wasRemoved(e.nextPageVideoPagination, 'should not paginate the cameras yet');

    await this.modPage.waitAndClick(e.layoutViewButton);
    const slider = this.modPage.page.locator(e.cameraPageSizeSlider);
    await expect(slider, "the slider should start at the attendees' page size").toHaveValue('5');
    await expect(slider, 'the slider should end at layoutViewMaxPageSize').toHaveAttribute('max', '12');
    await slider.focus();
    await this.modPage.page.keyboard.press('Home');
    await this.modPage.page.keyboard.press('ArrowRight');
    await expect(slider, 'should set the page size with the keyboard').toHaveValue(String(MEETING_PAGE_SIZE));
    await checkNotificationText(this.modPage, e.layoutUpdateToast);
    await this.modPage.waitAndClick(e.closeLayoutViewPanel);
    await this.modPage.wasRemoved(e.layoutViewPanel, 'should close the layout view panel');

    await expect(cameras(this.userPage), 'the attendee should page the cameras by the meeting size').toHaveCount(
      MEETING_PAGE_SIZE,
      { timeout: ELEMENT_WAIT_LONGER_TIME },
    );
    await this.userPage.hasElement(e.nextPageVideoPagination, 'should let the attendee reach the other cameras');
    await expect(cameras(this.modPage), 'the moderator should no longer see every camera').toHaveCount(
      MEETING_PAGE_SIZE,
      { timeout: ELEMENT_WAIT_LONGER_TIME },
    );

    const lateAttendee = await this.joinAttendee('Late attendee');
    await expect(cameras(lateAttendee), 'a user who joins later should get the meeting size').toHaveCount(
      MEETING_PAGE_SIZE,
      { timeout: ELEMENT_WAIT_LONGER_TIME },
    );
    await lateAttendee.hasElement(e.nextPageVideoPagination, 'should let the late attendee reach the other cameras');
  }

  // The page size also applies to the cameras beside the presentation, so the Layout view
  // stays without the grid, with the slider only.
  async sliderWithoutWebcamGrid(): Promise<void> {
    await this.modPage.waitAndClick(e.layoutViewButton);
    await this.modPage.hasElement(e.cameraPageSizeSlider, 'should offer the camera page size without the grid');
    await this.modPage.wasRemoved(e.hideUsersWithoutCameraToggle, 'should not offer to hide users without the grid');
  }
}
