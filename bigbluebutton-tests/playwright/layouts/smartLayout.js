const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { MultiUsers } = require('../user/multiusers');
const { sleep } = require('../core/helpers');

class SmartLayout extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async test() {
    await this.modPage.shareWebcam();
    await this.userPage.shareWebcam();
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
  }
}

exports.SmartLayout = SmartLayout;
