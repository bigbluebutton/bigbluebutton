const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { MultiUsers } = require('../user/multiusers');

class RedoDrawing extends MultiUsers {
  constructor(browser, page) {
    super(browser, page);
  }

  async test() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();

    await this.modPage.waitAndClick(e.wbArrowShape);

    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.page.mouse.up();

    await this.modPage.waitAndClick(e.wbUndo);
    await this.modPage.waitAndClick(e.wbRedo);

    await this.modPage.setHeightWidthViewPortSize();
    await this.userPage.setHeightWidthViewPortSize();

    await this.modPage.hasElement(e.wbDrawnArrow);
    await this.userPage.hasElement(e.wbDrawnArrow);
  }
}

exports.RedoDrawing = RedoDrawing;
