const { expect } = require('@playwright/test');
const Page = require('../core/page');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { MultiUsers } = require('../user/multiusers');

class DrawPencil extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async test() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.wbPencilShape);

    const wb = await this.modPage.page.$(e.whiteboard);
    const wbBox = await wb.boundingBox();
    const moveOptions = { steps: 50 }; // to slow down
    await this.modPage.page.mouse.move(wbBox.x + 0.2 * wbBox.width, wbBox.y + 0.2 * wbBox.height);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.4 * wbBox.width, wbBox.y + 0.4 * wbBox.height, moveOptions);
    await this.modPage.page.mouse.move(wbBox.x + 0.6 * wbBox.width, wbBox.y + 0.2 * wbBox.height, moveOptions);
    await this.modPage.page.mouse.move(wbBox.x + 0.8 * wbBox.width, wbBox.y + 0.4 * wbBox.height, moveOptions);
    await this.modPage.page.mouse.up();

    const clipObj = {
      x: wbBox.x,
      y: wbBox.y,
      width: wbBox.width,
      height: wbBox.height,
    };

    await expect(this.modPage.page).toHaveScreenshot('moderator1-pencil.png', {
      maxDiffPixels: 1000,
      clip: clipObj,
    });

    await expect(this.modPage2.page).toHaveScreenshot('moderator2-pencil.png', {
      maxDiffPixels: 1000,
      clip: clipObj,
    });
  }
}

exports.DrawPencil = DrawPencil;
