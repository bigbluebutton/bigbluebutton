const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { MultiUsers } = require('../user/multiusers');

class FocusOnPresentation extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async test() {
    await this.modPage.shareWebcam();
    await this.modPage2.shareWebcam();
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.layoutSettingsModalButton);
    await this.modPage.waitAndClick(e.focusOnPresentation);
    await this.modPage.waitAndClick(e.confirmButton);

    const modPageWebcamsLocator = this.modPage.getLocator(e.webcamContainer);
    await expect(this.modPage.page).toHaveScreenshot('moderator1-focus-on-presentation.png', {
      maxDiffPixels: 1000,
      mask: [modPageWebcamsLocator],
    });

    const modPage2WebcamsLocator = this.modPage2.getLocator(e.webcamContainer);
    await expect(this.modPage2.page).toHaveScreenshot('moderator2-focus-on-presentation.png', {
      maxDiffPixels: 1000,
      mask: [modPage2WebcamsLocator],
    });
  }
}

exports.FocusOnPresentation = FocusOnPresentation;
