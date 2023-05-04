const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { MultiUsers } = require('../user/multiusers');

class RealTimeText extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async realTimeTextTyping() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    const screenshotOptions = {
      maxDiffPixelRatio: 0.05,
    };

    await this.modPage.waitAndClick(e.wbTextShape);
    await this.modPage.page.mouse.click(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.press('A');
    
    const userWbLocator = this.userPage.getLocator(e.whiteboard);
    await expect(modWbLocator).toHaveScreenshot('moderator-realtime-text.png', screenshotOptions);
    await expect(userWbLocator).toHaveScreenshot('viewer-realtime-text.png', screenshotOptions);

    await this.modPage.press('A');
    await this.modPage.page.mouse.click(wbBox.x + 0.6 * wbBox.width, wbBox.y + 0.6 * wbBox.height);

    await expect(modWbLocator).toHaveScreenshot('moderator-realtime-text-2.png', screenshotOptions);
    await expect(userWbLocator).toHaveScreenshot('viewer-realtime-text-2.png', screenshotOptions);
    await expect(modWbLocator).toHaveText('AA');
  }
}

exports.RealTimeText = RealTimeText;
