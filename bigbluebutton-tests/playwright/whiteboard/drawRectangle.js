const { expect } = require('@playwright/test');
const Page = require('../core/page');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { MultiUsers } = require('../user/multiusers');
const { clearNotificationIfPresent } = require('../notifications/util');

class DrawRectangle extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async test() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.wbShapesButton);
    await this.modPage.waitAndClick(e.wbRectangleShape);

    const wb = await this.modPage.page.$(e.whiteboard);
    const wbBox = await wb.boundingBox();
    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.page.mouse.up();

    await this.modPage.waitForSelector(e.wbDrawnRectangle);
    await clearNotificationIfPresent(this.modPage);
    await expect(this.modPage.page).toHaveScreenshot('moderator1-rectangle.png', { maxDiffPixels: 2000 });

    await this.modPage2.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await clearNotificationIfPresent(this.modPage2);
    await expect(this.modPage2.page).toHaveScreenshot('moderator2-rectangle.png', { maxDiffPixels: 2000 });
  }
}

exports.DrawRectangle = DrawRectangle;
