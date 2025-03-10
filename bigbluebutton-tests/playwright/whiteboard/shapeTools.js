const { expect } = require('@playwright/test');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { MultiUsers } = require('../user/multiusers');
const { snapshotComparison } = require('./util');

class ShapeTools extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async pan() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);
    await this.modPage.waitForSelector(e.resetZoomButton);
    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    const zoomResetBtn = this.modPage.getLocator(e.resetZoomButton);
    // zoom in until 200%
    for(let i = 100; i < 200; i += 25) {
      const currentZoomLabel = await zoomResetBtn.textContent();
      await this.modPage.waitAndClick(e.zoomInButton);
      await expect(zoomResetBtn, 'reset zoom button label should change after clicking to zoom in').not.toContainText(currentZoomLabel);
    }
    // pan the whiteboard
    await this.modPage.waitAndClick(e.wbHandButton);
    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.page.mouse.up();
    // check if the whiteboard was panned
    await this.modPage.setHeightWidthViewPortSize();
    await this.userPage.setHeightWidthViewPortSize();
    await expect(this.modPage.page).toHaveScreenshot('moderator-pan.png', {
      mask: [this.modPage.getLocator(e.presentationTitle)],
      maxDiffPixels: 1000,
    });
    await expect(this.userPage.page).toHaveScreenshot('viewer-pan.png', {
      mask: [this.userPage.getLocator(e.presentationTitle)],
      maxDiffPixels: 1000,
    });
  }

  async eraser() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);
    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    // draw a line
    await this.modPage.waitAndClick(e.wbShapesButton);
    await this.modPage.waitAndClick(e.wbLineShape);
    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.page.mouse.up();
    // erase the line
    await this.modPage.waitAndClick(e.wbEraser);
    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.page.mouse.up();
    // check if the line was removed
    await this.modPage.wasRemoved(e.wbDrawnLine, 'should remove the drawn line for the moderator');
    await this.userPage.wasRemoved(e.wbDrawnLine, 'should remove the drawn line for the viewer');
    await snapshotComparison(this.modPage, this.userPage, 'eraser');
  }

  async delete() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);
    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    // draw an arrow
    await this.modPage.waitAndClick(e.wbArrowShape);
    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.page.mouse.up();
    // check existence of the drawn arrow
    await this.modPage.hasElement(e.wbDrawnArrow, 'should display the drawn shape for the moderator');
    await this.userPage.hasElement(e.wbDrawnArrow, 'should display the drawn shape for the viewer');
    // delete the drawn arrow by 'Delete' key
    await this.modPage.press('Delete');
    await this.modPage.wasRemoved(e.wbDrawnArrow, 'should delete the drawn shape for the moderator by pressing the "Delete" key');
    await this.userPage.wasRemoved(e.wbDrawnArrow, 'should delete the drawn shape for the viewer by pressing the "Delete" key');
    // draw another arrow
    await this.modPage.waitAndClick(e.wbArrowShape);
    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.page.mouse.up();
    // check existence of the new drawn arrow
    await this.modPage.hasElement(e.wbDrawnArrow, 'should display the new drawn shape for the moderator');
    await this.userPage.hasElement(e.wbDrawnArrow, 'should display the new drawn shape for the viewer');
    // delete the drawn arrow by 'Backspace' key
    await this.modPage.press('Backspace');
    await this.modPage.wasRemoved(e.wbDrawnArrow, 'should delete the drawn shape for the moderator by pressing the "Backspace" key');
    await this.userPage.wasRemoved(e.wbDrawnArrow, 'should delete the drawn shape for the viewer by pressing the "Backspace" key');
    await snapshotComparison(this.modPage, this.userPage, 'delete');
  }

  async undo() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);
    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    // draw an arrow
    await this.modPage.waitAndClick(e.wbArrowShape);
    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.page.mouse.up();
    // check if the arrow was drawn
    await this.modPage.hasElement(e.wbDrawnArrow, 'should display the drawn shape for the moderator');
    await this.userPage.hasElement(e.wbDrawnArrow, 'should display the drawn shape for the viewer');
    // undo the drawn arrow
    await this.modPage.page.keyboard.press('Control+Z');
    // check if the arrow was removed
    await this.modPage.wasRemoved(e.wbDrawnArrow, 'should remove the drawn shape for the moderator by pressing "Ctrl+Z"');
    await this.userPage.wasRemoved(e.wbDrawnArrow, 'should remove the drawn shape for the viewer by pressing "Ctrl+Z"');
    await snapshotComparison(this.modPage, this.userPage, 'undo');
  }

  async redo() {
    await this.undo();
    // redo the undone arrow
    await this.modPage.page.keyboard.press('Control+Shift+Z');
    // check if the arrow reappeared
    await this.modPage.hasElement(e.wbDrawnArrow, 'should display again the drawn shape for the moderator after redoing');
    await this.userPage.hasElement(e.wbDrawnArrow, 'should display again the drawn shape for the viewer after redoing');
    await snapshotComparison(this.modPage, this.userPage, 'redo');
  }
}

exports.ShapeTools = ShapeTools;
