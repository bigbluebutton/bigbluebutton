const { expect } = require('@playwright/test');
const Page = require('../core/page');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

class Draw extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async test() {
    await this.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.waitAndClick(e.wbShapesButton);
    await this.waitAndClick(e.wbRectangleShape);

    const shapes1 = await this.getOuterHtmlDrawn();

    const wbBox = await this.getElementBoundingBox(e.whiteboard);
    await this.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.page.mouse.down();
    await this.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.page.mouse.up();

    await this.waitForSelector(e.wbDrawnRectangle);
    const shapes2 = await this.getOuterHtmlDrawn();

    await expect(shapes1).not.toEqual(shapes2);
  }

  async getOuterHtmlDrawn() {
    return this.page.evaluate((selector) => document.querySelector(selector).outerHTML, e.wbLayer);
  }
}

exports.Draw = Draw;
