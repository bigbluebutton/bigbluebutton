const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { MultiUsers } = require('../user/multiusers');
const { constructClipObj } = require('../core/util');

class ChangeStyles extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async changingColor() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    const wbBox = await this.modPage.getElementBoundingBox(e.whiteboard);
    const clipObj = constructClipObj(wbBox);
    const screenshotOptions = {
      maxDiffPixelRatio: 0.05,
      clip: clipObj,
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

    await expect(this.modPage.page).toHaveScreenshot('moderator1-change-color.png', screenshotOptions);

    await expect(this.userPage.page).toHaveScreenshot('viewer-change-color.png', screenshotOptions);
  }

  async fillDrawing() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    const wbBox = await this.modPage.getElementBoundingBox(e.whiteboard);
    const clipObj = constructClipObj(wbBox);
    const screenshotOptions = {
      maxDiffPixelRatio: 0.05,
      clip: clipObj,
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

    await expect(this.modPage.page).toHaveScreenshot('moderator1-fill-drawing.png', screenshotOptions);

    await expect(this.userPage.page).toHaveScreenshot('viewer-fill-drawing.png', screenshotOptions);
  }

  async dashDrawing() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    const wbBox = await this.modPage.getElementBoundingBox(e.whiteboard);
    const clipObj = constructClipObj(wbBox);
    const screenshotOptions = {
      maxDiffPixelRatio: 0.05,
      clip: clipObj,
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

    await expect(this.modPage.page).toHaveScreenshot('moderator1-dash-drawing.png', screenshotOptions);

    await expect(this.userPage.page).toHaveScreenshot('viewer-dash-drawing.png', screenshotOptions);
  }

  async sizeDrawing() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    const wbBox = await this.modPage.getElementBoundingBox(e.whiteboard);
    const clipObj = constructClipObj(wbBox);
    const screenshotOptions = {
      maxDiffPixelRatio: 0.05,
      clip: clipObj,
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

    await expect(this.modPage.page).toHaveScreenshot('moderator1-size-drawing.png', screenshotOptions);

    await expect(this.userPage.page).toHaveScreenshot('viewer-size-drawing.png', screenshotOptions);
  }
}

exports.ChangeStyles = ChangeStyles;
