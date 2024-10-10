const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { MultiUsers } = require('../user/multiusers');
const { sleep } = require('../core/helpers');

class ShapeOptions extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async duplicate() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    const screenshotOptions = {
      maxDiffPixels: 1000,
    };

    await this.modPage.waitAndClick(e.wbShapesButton);
    await this.modPage.waitAndClick(e.wbRectangleShape);

    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.page.mouse.up();

    await this.modPage.page.mouse.click(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.waitAndClick(e.wbOptions);
    await this.modPage.waitAndClick(e.wbDuplicate);
    await this.modPage.waitAndClick(e.wbOptions);

    await this.modPage.checkElementCount(e.wbDrawnShape, 2);
    await this.userPage.checkElementCount(e.wbDrawnShape, 2);
  }

  async rotate() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    const screenshotOptions = {
      maxDiffPixels: 1000,
    };

    await this.modPage.waitAndClick(e.wbShapesButton);
    await this.modPage.waitAndClick(e.wbRectangleShape);

    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.page.mouse.up();

    await this.modPage.page.mouse.click(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.waitAndClick(e.wbOptions);
    await this.modPage.waitAndClick(e.wbRotate);
    await this.modPage.waitAndClick(e.wbOptions);

    await expect(modWbLocator).toHaveScreenshot('moderator-rotate.png', screenshotOptions);
    const userWbLocator = this.userPage.getLocator(e.whiteboard);
    await expect(userWbLocator).toHaveScreenshot('viewer-rotate.png', screenshotOptions);
  }

  async movingShape() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    const screenshotOptions = {
      maxDiffPixels: 1000,
    };
    
    // First rectangle
    await this.modPage.waitAndClick(e.wbShapesButton);
    await this.modPage.waitAndClick(e.wbRectangleShape);
    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.page.mouse.up();
    await this.modPage.page.mouse.click(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);

    // Second rectangle
    await this.modPage.waitAndClick(e.wbRectangleShape);
    await this.modPage.page.mouse.move(wbBox.x + 0.4 * wbBox.width, wbBox.y + 0.4 * wbBox.height);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.9 * wbBox.width, wbBox.y + 0.9 * wbBox.height);
    await this.modPage.page.mouse.up();
    await this.modPage.page.mouse.click(wbBox.x + 0.9 * wbBox.width, wbBox.y + 0.9 * wbBox.height);
    
    await this.modPage.waitAndClick(e.whiteboardStyles);
    await this.modPage.waitAndClick(e.wbFillDrawing);
    
    await this.modPage.waitAndClick(e.wbOptions);
    await this.modPage.waitAndClick(e.wbMoveBackward);
    await this.modPage.waitAndClick(e.wbOptions);
    
    await expect(modWbLocator).toHaveScreenshot('moderator-move-backward.png', screenshotOptions);
    const userWbLocator = this.userPage.getLocator(e.whiteboard);
    await expect(userWbLocator).toHaveScreenshot('viewer-move-backward.png', screenshotOptions);

    await this.modPage.waitAndClick(e.wbOptions);
    await this.modPage.waitAndClick(e.wbMoveForward);
    await this.modPage.waitAndClick(e.wbOptions);

    await expect(modWbLocator).toHaveScreenshot('moderator-move-forward.png', screenshotOptions);
    await expect(userWbLocator).toHaveScreenshot('viewer-move-forward.png', screenshotOptions);

    await this.modPage.waitAndClick(e.wbOptions);
    await this.modPage.waitAndClick(e.wbMoveBackward);
    await this.modPage.waitAndClick(e.wbMoveToFront);
    await this.modPage.waitAndClick(e.wbOptions);

    await expect(modWbLocator).toHaveScreenshot('moderator-move-to-front.png', screenshotOptions);
    await expect(userWbLocator).toHaveScreenshot('viewer-move-to-front.png', screenshotOptions);
  }  
}

exports.ShapeOptions = ShapeOptions;
