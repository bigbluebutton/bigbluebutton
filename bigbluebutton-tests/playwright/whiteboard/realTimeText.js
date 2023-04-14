const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { MultiUsers } = require('../user/multiusers');
const { constructClipObj } = require('../core/util');

class RealTimeText extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async realTimeTextTyping() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    const wbBox = await this.modPage.getElementBoundingBox(e.whiteboard);
    const clipObj = constructClipObj(wbBox);
    const screenshotOptions = {
      maxDiffPixelRatio: 0.05,
      clip: clipObj,
    };

    await this.modPage.waitAndClick(e.wbTextShape);

    await this.modPage.page.mouse.click(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);

    await this.modPage.press('A');
    
    await expect(this.modPage.page).toHaveScreenshot('moderator1-realtime-text.png', screenshotOptions);
    await expect(this.userPage.page).toHaveScreenshot('viewer-realtime-text.png', screenshotOptions);

    await this.modPage.press('A');
    await this.modPage.page.mouse.click(wbBox.x + 0.6 * wbBox.width, wbBox.y + 0.6 * wbBox.height);

    await expect(this.modPage.page).toHaveScreenshot('moderator1-realtime-text-2.png', screenshotOptions);
    await expect(this.userPage.page).toHaveScreenshot('viewer-realtime-text-2.png', screenshotOptions);

    const whiteboardLocator = await this.modPage.getLocator(e.whiteboard);
    await expect(whiteboardLocator).toHaveText('AA');
  }
}

exports.RealTimeText = RealTimeText;
