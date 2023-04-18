const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { MultiUsers } = require('../user/multiusers');

class ChangeStyles extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async changingColor() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    const screenshotOptions = {
      maxDiffPixelRatio: 0.05,
    };

    await this.modPage.waitAndClick(e.wbShapesButton);
    await this.modPage.waitAndClick(e.wbEllipseShape);

    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.page.mouse.up();

    await this.modPage.waitAndClick(e.wbStyles);
    await this.modPage.waitAndClick(e.wbColorRed);
    await this.modPage.waitAndClick(e.wbStyles);

    await expect(modWbLocator).toHaveScreenshot('moderator-change-color.png', screenshotOptions);

    const userWbLocator = this.userPage.getLocator(e.whiteboard);
    await expect(userWbLocator).toHaveScreenshot('viewer-change-color.png', screenshotOptions);
  }

  async fillDrawing() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    const screenshotOptions = {
      maxDiffPixelRatio: 0.05,
    };

    await this.modPage.waitAndClick(e.wbShapesButton);
    await this.modPage.waitAndClick(e.wbEllipseShape);

    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.page.mouse.up();

    await this.modPage.waitAndClick(e.wbStyles);
    await this.modPage.waitAndClick(e.wbFillDrawing);
    await this.modPage.press('Escape');

    await expect(modWbLocator).toHaveScreenshot('moderator-fill-drawing.png', screenshotOptions);

    const userWbLocator = this.userPage.getLocator(e.whiteboard);
    await expect(userWbLocator).toHaveScreenshot('viewer-fill-drawing.png', screenshotOptions);
  }

  async dashDrawing() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    const screenshotOptions = {
      maxDiffPixelRatio: 0.05,
    };

    await this.modPage.waitAndClick(e.wbShapesButton);
    await this.modPage.waitAndClick(e.wbEllipseShape);

    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.page.mouse.up();

    await this.modPage.waitAndClick(e.wbStyles);
    await this.modPage.waitAndClick(e.wbDashDotted);
    await this.modPage.waitAndClick(e.wbStyles);

    await expect(this.modPage.page).toHaveScreenshot('moderator-dash-drawing.png', screenshotOptions);

    const userWbLocator = this.userPage.getLocator(e.whiteboard);
    await expect(userWbLocator).toHaveScreenshot('viewer-dash-drawing.png', screenshotOptions);
  }

  async sizeDrawing() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    const screenshotOptions = {
      maxDiffPixelRatio: 0.05,
    };

    await this.modPage.waitAndClick(e.wbShapesButton);
    await this.modPage.waitAndClick(e.wbEllipseShape);

    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.page.mouse.up();

    await this.modPage.waitAndClick(e.wbStyles);
    await this.modPage.waitAndClick(e.wbSizeLarge);
    await this.modPage.waitAndClick(e.wbStyles);

    await expect(this.modPage.page).toHaveScreenshot('moderator-size-drawing.png', screenshotOptions);

    const userWbLocator = this.userPage.getLocator(e.whiteboard);
    await expect(userWbLocator).toHaveScreenshot('viewer-size-drawing.png', screenshotOptions);
  }
}

exports.ChangeStyles = ChangeStyles;
