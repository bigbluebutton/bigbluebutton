const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { MultiUsers } = require('../user/multiusers');
const { snapshotComparison } = require('./util');
const { sleep } = require('../core/helpers');

class ShapeOptions extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
    this.referenceDrawnShape = `${e.wbDrawnShape} svg path`;
  }

  async duplicate() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);
    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    // draw a rectangle
    await this.modPage.waitAndClick(e.wbShapesButton);
    await this.modPage.waitAndClick(e.wbRectangleShape);
    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.page.mouse.up();
    // check if the rectangle was drawn
    await this.modPage.hasElement(e.wbDrawnShape);
    await this.userPage.hasElement(e.wbDrawnShape);
    // duplicate the rectangle by pressing Ctrl+D
    await this.modPage.press('Control+D');
    // check if the rectangle was duplicated
    await this.modPage.checkElementCount(e.wbDrawnShape, 2);
    await this.userPage.checkElementCount(e.wbDrawnShape, 2);
    await snapshotComparison(this.modPage, this.userPage, 'duplicate');
  }

  async rotate() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);
    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    // draw a rectangle
    await this.modPage.waitAndClick(e.wbShapesButton);
    await this.modPage.waitAndClick(e.wbRectangleShape);
    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.page.mouse.up();
    // rotate the rectangle
    await this.modPage.page.mouse.click(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.waitAndClick(e.wbOptions);
    await this.modPage.waitAndClick(e.wbRotate);
    await sleep(1000); // wait for the rotation to be applied
    await this.modPage.waitAndClick(e.wbRotate);
    await this.modPage.press('Escape');
    // check for the rotation
    await expect(
      await this.modPage.page.$eval(e.wbDrawnShape, e => getComputedStyle(e).transform),
      'should the shape be rotated 90 degrees',
    ).toContain('matrix(0, 1, -1, 0,');
    await snapshotComparison(this.modPage, this.userPage, 'rotate');
  }
}

exports.ShapeOptions = ShapeOptions;
