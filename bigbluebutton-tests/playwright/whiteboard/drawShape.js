const { MultiUsers } = require("../user/multiusers");
const { snapshotComparison } = require('./util');
const e = require('../core/elements');

class DrawShape extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async drawShape(shapeSelector, shapeName, expectedShapeDrawn = e.wbDrawnShape) {
    await this.drawShapeMiddleSlide(shapeSelector);
    // check if the ellipse is drawn
    await this.modPage.hasElement(expectedShapeDrawn);
    await this.userPage.hasElement(expectedShapeDrawn);
    await snapshotComparison(this.modPage, this.userPage, shapeName);
  }

  async drawShapeMiddleSlide(shapeSelector) {
    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    // select the shape
    await this.modPage.waitAndClick(e.wbShapesButton);
    await this.modPage.waitAndClick(shapeSelector);
    // draw the shape
    const moveOptions = { steps: 50 }; // to slow down
    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height, moveOptions);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height, moveOptions);
    await this.modPage.page.mouse.up();
  }
}

exports.DrawShape = DrawShape;
