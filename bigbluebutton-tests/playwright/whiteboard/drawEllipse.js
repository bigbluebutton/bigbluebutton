const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { MultiUsers } = require('../user/multiusers');
const CI = process.env.CI === 'true';

class DrawEllipse extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async test() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();

    await this.modPage.waitAndClick(e.wbShapesButton);
    await this.modPage.waitAndClick(e.wbEllipseShape);

    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.page.mouse.up();
    await this.modPage.hasElement(e.wbDrawnShape);

    if(CI) {
      await this.modPage.setHeightWidthViewPortSize();
      await this.userPage.setHeightWidthViewPortSize();
      await expect(modWbLocator).toHaveScreenshot('moderator-ellipse.png');
  
      const userWbLocator = this.userPage.getLocator(e.whiteboard);
      await expect(userWbLocator).toHaveScreenshot('viewer-ellipse.png');
    }
  }
}

exports.DrawEllipse = DrawEllipse;
