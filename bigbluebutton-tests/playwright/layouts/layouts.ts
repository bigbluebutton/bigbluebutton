import { expect } from '@playwright/test';

import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';
import { checkDefaultLocationReset, checkScreenshots } from './util';

export class Layouts extends MultiUsers {
  async gridLayout() {
    await this.modPage.waitAndClick(e.minimizePresentation);

    await checkScreenshots(
      this,
      'should be the grid layout',
      [e.webcamContainer, e.webcamMirroredVideoContainer],
      'grid-layout',
    );
  }

  async customLayout() {
    await checkScreenshots(this, 'should be on custom layout', 'video', 'custom-layout', 1);

    // checking the default location being reset when dropping into a non-available location
    await checkDefaultLocationReset(this.modPage);

    await this.modPage.dragAndDropWebcams(e.dropAreaRight);
    await checkScreenshots(this, 'should be on custom layout', 'video', 'custom-layout', 2);

    await this.modPage.dragAndDropWebcams(e.dropAreaRight);
    await checkScreenshots(this, 'should be on custom layout', 'video', 'custom-layout', 3);

    await this.modPage.waitAndClick(e.userListToggleBtn);
    await this.userPage.waitAndClick(e.userListToggleBtn);
    await this.modPage.wasRemoved(e.chatButton, 'should not be displayed the chat button');

    await checkScreenshots(this, 'should be on custom layout', 'video', 'custom-layout', 4);
  }

  async updateEveryone() {
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
    await this.userPage.hasElementCount(e.webcamVideoItem, 5, 'should display 5 webcams for the attendee');
    await checkScreenshots(this, 'pagination should work for the attendees', 'video', 'pagination');
    await this.userPage.waitAndClick(e.nextPageVideoPagination);
    await this.userPage.hasElementCount(e.webcamVideoItem, 3, 'should display 3 webcams for the attendee');
    await checkScreenshots(this, 'pagination should work for the attendees', 'video', 'pagination-second-page');
  }
}
