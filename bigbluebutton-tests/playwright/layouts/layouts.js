const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { MultiUsers } = require("../user/multiusers");
const { reopenChatSidebar } = require('./util');

class Layouts extends MultiUsers {
  async focusOnPresentation() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.layoutSettingsModalButton);
    await this.modPage.waitAndClick(e.focusOnPresentation);
    await this.modPage.waitAndClick(e.confirmButton);

    const modPageWebcamsLocator = this.modPage.getLocator(e.webcamContainer);
    await expect(this.modPage.page).toHaveScreenshot('moderator-focus-on-presentation.png', {
      maxDiffPixels: 1000,
      mask: [modPageWebcamsLocator],
    });

    const userWebcamsLocator = this.userPage.getLocator(e.webcamContainer);
    await expect(this.userPage.page).toHaveScreenshot('user-focus-on-presentation.png', {
      maxDiffPixels: 1000,
      mask: [userWebcamsLocator],
    });
  }

  async focusOnVideo() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.layoutSettingsModalButton);
    await this.modPage.waitAndClick(e.focusOnVideo);
    await this.modPage.waitAndClick(e.confirmButton);

    const modPageWebcamsLocator = this.modPage.getLocator(e.webcamContainer);
    await expect(this.modPage.page).toHaveScreenshot('moderator-focus-on-video.png', {
      maxDiffPixels: 1000,
      mask: [modPageWebcamsLocator],
    });

    const userWebcamsLocator = this.userPage.getLocator(e.webcamContainer);
    await expect(this.userPage.page).toHaveScreenshot('user-focus-on-video.png', {
      maxDiffPixels: 1000,
      mask: [userWebcamsLocator],
    });
  }

  async smartLayout() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.layoutSettingsModalButton);
    await this.modPage.waitAndClick(e.smartLayout);
    await this.modPage.waitAndClick(e.confirmButton);
    await this.modPage.waitAndClick(e.toastContainer);
    await this.modPage.wasRemoved(e.toastContainer);

    const modVideoLocator = this.modPage.getLocator('video');
    await expect(this.modPage.page).toHaveScreenshot('moderator-smart-layout-1.png', {
      maxDiffPixelRatio: 0.005,
      mask: [modVideoLocator],
    });

    const userVideoLocator = this.userPage.getLocator('video');
    await expect(this.userPage.page).toHaveScreenshot('user-smart-layout-1.png', {
      maxDiffPixelRatio: 0.005,
      mask: [userVideoLocator],
    });

    await this.modPage.waitAndClick(e.userListToggleBtn);
    await this.modPage.wasRemoved(e.chatButton);

    await expect(this.modPage.page).toHaveScreenshot('moderator-smart-layout-2.png', {
      maxDiffPixelRatio: 0.005,
      mask: [modVideoLocator],
    });

    await expect(this.userPage.page).toHaveScreenshot('user-smart-layout-2.png', {
      maxDiffPixelRatio: 0.005,
      mask: [userVideoLocator],
    });

    await reopenChatSidebar(this.modPage);
  }

  async customLayout() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.layoutSettingsModalButton);
    await this.modPage.waitAndClick(e.customLayout);
    await this.modPage.waitAndClick(e.confirmButton);
    await this.modPage.waitAndClick(e.toastContainer);
    await this.modPage.wasRemoved(e.toastContainer);

    const modVideoLocator = this.modPage.getLocator('video');
    await expect(this.modPage.page).toHaveScreenshot('moderator-custom-layout-1.png', {
      maxDiffPixelRatio: 0.005,
      mask: [modVideoLocator],
    });

    const userVideoLocator = this.userPage.getLocator('video');
    await expect(this.userPage.page).toHaveScreenshot('user-custom-layout-1.png', {
      maxDiffPixelRatio: 0.005,
      mask: [userVideoLocator],
    });

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
    await expect(this.modPage.page).toHaveScreenshot('moderator-custom-layout-2.png', {
      maxDiffPixelRatio: 0.005,
      mask: [modVideoLocator],
    });

    await expect(this.modPage.page).toHaveScreenshot('user-custom-layout-2.png', {
      maxDiffPixelRatio: 0.005,
      mask: [modVideoLocator],
    });

    await this.modPage.dragAndDropWebcams(e.dropAreaSidebarBottom);
    await expect(this.modPage.page).toHaveScreenshot('moderator-custom-layout-3.png', {
      maxDiffPixelRatio: 0.005,
      mask: [modVideoLocator],
    });

    await expect(this.modPage.page).toHaveScreenshot('user-custom-layout-3.png', {
      maxDiffPixelRatio: 0.005,
      mask: [modVideoLocator],
    });

    await this.modPage.waitAndClick(e.userListToggleBtn);
    await this.modPage.wasRemoved(e.chatButton);
    await this.modPage.wasRemoved(e.sendButton);

    await expect(this.modPage.page).toHaveScreenshot('moderator-custom-layout-4.png', {
      maxDiffPixelRatio: 0.005,
    });

    await expect(this.modPage.page).toHaveScreenshot('user-custom-layout-4.png', {
      maxDiffPixelRatio: 0.005,
    });

    await reopenChatSidebar(this.modPage);
  }

  async pushLayout() {
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.layoutSettingsModalButton);
    await this.modPage.waitAndClick(e.customLayout);
    await this.modPage.waitAndClickElement(e.pushLayoutToggle);
    await this.modPage.waitAndClick(e.confirmButton);

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

    const modVideoLocator = this.modPage.getLocator('video');
    await expect(this.modPage.page).toHaveScreenshot('moderator-push-layout-1.png', {
      maxDiffPixelRatio: 0.005,
      mask: [modVideoLocator],
    });

    const userVideoLocator = this.userPage.getLocator('video');
    await expect(this.userPage.page).toHaveScreenshot('user-push-layout-1.png', {
      maxDiffPixelRatio: 0.005,
      mask: [userVideoLocator],
    });
  }
}

exports.Layouts = Layouts;
