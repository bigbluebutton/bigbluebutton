import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';
import { snapshotComparison } from './util';

export class ShapeOptions extends MultiUsers {
  async duplicate() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);
    const modWbLocator = this.modPage.page.locator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    if (!wbBox) throw new Error('whiteboard boundingBox is null');
    // draw a rectangle
    await this.modPage.waitAndClick(e.wbShapesButton);
    await this.modPage.waitAndClick(e.wbRectangleShape);
    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.modPage.page.mouse.up();
    // check if the rectangle was drawn
    await this.modPage.hasElement(e.wbDrawnShape, 'should display the drawn rectangle for the moderator');
    await this.userPage.hasElement(e.wbDrawnShape, 'should display the drawn rectangle for the viewer');
    // duplicate the rectangle by pressing Ctrl+D
    await this.modPage.press('Control+D');
    // check if the rectangle was duplicated
    await this.modPage.hasElementCount(e.wbDrawnShape, 2, 'should display the duplicated rectangle for the moderator');
    await this.userPage.hasElementCount(e.wbDrawnShape, 2, 'should display the duplicated rectangle for the viewer');
    await snapshotComparison(this.modPage, this.userPage, 'duplicate');
  }

  async rotate() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);
    const modWbLocator = this.modPage.page.locator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    if (!wbBox) throw new Error('whiteboard boundingBox is null');
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
    await this.modPage.page.waitForTimeout(1000); // wait for the rotation to be applied
    await this.modPage.waitAndClick(e.wbRotate);
    await this.modPage.press('Escape');
    // check for the rotation
    await expect(
      await this.modPage.page.$eval(e.wbDrawnShape, (element) => getComputedStyle(element).transform),
      'should the shape be rotated 90 degrees',
    ).toContain('matrix(0, 1, -1, 0,');
    await snapshotComparison(this.modPage, this.userPage, 'rotate');
  }
}
