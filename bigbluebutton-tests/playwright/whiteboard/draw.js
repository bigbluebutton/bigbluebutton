const { expect } = require('@playwright/test');
const Page = require('../core/page');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const CI = process.env.CI === 'true';

class Draw extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async test() {
    await this.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.waitAndClick(e.wbRectangleShape);

    const modWbLocator = this.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    const screenshotOptions = {
      maxDiffPixels: 1000,
    };

    await this.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.page.mouse.down();
    await this.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.page.mouse.up();

    await this.hasElement(e.wbDrawnShape);

    if(!CI) {
      await this.setHeightWidthViewPortSize();
      await expect(modWbLocator).toHaveScreenshot('moderator-rect-ci.png', screenshotOptions);
    }
  }

  async getOuterHtmlDrawn() {
    return this.page.evaluate((selector) => document.querySelector(selector).outerHTML, e.wbLayer);
  }
}

exports.Draw = Draw;
