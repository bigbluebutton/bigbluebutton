const { MultiUsers } = require("../user/multiusers");
const e = require('../core/elements');
const { reopenChatSidebar, checkScreenshots } = require('./util');

class Layouts extends MultiUsers {
  async focusOnPresentation() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.layoutSettingsModalButton);
    await this.modPage.waitAndClick(e.focusOnPresentation);
    await this.modPage.waitAndClick(e.confirmButton);
    await this.modPage.waitAndClick(e.toastContainer);
    await this.modPage.wasRemoved(e.toastContainer);

    await checkScreenshots(this, e.webcamContainer, 'focus-on-presentation');
  }

  async focusOnVideo() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.layoutSettingsModalButton);
    await this.modPage.waitAndClick(e.focusOnVideo);
    await this.modPage.waitAndClick(e.confirmButton);
    await this.modPage.waitAndClick(e.toastContainer);
    await this.modPage.wasRemoved(e.toastContainer);

    await checkScreenshots(this, e.webcamContainer, 'focus-on-video');
  }

  async smartLayout() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.layoutSettingsModalButton);
    await this.modPage.waitAndClick(e.smartLayout);
    await this.modPage.waitAndClick(e.confirmButton);
    await this.modPage.waitAndClick(e.toastContainer);
    await this.modPage.wasRemoved(e.toastContainer);

    await checkScreenshots(this, e.webcamContainer, 'smart-layout', 1);

    await this.modPage.waitAndClick(e.userListToggleBtn);
    await this.modPage.wasRemoved(e.chatButton);

    await checkScreenshots(this, e.webcamContainer, 'smart-layout', 2);
    await reopenChatSidebar(this.modPage);
  }

  async customLayout() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.layoutSettingsModalButton);
    await this.modPage.waitAndClick(e.customLayout);
    await this.modPage.waitAndClick(e.confirmButton);
    await this.modPage.waitAndClick(e.toastContainer);
    await this.modPage.wasRemoved(e.toastContainer);

    await checkScreenshots(this, 'video', 'custom-layout', 1);

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
    await checkScreenshots(this, 'video', 'custom-layout', 2);

    await this.modPage.dragAndDropWebcams(e.dropAreaSidebarBottom);
    await checkScreenshots(this, 'video', 'custom-layout', 3);

    await this.modPage.waitAndClick(e.userListToggleBtn);
    await this.modPage.wasRemoved(e.chatButton);
    await this.modPage.wasRemoved(e.sendButton);

    await checkScreenshots(this, 'video', 'custom-layout', 4);
    await reopenChatSidebar(this.modPage);
  }

  async pushLayout() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.layoutSettingsModalButton);
    await this.modPage.waitAndClick(e.customLayout);
    await this.modPage.waitAndClickElement(e.pushLayoutToggle);
    await this.modPage.waitAndClick(e.confirmButton);
    await this.modPage.waitAndClick(e.toastContainer);
    await this.modPage.wasRemoved(e.toastContainer);

    // Presenter minimizes presentation
    await this.modPage.waitAndClick(e.minimizePresentation);
    await this.modPage.wasRemoved(e.presentationContainer);
    await this.modPage.hasElement(e.restorePresentation);
    await this.userPage.wasRemoved(e.presentationContainer);
    await this.userPage.hasElement(e.restorePresentation);

    // Only the user restores presentation
    await this.userPage.waitAndClick(e.restorePresentation);
    await this.userPage.hasElement(e.presentationContainer);
    await this.userPage.hasElement(e.minimizePresentation);
    await this.modPage.wasRemoved(e.presentationContainer);
    await this.modPage.hasElement(e.restorePresentation);

    await this.modPage.waitAndClick(e.restorePresentation);
    await this.modPage.dragAndDropWebcams(e.dropAreaSidebarBottom);

    await checkScreenshots(this, 'video', 'push-layout');
  }
}

exports.Layouts = Layouts;
