const { MultiUsers } = require("../user/multiusers");
const { snapshotComparison } = require('./util');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require("../core/constants");

class DrawShape extends MultiUsers {
  async drawShape(shapeSelector, shapeName, expectedShapeDrawn = e.wbDrawnShape) {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);
    // select the shape
    await this.modPage.waitAndClick(e.wbShapesButton);
    await this.modPage.waitAndClick(shapeSelector);
    await this.drawShapeMiddleSlide();
    // check if the ellipse is drawn
    await this.modPage.hasElement(expectedShapeDrawn, 'should display the expected drawn shape on the whiteboard for the moderator');
    await this.userPage.hasElement(expectedShapeDrawn, 'should display the expected drawn shape on the whiteboard for the viewer');
    await snapshotComparison(this.modPage, this.userPage, shapeName);
  }

  async drawShapeMiddleSlide() {
    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    // draw the shape
    const moveOptions = { steps: 50 }; // to slow down
    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height, moveOptions);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height, moveOptions);
    await this.modPage.page.mouse.up();
  }
}

exports.DrawShape = DrawShape;
