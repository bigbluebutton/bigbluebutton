const { expect } = require('@playwright/test');
const { MultiUsers } = require("../user/multiusers");
const Page = require('../core/page');
const e = require('../core/elements');
const { reopenChatSidebar, checkScreenshots, checkDefaultLocationReset } = require('./util');
const { sleep } = require("../core/helpers");

class Layouts extends MultiUsers {
  async focusOnPresentation() {
    await this.modPage.waitAndClick(e.optionsButton);
    await this.modPage.waitAndClick(e.manageLayoutBtn);
    await this.modPage.waitAndClick(e.focusOnPresentation);
    await this.modPage.waitAndClick(e.updateLayoutBtn);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.toastContainer);

    await checkScreenshots(this, 'should be the layout focus on presentation', [e.webcamContainer, e.webcamMirroredVideoContainer], 'focus-on-presentation');
  }

  async gridLayout() {
    await this.modPage.waitAndClick(e.optionsButton);
    await this.modPage.waitAndClick(e.manageLayoutBtn);
    await this.modPage.waitAndClick(e.focusOnVideo);
    await this.modPage.waitAndClick(e.updateLayoutBtn);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.toastContainer);

    await checkScreenshots(this, 'should be the grid layout', [e.webcamContainer, e.webcamMirroredVideoContainer], 'grid-layout');
  }

  async smartLayout() {
    await this.modPage.waitAndClick(e.optionsButton);
    await this.modPage.waitAndClick(e.manageLayoutBtn);
    await this.modPage.waitAndClick(e.smartLayout);
    await this.modPage.waitAndClick(e.updateLayoutBtn);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.toastContainer);

    await checkScreenshots(this, 'should the cameras be above the presentation', [e.webcamContainer, e.webcamMirroredVideoContainer], 'smart-layout', 1);

    await this.modPage.waitAndClick(e.userListToggleBtn);
    await this.modPage.wasRemoved(e.chatButton, '');
    await sleep(1000); // wait for the whiteboard zoom to stabilize

    await checkScreenshots(this, 'should the cameras be on the side of presentation', [e.webcamContainer, e.webcamMirroredVideoContainer], 'smart-layout', 2);
    await reopenChatSidebar(this.modPage);
  }

  async customLayout() {
    await this.modPage.waitAndClick(e.optionsButton);
    await this.modPage.waitAndClick(e.manageLayoutBtn);
    await this.modPage.waitAndClick(e.customLayout);
    await this.modPage.waitAndClick(e.updateLayoutBtn);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.toastContainer);

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
    await reopenChatSidebar(this.modPage);
  }

  async updateEveryone() {
    await this.modPage.waitAndClick(e.optionsButton);
    await this.modPage.waitAndClick(e.manageLayoutBtn);
    await this.modPage.waitAndClick(e.customLayout);
    await this.modPage.waitAndClickElement(e.updateEveryoneLayoutToggle);
    await this.modPage.waitAndClick(e.updateLayoutBtn);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.toastContainer);

    // Presenter minimizes presentation
    await this.modPage.waitAndClick(e.minimizePresentation);
    await this.modPage.wasRemoved(e.presentationContainer, 'should the presentation be minimized for the moderator');
    await this.modPage.hasElement(e.restorePresentation, 'should have the presentation minimized and the restore presentation button should appear for the moderator');
    await this.userPage.wasRemoved(e.presentationContainer, 'should the presentation be minimized for the attendee');
    await this.userPage.hasElement(e.restorePresentation, 'should the presentation be minimized and the restore presentation button should appear for the attendee');

    // Only the user restores presentation
    await this.userPage.waitAndClick(e.restorePresentation);
    await this.userPage.hasElement(e.presentationContainer, 'should display the restored presentation for the attendee');
    await this.userPage.hasElement(e.minimizePresentation, 'should appear the minimize presentation button for the attendee');
    await this.modPage.wasRemoved(e.presentationContainer, 'should the presentation be minimized for the moderator');
    await this.modPage.hasElement(e.restorePresentation, 'should be displayed the restore presentation button for the moderator');

    await this.modPage.waitAndClick(e.restorePresentation);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.dragAndDropWebcams(e.dropAreaSidebarBottom);

    await checkScreenshots(this, 'layout should be updated for everyone', 'video', 'update-everyone');
  }

  async getNewPageTab(browser) {
    return browser.newPage();
  }

  async videoPagination(browser) {
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
      const newPage = await this.getNewPageTab(browser);
      const userPage = new Page(browser, newPage);
      await userPage.init(false, true, { fullName: userName, meetingId: this.modPage.meetingId });
      await userPage.waitForSelector(e.whiteboard);
      await userPage.shareWebcam();
      pages.push(userPage);
    }

    await this.modPage.hasElementCount(e.webcamVideoItem, 7, 'should display 7 webcams for the moderator');
    const nextPageVideoPaginationLocator = await this.modPage.getLocator(e.nextPageVideoPagination);
    await expect(nextPageVideoPaginationLocator, 'should not display the next page button for the video pagination').toBeHidden();
    const previousPageVideoPaginationLocator = await this.modPage.getLocator(e.previousPageVideoPagination);
    await expect(previousPageVideoPaginationLocator, 'should not display the previous page button for the video pagination').toBeHidden();

    for (const page of pages) {
      await page.hasElement(e.nextPageVideoPagination, 'should display the next page button for the video pagination');
      await page.hasElement(e.previousPageVideoPagination, 'should display the previous page button for the video pagination');
    }
    await this.userPage.hasElementCount(e.webcamVideoItem, 6, 'should display 6 webcams for the attendee'); 
    await checkScreenshots(this, 'pagination should work for the attendees', 'video', 'pagination');
    await this.userPage.waitAndClick(e.nextPageVideoPagination);
    await this.userPage.hasElementCount(e.webcamVideoItem, 2, 'should display 2 webcams for the attendee');
    await checkScreenshots(this, 'pagination should work for the attendees', 'video', 'pagination-second-page');
  }
}

exports.Layouts = Layouts;
