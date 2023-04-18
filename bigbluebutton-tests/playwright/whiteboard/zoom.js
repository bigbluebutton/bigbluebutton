const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { MultiUsers } = require('../user/multiusers');

const defaultZoomLevel = '100%';
const zoomedInZoomLevel = '125%';
const maxZoomLevel = '400%';

class Zoom extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async test() {
    await this.modPage.waitForSelector(e.resetZoomButton, ELEMENT_WAIT_LONGER_TIME);

    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const userWbLocator = this.userPage.getLocator(e.whiteboard);
    const screenshotOptions = {
      maxDiffPixels: 1000,
    };

    // 100%
    const zoomOutButtonLocator = this.modPage.getLocator(e.zoomOutButton);
    await expect(zoomOutButtonLocator).toBeDisabled();
    const resetZoomButtonLocator = this.modPage.getLocator(e.resetZoomButton);
    await expect(resetZoomButtonLocator).toContainText(defaultZoomLevel);

    // 125%
    await this.modPage.waitAndClick(e.zoomInButton);
    await expect(zoomOutButtonLocator).toBeEnabled();
    await expect(resetZoomButtonLocator).toContainText(zoomedInZoomLevel);
    await expect(modWbLocator).toHaveScreenshot('moderator-zoom125.png', screenshotOptions);
    await expect(userWbLocator).toHaveScreenshot('viewer-zoom125.png', screenshotOptions);

    // max zoom
    for(let i = 125; i < 400; i += 25) {
      await this.modPage.waitAndClick(e.zoomInButton);
    }
    await expect(resetZoomButtonLocator).toContainText(maxZoomLevel);
    await expect(modWbLocator).toHaveScreenshot('moderator-zoom400.png', screenshotOptions);
    await expect(userWbLocator).toHaveScreenshot('viewer-zoom400.png', screenshotOptions);
  }
}

exports.Zoom = Zoom;
