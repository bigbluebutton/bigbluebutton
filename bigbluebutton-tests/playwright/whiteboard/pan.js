const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { MultiUsers } = require('../user/multiusers');

class Pan extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async test() {
    await this.modPage.waitForSelector(e.resetZoomButton, ELEMENT_WAIT_LONGER_TIME);

    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    const screenshotOptions = {
      maxDiffPixels: 1000,
    };
    const zoomResetBtn = this.modPage.getLocator(e.resetZoomButton);

    for(let i = 100; i < 200; i += 25) {
      const currentZoomLabel = await zoomResetBtn.textContent();
      await this.modPage.waitAndClick(e.zoomInButton);
      await expect(zoomResetBtn, 'reset zoom button label should change after clicking to zoom in').not.toContainText(currentZoomLabel);
    }

    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.page.mouse.up();

    await expect(modWbLocator).toHaveScreenshot('moderator-pan.png', screenshotOptions);

    const userWbLocator = this.userPage.getLocator(e.whiteboard);
    await expect(userWbLocator).toHaveScreenshot('viewer-pan.png', screenshotOptions);
  }
}

exports.Pan = Pan;
