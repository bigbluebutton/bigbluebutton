import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';

// Regression coverage for https://github.com/bigbluebutton/bigbluebutton/issues/25332
// A viewer with multi-user whiteboard access that is editing a shape used to crash the
// whiteboard with "Expected an editing shape!" when the presenter changed the slide
// mid-edit and the viewer then clicked the canvas.
const EDITING_SHAPE_ERROR = 'Expected an editing shape!';

export class SlideChangeWhileEditing extends MultiUsers {
  // toolSelector: the whiteboard tool to start editing with.
  // enterEditing: 'click' for the text tool (a single click creates the shape already in
  // editing mode), 'draw' for a geometric shape (drag to create, then double-click its label).
  async editingShapeDuringSlideChange(toolSelector: string, enterEditing: 'click' | 'draw') {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);

    // grant multi-user whiteboard access so the viewer can edit shapes
    await this.modPage.waitAndClick(e.multiUsersWhiteboardOn);
    await this.userPage.hasElement(
      e.wbToolbar,
      'should display the whiteboard toolbar for the viewer after multi-user access is granted',
    );

    // capture any uncaught client-side error thrown on the viewer page
    const pageErrors: Error[] = [];
    this.userPage.page.on('pageerror', (error) => pageErrors.push(error));

    const userWbLocator = this.userPage.page.locator(e.whiteboard);
    const wbBox = await userWbLocator.boundingBox();
    if (!wbBox) throw new Error('whiteboard boundingBox is null');

    const editX = wbBox.x + 0.4 * wbBox.width;
    const editY = wbBox.y + 0.4 * wbBox.height;

    // viewer starts editing a shape on slide 1 and stays mid-edit (no click away)
    await this.userPage.waitAndClick(toolSelector);
    if (enterEditing === 'draw') {
      await this.userPage.page.mouse.move(editX, editY);
      await this.userPage.page.mouse.down();
      await this.userPage.page.mouse.move(editX + 0.2 * wbBox.width, editY + 0.2 * wbBox.height);
      await this.userPage.page.mouse.up();
      // enter the shape label editing mode
      await this.userPage.page.mouse.dblclick(editX + 0.1 * wbBox.width, editY + 0.1 * wbBox.height);
    } else {
      await this.userPage.page.mouse.click(editX, editY);
    }
    await this.userPage.press('A');

    // presenter advances to slide 2 while the viewer is still editing
    await this.modPage.waitAndClick(e.nextSlide);
    await this.modPage.page.waitForTimeout(1000);

    // the click that used to crash the whiteboard for the viewer
    await this.userPage.page.mouse.click(wbBox.x + 0.6 * wbBox.width, wbBox.y + 0.6 * wbBox.height);
    await this.userPage.page.waitForTimeout(1000);

    // no editing-shape crash happened and the whiteboard stays mounted
    const crash = pageErrors.find((error) => error.message.includes(EDITING_SHAPE_ERROR));
    expect(crash, `should not throw "${EDITING_SHAPE_ERROR}" on the viewer page`).toBeUndefined();
    await this.userPage.hasElement(
      e.whiteboard,
      'should keep the whiteboard mounted for the viewer after the presenter changed slides mid-edit',
    );
  }
}
