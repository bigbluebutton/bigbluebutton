const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { MultiUsers } = require('../user/multiusers');
const { constructClipObj } = require('../core/util');

class DrawText extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async test() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    const wbBox = await this.modPage.getElementBoundingBox(e.whiteboard);
    const clipObj = constructClipObj(wbBox);
    const screenshotOptions = {
      maxDiffPixels: 1000,
      clip: clipObj,
    };

    await this.modPage.waitAndClick(e.wbTextShape);

    await this.modPage.page.mouse.click(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);

    await this.modPage.press('A');
    await this.modPage.press('A');
    await this.modPage.press('Backspace');
    await this.modPage.press('B');
    await this.modPage.page.mouse.click(wbBox.x + 0.6 * wbBox.width, wbBox.y + 0.6 * wbBox.height);

    await expect(this.modPage.page).toHaveScreenshot('moderator1-text.png', screenshotOptions);
    await expect(this.modPage2.page).toHaveScreenshot('moderator2-text.png', screenshotOptions);
  }
}

exports.DrawText = DrawText;
