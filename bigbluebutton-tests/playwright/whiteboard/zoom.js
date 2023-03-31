const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { MultiUsers } = require('../user/multiusers');
const { constructClipObj } = require('../core/util');

const defaultZoomLevel = '100%';
const zoomedInZoomLevel = '125%';
const maxZoomLevel = '400%';

class Zoom extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async test() {
    await this.modPage.waitForSelector(e.resetZoomButton, ELEMENT_WAIT_LONGER_TIME);

    const wbBox = await this.modPage.getElementBoundingBox(e.whiteboard);
    const clipObj = constructClipObj(wbBox);
    const screenshotOptions = {
      maxDiffPixels: 1000,
      clip: clipObj,
    };

    // 100%
    const zoomOutButtonLocator = await this.modPage.getLocator(e.zoomOutButton);
    await expect(zoomOutButtonLocator).toBeDisabled();
    const resetZoomButtonLocator = await this.modPage.getLocator(e.resetZoomButton);
    await expect(resetZoomButtonLocator).toContainText(defaultZoomLevel);

    // 125%
    await this.modPage.waitAndClick(e.zoomInButton);
    await expect(zoomOutButtonLocator).toBeEnabled();
    await expect(resetZoomButtonLocator).toContainText(zoomedInZoomLevel);
    await expect(this.modPage.page).toHaveScreenshot('moderator1-zoom125.png', screenshotOptions);
    await expect(this.modPage2.page).toHaveScreenshot('moderator2-zoom125.png', screenshotOptions);

    // max zoom
    for(let i = 125; i < 400; i += 25) {
      await this.modPage.waitAndClick(e.zoomInButton);
    }
    await expect(resetZoomButtonLocator).toContainText(maxZoomLevel);
    await expect(this.modPage.page).toHaveScreenshot('moderator1-zoom400.png', screenshotOptions);
    await expect(this.modPage2.page).toHaveScreenshot('moderator2-zoom400.png', screenshotOptions);
  }
}

exports.Zoom = Zoom;
