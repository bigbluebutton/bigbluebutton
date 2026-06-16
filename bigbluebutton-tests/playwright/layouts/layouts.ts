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

    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.wasRemoved(e.sendButton, 'should not be displayed the chat button after opening the user list');
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
    await this.modPage.page.locator(e.webcamContainer).first().hover({ timeout: 5000 });
    await this.modPage.page.mouse.down();
    await this.modPage.page.locator(e.whiteboard).hover({ timeout: 5000 });
    // checking all dropAreas being displayed
    await this.modPage.hasElement(e.dropAreaBottom, 'should be displayed the bottom drop area');
    await this.modPage.hasElement(e.dropAreaLeft, 'should be displayed the left drop area');
    await this.modPage.hasElement(e.dropAreaRight, 'should be displayed the right drop area');
    await this.modPage.hasElement(e.dropAreaTop, 'should be displayed the top drop area');
    await this.modPage.hasElement(e.dropAreaSidebarBottom, 'should be displayed the sidebar bottom drop area');
    await this.modPage.page.mouse.up();
    await checkDefaultLocationReset(this.modPage);

    await this.modPage.dragAndDropWebcams(e.dropAreaSidebarBottom);
    await checkScreenshots(this, 'should be on custom layout', 'video', 'custom-layout', 2);

    await this.modPage.dragAndDropWebcams(e.dropAreaSidebarBottom);
    await checkScreenshots(this, 'should be on custom layout', 'video', 'custom-layout', 3);

    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.userPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.wasRemoved(e.sendButton, 'should not be displayed the chat button');

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
}
