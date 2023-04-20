const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { MultiUsers } = require('../user/multiusers');

class DrawStickyNote extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async test() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    const screenshotOptions = {
      maxDiffPixels: 1000,
    };

    await this.modPage.waitAndClick(e.wbStickyNoteShape);

    await this.modPage.page.mouse.click(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);

    await this.modPage.press('A');
    await this.modPage.press('A');
    await this.modPage.press('Backspace');
    await this.modPage.press('B');
    await this.modPage.page.mouse.click(wbBox.x + 0.6 * wbBox.width, wbBox.y + 0.6 * wbBox.height);

    await this.modPage.hasText(e.wbTypedStickyNote, 'AB');
    await this.userPage.hasText(e.wbTypedStickyNote, 'AB');

    await expect(modWbLocator).toHaveScreenshot('moderator-sticky.png', screenshotOptions);
    const userWbLocator = this.userPage.getLocator(e.whiteboard);
    await expect(userWbLocator).toHaveScreenshot('viewer-sticky.png', screenshotOptions);
  }
}

exports.DrawStickyNote = DrawStickyNote;
