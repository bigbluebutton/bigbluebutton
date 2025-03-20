const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { DrawShape } = require('./drawShape');
const { snapshotComparison } = require('./util');

class ChangeStyles extends DrawShape {
  constructor(browser, context) {
    super(browser, context);
    this.referenceDrawnShape = `${e.wbDrawnShape} svg path`;
  }

  async changingColor() {
    await this.drawShape(e.wbEllipseShape, 'ellipse');
    // change the color of the shape
    await this.modPage.waitAndClick(e.whiteboardStyles);
    await this.modPage.waitAndClick(e.wbColorRed);
    await this.modPage.press('Escape');
    // check for the new shape color
    await expect(
      await this.modPage.page.$eval(this.referenceDrawnShape, e => getComputedStyle(e).stroke),
      'should the color of the shape be red',
    ).toBe('rgb(224, 49, 49)');
    await snapshotComparison(this.modPage, this.userPage, 'change-color');
  }

  async fillDrawing() {
    await this.drawShape(e.wbEllipseShape, 'ellipse');
    // fill the shape
    await this.modPage.waitAndClick(e.whiteboardStyles);
    await this.modPage.waitAndClick(e.wbFillDrawing);
    await this.modPage.press('Escape');
    // check for the filled shaped
    await expect(
      await this.modPage.page.$eval(this.referenceDrawnShape, e => getComputedStyle(e).fill),
      'should the inner color of the shape be gray',
    ).toBe('rgb(232, 232, 232)');
    await snapshotComparison(this.modPage, this.userPage, 'fill-drawing');
  }

  async dashDrawing() {
    await this.drawShape(e.wbEllipseShape, 'ellipse');
    // dash the shape
    await this.modPage.waitAndClick(e.whiteboardStyles);
    await this.modPage.waitAndClick(e.wbDashDotted);
    await this.modPage.press('Escape');
    // check for the dashed shape
    await expect(
      await this.modPage.page.$eval(this.referenceDrawnShape, e => getComputedStyle(e).strokeDasharray),
      'should the shape be dashed',
    ).not.toBe('none');
    await snapshotComparison(this.modPage, this.userPage, 'dash-drawing');
  }

  async sizeDrawing() {
    await this.drawEllipseShape();
    await this.modPage.waitAndClick(e.wbSizeLarge);
    await expect(this.modPage.page).toHaveScreenshot('moderator-size-drawing.png');

    const userWbLocator = this.userPage.getLocator(e.whiteboard);
    await expect(userWbLocator).toHaveScreenshot('viewer-size-drawing.png');
  }

  async drawEllipseShape() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();

    await this.modPage.waitAndClick(e.wbShapesButton);
    await this.modPage.waitAndClick(e.wbEllipseShape);

    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.page.mouse.up();

    await this.modPage.waitAndClick(e.whiteboardStyles);
    await this.modPage.waitAndClick(e.wbSizeLarge);
    await this.modPage.press('Escape');
    // check for the larger shape
    await expect(
      await this.modPage.page.$eval(this.referenceDrawnShape, e => getComputedStyle(e).strokeWidth),
      'should the shape be with a larger stroke',
    ).toBe('5px');
    await snapshotComparison(this.modPage, this.userPage, 'size-drawing');
  }
}

exports.ChangeStyles = ChangeStyles;
