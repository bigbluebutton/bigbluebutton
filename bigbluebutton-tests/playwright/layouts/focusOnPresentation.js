const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { MultiUsers } = require('../user/multiusers');

class FocusOnPresentation extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async test() {
    await this.modPage.shareWebcam();
    await this.userPage.shareWebcam();
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
}

exports.FocusOnPresentation = FocusOnPresentation;
