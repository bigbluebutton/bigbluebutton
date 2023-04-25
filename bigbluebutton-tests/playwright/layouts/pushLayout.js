const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { MultiUsers } = require('../user/multiusers');

class PushLayout extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async test() {
    await this.modPage.shareWebcam();
    await this.userPage.shareWebcam();
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

exports.PushLayout = PushLayout;
