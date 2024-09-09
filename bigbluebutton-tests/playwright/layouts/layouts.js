const { MultiUsers } = require("../user/multiusers");
const e = require('../core/elements');
const { reopenChatSidebar, checkScreenshots } = require('./util');

class Layouts extends MultiUsers {
  async focusOnPresentation() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.manageLayoutBtn);
    await this.modPage.waitAndClick(e.focusOnPresentation);
    await this.modPage.waitAndClick(e.updateLayoutBtn);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.toastContainer);

    await checkScreenshots(this, 'should be the layout focus on presentation', e.webcamContainer, 'focus-on-presentation');
  }

  async gridLayout() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.manageLayoutBtn);
    await this.modPage.waitAndClick(e.focusOnVideo);
    await this.modPage.waitAndClick(e.updateLayoutBtn);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.toastContainer);

    await checkScreenshots(this, 'should be the grid layout', e.webcamContainer, 'grid-layout');
  }

  async smartLayout() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.manageLayoutBtn);
    await this.modPage.waitAndClick(e.smartLayout);
    await this.modPage.waitAndClick(e.updateLayoutBtn);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.toastContainer);

    await checkScreenshots(this, 'should the cameras be above the presentation', e.webcamContainer, 'smart-layout', 1);

    await this.modPage.waitAndClick(e.userListToggleBtn);
    await this.modPage.wasRemoved(e.chatButton, '');

    await checkScreenshots(this, 'should the cameras be on the side of presentation', e.webcamContainer, 'smart-layout', 2);
    await reopenChatSidebar(this.modPage);
  }

  async customLayout() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.manageLayoutBtn);
    await this.modPage.waitAndClick(e.customLayout);
    await this.modPage.waitAndClick(e.updateLayoutBtn);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.toastContainer);

    await checkScreenshots(this, 'should be on custom layout', 'video', 'custom-layout', 1);

    // checking the default location being reset when dropping into a non-available location
    await this.modPage.getLocator(e.webcamContainer).first().hover({ timeout: 5000 });
    await this.modPage.page.mouse.down();
    await this.modPage.getLocator(e.whiteboard).hover({ timeout: 5000 });
    
    // checking all dropAreas being displayed
    await this.modPage.hasElement(e.dropAreaBottom);
    await this.modPage.hasElement(e.dropAreaLeft);
    await this.modPage.hasElement(e.dropAreaRight);
    await this.modPage.hasElement(e.dropAreaTop);
    await this.modPage.hasElement(e.dropAreaSidebarBottom);
    await this.modPage.page.mouse.up();
    
    await this.modPage.dragAndDropWebcams(e.dropAreaSidebarBottom);
    await checkScreenshots(this, 'should be on custom layout', 'video', 'custom-layout', 2);

    await this.modPage.dragAndDropWebcams(e.dropAreaSidebarBottom);
    await checkScreenshots(this, 'should be on custom layout', 'video', 'custom-layout', 3);

    await this.modPage.waitAndClick(e.userListToggleBtn);
    await this.modPage.wasRemoved(e.chatButton, 'should not be displayed the chat button');
    await this.modPage.wasRemoved(e.sendButton, 'should not be displayed the send button');

    await checkScreenshots(this, 'should be on custom layout', 'video', 'custom-layout', 4);
    await reopenChatSidebar(this.modPage);
  }

  async updateEveryone() {
    await this.modPage.waitAndClick(e.actions);
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
    await this.modPage.dragAndDropWebcams(e.dropAreaSidebarBottom);

    await checkScreenshots(this, 'layout should be updated for everyone', 'video', 'update-everyone');
  }
}

exports.Layouts = Layouts;
