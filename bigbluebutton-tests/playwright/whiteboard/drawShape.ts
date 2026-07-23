import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';
import { snapshotComparison } from './util';

export class DrawShape extends MultiUsers {
  async drawShape(shapeSelector: string, shapeName: string, expectedShapeDrawn = e.wbDrawnShape) {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);
    // select the shape
    // shapes inside the "More" geo popup (data-testid="tools.more.*") need the popup opened first;
    // shapes that live directly on the toolbar (e.g. rectangle, arrow) must be clicked without it,
    // otherwise the opened popup grid overlaps and intercepts the click on the toolbar button
    if (shapeSelector.includes('tools.more.')) {
      await this.modPage.waitAndClick(e.wbShapesButton);
    }
    await this.modPage.waitAndClick(shapeSelector);
    await this.drawShapeMiddleSlide();
    // check if the ellipse is drawn
    await this.modPage.hasElement(
      expectedShapeDrawn,
      'should display the expected drawn shape on the whiteboard for the moderator',
    );
    await this.userPage.hasElement(
      expectedShapeDrawn,
      'should display the expected drawn shape on the whiteboard for the viewer',
    );
    await snapshotComparison(this.modPage, this.userPage, shapeName);
  }

  async drawShapeMiddleSlide() {
    const modWbLocator = this.modPage.page.locator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    if (!wbBox) throw new Error('whiteboard boundingBox is null');
    // draw the shape
    const moveOptions = { steps: 50 }; // to slow down
    await this.modPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height, moveOptions);
    await this.modPage.page.mouse.down();
    await this.modPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height, moveOptions);
    await this.modPage.page.mouse.up();
  }
}
