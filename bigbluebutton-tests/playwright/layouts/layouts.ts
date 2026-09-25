import { expect } from '@playwright/test';

import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';
import { checkDefaultLocationReset, checkScreenshots } from './util';

export class Layouts extends MultiUsers {
  async focusOnPresentation() {
    await this.modPage.waitAndClick(e.optionsButton);
    await this.modPage.waitAndClick(e.manageLayoutBtn);
    await this.modPage.waitAndClick(e.focusOnPresentation);
    await this.modPage.waitAndClick(e.updateLayoutBtn);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.toastContainer, 'should not display the toast container after closing all');

    await checkScreenshots(
      this,
      'should be the layout focus on presentation',
      [e.webcamContainer, e.webcamMirroredVideoContainer],
      'focus-on-presentation',
    );
  }

  async gridLayout() {
    await this.modPage.waitAndClick(e.optionsButton);
    await this.modPage.waitAndClick(e.manageLayoutBtn);
    await this.modPage.waitAndClick(e.focusOnVideo);
    await this.modPage.waitAndClick(e.updateLayoutBtn);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.toastContainer, 'should not display the toast container after closing all');

    await checkScreenshots(
      this,
      'should be the grid layout',
      [e.webcamContainer, e.webcamMirroredVideoContainer],
      'grid-layout',
    );
  }

  async smartLayout() {
    await this.modPage.waitAndClick(e.optionsButton);
    await this.modPage.waitAndClick(e.manageLayoutBtn);
    await this.modPage.waitAndClick(e.smartLayout);
    await this.modPage.waitAndClick(e.updateLayoutBtn);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.toastContainer, 'should not display the toast container after closing all');

    await checkScreenshots(
      this,
      'should the cameras be above the presentation',
      [e.webcamContainer, e.webcamMirroredVideoContainer],
      'smart-layout',
      1,
    );

    await this.modPage.waitAndClick(e.userListToggleBtn);
    await this.modPage.wasRemoved(e.chatButton, 'should not be displayed the chat button after opening the user list');
    await this.modPage.page.waitForTimeout(1000); // wait for the whiteboard zoom to stabilize

    await checkScreenshots(
      this,
      'should the cameras be on the side of presentation',
      [e.webcamContainer, e.webcamMirroredVideoContainer],
      'smart-layout',
      2,
    );
  }

  async customLayout() {
    await this.modPage.waitAndClick(e.optionsButton);
    await this.modPage.waitAndClick(e.manageLayoutBtn);
    await this.modPage.waitAndClick(e.customLayout);
    await this.modPage.waitAndClick(e.updateLayoutBtn);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.toastContainer, 'should not display the toast container after closing all');

    await checkScreenshots(this, 'should be on custom layout', 'video', 'custom-layout', 1);

    // checking the default location being reset when dropping into a non-available location
    await checkDefaultLocationReset(this.modPage);

    await this.modPage.dragAndDropWebcams(e.dropAreaSidebarBottom);
    await checkScreenshots(this, 'should be on custom layout', 'video', 'custom-layout', 2);

    await this.modPage.dragAndDropWebcams(e.dropAreaSidebarBottom);
    await checkScreenshots(this, 'should be on custom layout', 'video', 'custom-layout', 3);

    await this.modPage.waitAndClick(e.userListToggleBtn);
    await this.userPage.waitAndClick(e.userListToggleBtn);
    await this.modPage.wasRemoved(e.chatButton, 'should not be displayed the chat button');

    await checkScreenshots(this, 'should be on custom layout', 'video', 'custom-layout', 4);
  }

  async updateEveryone() {
    await this.modPage.waitAndClick(e.optionsButton);
    await this.modPage.waitAndClick(e.manageLayoutBtn);
    await this.modPage.waitAndClick(e.customLayout);
    await this.modPage.waitAndClickElement(e.updateEveryoneLayoutToggle);
    await this.modPage.waitAndClick(e.updateLayoutBtn);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.toastContainer, 'should not display the toast container after closing all');

    // Presenter minimizes presentation
    await this.modPage.waitAndClick(e.minimizePresentation);
    await this.modPage.wasRemoved(
      e.presentationContainer,
      'presentation should be minimized for the moderator after clicking the minimize button',
    );
    await this.modPage.hasElement(
      e.restorePresentation,
      'should have the presentation minimized and the restore presentation button should appear for the moderator',
    );
    await this.userPage.wasRemoved(
      e.presentationContainer,
      'presentation should be minimized for the attendee after the moderator clicks the minimize button',
    );
    await this.userPage.hasElement(
      e.restorePresentation,
      'presentation should be minimized and the restore presentation button should appear for the attendee after the moderator clicks the minimize button',
    );

    // Only the user restores presentation
    await this.userPage.waitAndClick(e.restorePresentation);
    await this.userPage.hasElement(
      e.presentationContainer,
      'restored presentation should be visible to the attendee after clicking the restore button',
    );
    await this.userPage.hasElement(
      e.minimizePresentation,
      'should appear the minimize presentation button for the attendee',
    );
    await this.modPage.wasRemoved(
      e.presentationContainer,
      'presentation should remain minimized for the moderator after the attendee clicks the restore button',
    );
    await this.modPage.hasElement(
      e.restorePresentation,
      'restore presentation button should remain visible for the moderator after the attendee clicks the restore button',
    );

    await this.modPage.waitAndClick(e.restorePresentation);
    await this.modPage.closeAllToastNotifications();

    // Drag and drop webcams to different locations
    await this.modPage.dragAndDropWebcams(e.dropAreaSidebarBottom);
    await checkScreenshots(
      this,
      'layout should be updated for everyone after dragging and dropping webcam in sidebar bottom dock area',
      'video',
      'update-everyone',
      1,
    );

    await this.modPage.dragAndDropWebcams(e.dropAreaRight);
    await checkScreenshots(
      this,
      'layout should be updated for everyone after dragging and dropping webcam in right dock area',
      'video',
      'update-everyone',
      2,
    );

    await this.modPage.dragAndDropWebcams(e.dropAreaBottom);
    await checkScreenshots(
      this,
      'layout should be updated for everyone after dragging and dropping webcam in bottom dock area',
      'video',
      'update-everyone',
      3,
    );

    await this.modPage.dragAndDropWebcams(e.dropAreaLeft);
    await checkScreenshots(
      this,
      'layout should be updated for everyone after dragging and dropping webcam in left dock area',
      'video',
      'update-everyone',
      4,
    );

    await this.modPage.dragAndDropWebcams(e.dropAreaTop);
    await checkScreenshots(
      this,
      'layout should be updated for everyone after dragging and dropping webcam in top dock area',
      'video',
      'update-everyone',
      5,
    );
  }

  async getNewPageTab() {
    return this.modPage.browser.newPage();
  }

  async videoPagination() {
    const pages = [];
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);

    await this.modPage.waitAndClick(e.optionsButton);
    await this.modPage.waitAndClick(e.manageLayoutBtn);
    await this.modPage.waitAndClick(e.focusOnPresentation);
    await this.modPage.waitAndClickElement(e.updateEveryoneLayoutToggle);
    await this.modPage.waitAndClick(e.updateLayoutBtn);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.toastContainer, 'should not display the toast container');

    for (let i = 1; i <= 5; i++) {
      const userName = `User-${i}`;
      const newPage = await this.getNewPageTab();
      const userPage = new Page(this.modPage.browser, newPage, this.modPage?.testInfo);
      await userPage.init(false, {
        fullName: userName,
        meetingId: this.modPage.meetingId,
        testInfo: this.modPage?.testInfo,
      });
      await userPage.waitForSelector(e.whiteboard);
      await userPage.shareWebcam();
      pages.push(userPage);
    }

    await this.modPage.hasElementCount(e.webcamVideoItem, 7, 'should display 7 webcams for the moderator');
    const nextPageVideoPaginationLocator = await this.modPage.page.locator(e.nextPageVideoPagination);
    await expect(
      nextPageVideoPaginationLocator,
      'should not display the next page button for the video pagination',
    ).toBeHidden();
    const previousPageVideoPaginationLocator = await this.modPage.page.locator(e.previousPageVideoPagination);
    await expect(
      previousPageVideoPaginationLocator,
      'should not display the previous page button for the video pagination',
    ).toBeHidden();

    await Promise.all(
      pages.map(async (page) => {
        await page.hasElement(
          e.nextPageVideoPagination,
          'should display the next page button for the video pagination',
        );
        await page.hasElement(
          e.previousPageVideoPagination,
          'should display the previous page button for the video pagination',
        );
      }),
    );
    await this.userPage.hasElementCount(e.webcamVideoItem, 6, 'should display 6 webcams for the attendee');
    await checkScreenshots(this, 'pagination should work for the attendees', 'video', 'pagination');
    await this.userPage.waitAndClick(e.nextPageVideoPagination);
    await this.userPage.hasElementCount(e.webcamVideoItem, 2, 'should display 2 webcams for the attendee');
    await checkScreenshots(this, 'pagination should work for the attendees', 'video', 'pagination-second-page');
  }

  private async attachPageVideos() {
    const testInfo = this.modPage.testInfo;
    if (!testInfo) return;

    // Register future video paths without closing anything — Playwright's fixture
    // teardown closes the context, which writes the .webm files, and the reporter
    // then finds them via these registered paths.
    const modVideoPath = await this.modPage.page.video()?.path();
    if (modVideoPath) {
      testInfo.attachments.push({ name: 'Moderator screen recording', contentType: 'video/webm', path: modVideoPath });
    }

    const userVideoPath = this.userPage ? await this.userPage.page.video()?.path() : undefined;
    if (userVideoPath) {
      testInfo.attachments.push({ name: 'Attendee screen recording', contentType: 'video/webm', path: userVideoPath });
    }
  }

  async unifiedLayoutMinimizeShowsTiles() {
    // Wait for the whiteboard canvas to confirm the presentation is fully loaded and
    // the minimize button is in an enabled/clickable state (isThereCurrentPresentation = true).
    await this.modPage.waitForSelector(e.whiteboard);

    await this.modPage.waitAndClick(e.minimizePresentation);
    // Allow the server round-trip that triggers the race condition (layout push → GraphQL
    // subscription → hasMeetingLayout: false→true → first useEffect re-fires) to settle.
    await this.modPage.page.waitForTimeout(3000);

    // Regression: the race condition reset presentationIsOpen=true for the presenter,
    // hiding the camera dock. The moderator must see the camera dock after minimize.
    await this.modPage.wasRemoved(
      e.presentationContainer,
      'presentation should remain hidden for moderator after the layout push settles in unified layout',
    );
    await this.modPage.hasElement(
      e.restorePresentation,
      'restore presentation button should be visible for moderator in unified layout after minimize',
    );
    await this.modPage.hasElement(
      e.cameraDock,
      'camera dock with participant tiles should be visible for moderator after minimizing in unified layout',
    );

    await this.attachPageVideos();
  }

  async unifiedLayoutRestoreClearsGridAvatars() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitAndClick(e.joinVideo);
    await this.userPage.waitAndClick(e.startSharingWebcam);
    await this.userPage.waitForSelector(e.leaveVideo);
    const extraAttendees: Page[] = [];
    for (let i = 2; i <= 9; i += 1) {
      const attendeePage = await this.context.newPage();
      const attendee = new Page(this.browser, attendeePage, this.modPage.testInfo);
      // eslint-disable-next-line no-await-in-loop
      await attendee.init(false, {
        fullName: `Attendee${i}`,
        meetingId: this.modPage.meetingId,
      });
      extraAttendees.push(attendee);
    }

    await this.modPage.waitAndClick(e.minimizePresentation);
    await this.modPage.hasElementCount(
      e.webcamVideoItem,
      10,
      'the minimized presentation should show all ten participants in the grid',
    );

    await this.modPage.waitAndClick(e.restorePresentation);
    await this.modPage.page.waitForTimeout(3000);
    await this.modPage.hasElementCount(
      e.webcamVideoItem,
      1,
      'restoring the presentation should remove stale grid avatars and keep the shared webcam',
    );
    await this.modPage.wasRemoved(
      `${e.webcamVideoItem}[data-video-type="grid"]`,
      'restoring the presentation should remove every grid avatar',
    );

    const [departingAttendee] = extraAttendees;
    await departingAttendee.logoutFromMeeting();
    await this.modPage.hasElementCount(
      e.webcamVideoItem,
      1,
      'a participant leaving while the presentation is open should not restore stale grid avatars',
    );

    const latePage = await this.context.newPage();
    const lateAttendee = new Page(this.browser, latePage, this.modPage.testInfo);
    await lateAttendee.init(false, {
      fullName: 'LateAttendee',
      meetingId: this.modPage.meetingId,
    });
    await this.modPage.hasElementCount(
      e.webcamVideoItem,
      1,
      'a participant joining while the presentation is open should not restore stale grid avatars',
    );

    await this.modPage.waitAndClick(e.minimizePresentation);
    await expect
      .poll(async () => this.modPage.page.locator(`${e.webcamVideoItem}:visible`).count(), {
        message: 'minimizing again should restore the participant grid',
      })
      .toBeGreaterThanOrEqual(9);
    await this.modPage.waitAndClick(e.restorePresentation);
    await this.modPage.page.waitForTimeout(3000);
    await this.modPage.hasElementCount(e.webcamVideoItem, 1, 'restoring again should keep only the shared webcam');

    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.joinMicrophone({ shouldUnmute: true });
    await this.modPage.hasElementCount(
      e.webcamVideoItem,
      2,
      'an audio-only speaking tile should remain next to the shared webcam over the open presentation',
    );

    await this.attachPageVideos();
  }
}
