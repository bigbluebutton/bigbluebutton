const { expect } = require('@playwright/test');
const Page = require('../core/page');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { MultiUsers } = require('../user/multiusers');
const { constructClipObj } = require('../core/util');

class RedoDrawing extends MultiUsers {
  constructor(browser, page) {
    super(browser, page);
  }

  async test() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    const wbBox = await this.modPage.getElementBoundingBox(e.whiteboard);
    const clipObj = constructClipObj(wbBox);
    const screenshotOptions = {
      maxDiffPixels: 1000,
      clip: clipObj,
    };

    await this.modPage.waitAndClick(e.wbArrowShape);

    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.page.mouse.up();

    await this.modPage.waitAndClick(e.wbUndo);
    await this.modPage.waitAndClick(e.wbRedo);

    await expect(this.modPage.page).toHaveScreenshot('moderator1-redo-drawing.png', screenshotOptions);

    await expect(this.userPage.page).toHaveScreenshot('viewer-redo-drawing.png', screenshotOptions);
  }
}

exports.RedoDrawing = RedoDrawing;
