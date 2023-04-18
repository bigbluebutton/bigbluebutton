const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { MultiUsers } = require('../user/multiusers');

class UndoDrawing extends MultiUsers {
  constructor(browser, page) {
    super(browser, page);
  }

  async test() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    const screenshotOptions = {
      maxDiffPixelRatio: 0.05,
    };

    await this.modPage.waitAndClick(e.wbArrowShape);

    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.page.mouse.up();

    await this.modPage.waitAndClick(e.wbUndo);

    await expect(modWbLocator).toHaveScreenshot('moderator-undo-drawing.png', screenshotOptions);

    const userWbLocator = this.userPage.getLocator(e.whiteboard);
    await expect(userWbLocator).toHaveScreenshot('viewer-undo-drawing.png', screenshotOptions);
  }
}

exports.UndoDrawing = UndoDrawing;
