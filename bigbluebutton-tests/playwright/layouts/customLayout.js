const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { MultiUsers } = require('../user/multiusers');

class CustomLayout extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async test() {
    await this.modPage.shareWebcam();
    await this.userPage.shareWebcam();
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.layoutSettingsModalButton);
    await this.modPage.waitAndClick(e.customLayout);
    await this.modPage.waitAndClick(e.confirmButton);
    await this.modPage.waitAndClick(e.toastContainer);

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
  }
}

exports.CustomLayout = CustomLayout;
