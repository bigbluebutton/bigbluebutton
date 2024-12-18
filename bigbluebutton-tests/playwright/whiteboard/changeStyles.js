const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { MultiUsers } = require('../user/multiusers');

class ChangeStyles extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async changingColor() {
    await this.drawEllipseShape();
    await this.modPage.waitAndClick(e.wbColorRed);
    await this.modPage.setHeightWidthViewPortSize();
    await this.userPage.setHeightWidthViewPortSize();

    await expect(this.modPage.page).toHaveScreenshot('moderator-change-color.png');

    const userWbLocator = this.userPage.getLocator(e.whiteboard);
    await expect(userWbLocator).toHaveScreenshot('viewer-change-color.png');
  }

  async fillDrawing() {
    await this.drawEllipseShape();
    await this.modPage.waitAndClick(e.wbFillDrawing);
    await this.modPage.press('Escape');

    await this.modPage.setHeightWidthViewPortSize();
    await this.userPage.setHeightWidthViewPortSize();

    await expect(this.modPage.page).toHaveScreenshot('moderator-fill-drawing.png');

    const userWbLocator = this.userPage.getLocator(e.whiteboard);
    await expect(userWbLocator).toHaveScreenshot('viewer-fill-drawing.png');
  }

  async dashDrawing() {
    await this.drawEllipseShape();
    await this.modPage.waitAndClick(e.wbDashDotted);

    await this.modPage.setHeightWidthViewPortSize();
    await this.userPage.setHeightWidthViewPortSize();

    await expect(this.modPage.page).toHaveScreenshot('moderator-dash-drawing.png');

    const userWbLocator = this.userPage.getLocator(e.whiteboard);
    await expect(userWbLocator).toHaveScreenshot('viewer-dash-drawing.png');
  }

  async sizeDrawing() {
    await this.drawEllipseShape();
    await this.modPage.waitAndClick(e.wbSizeLarge);

    await this.modPage.setHeightWidthViewPortSize();
    await this.userPage.setHeightWidthViewPortSize();
    
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
  }
}

exports.ChangeStyles = ChangeStyles;
