import { BrowserContext, expect, TestInfo } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';

export class EditedShapeRemoved extends MultiUsers {
  viewerPageErrors: string[] = [];

  viewerSubmitDelayMs = 0;

  // Joins the viewer through a proxy of its GraphQL socket that holds its annotation
  // submits back for `viewerSubmitDelayMs`, as on a slow connection: the viewer's new
  // shape then exists locally before the server has it.
  async initUserPageWithSlowSubmits(context: BrowserContext, testInfo: TestInfo, submitDelayMs: number) {
    this.viewerSubmitDelayMs = submitDelayMs;
    const page = await context.newPage();
    await page.routeWebSocket('**/graphql', (pageSide) => {
      const serverSide = pageSide.connectToServer();
      pageSide.onMessage((message) => {
        if (typeof message === 'string' && message.includes('PresAnnotationSubmit')) {
          setTimeout(() => {
            try {
              serverSide.send(message);
            } catch {
              // the socket closed while the message was held
            }
          }, this.viewerSubmitDelayMs);
          return;
        }
        serverSide.send(message);
      });
    });
    this.userPage = new Page(this.browser, page, testInfo);
    await this.userPage.init(false, { fullName: 'Attendee', meetingId: this.modPage.meetingId, testInfo });
  }

  private async prepare() {
    this.userPage.page.on('pageerror', (err) => this.viewerPageErrors.push(err.message));
    await this.modPage.hasElement(
      e.whiteboard,
      'should display the whiteboard for the presenter',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.userPage.hasElement(e.whiteboard, 'should display the whiteboard for the viewer');
  }

  // Leaves the viewer in the middle of editing a new text shape.
  private async viewerStartsTyping() {
    await this.userPage.waitAndClick(e.wbTextShape);
    const wbBox = await this.userPage.getElementBoundingBox(e.whiteboard);
    if (!wbBox) throw new Error('whiteboard boundingBox is null');
    await this.userPage.page.mouse.click(wbBox.x + 0.4 * wbBox.width, wbBox.y + 0.4 * wbBox.height);
    await this.userPage.page.keyboard.type('Hello');
    await this.userPage.hasElement(e.wbTextTrue, 'viewer should have a text shape with content');
    await this.userPage.hasElement(e.wbEditingTextArea, 'viewer should be editing the text shape');
  }

  // The viewer's next pointer-downs on the canvas are where a dangling edit throws
  // "Expected an editing shape!" and the error boundary replaces the client.
  private async viewerKeepsWorking() {
    const wbBox = await this.userPage.getElementBoundingBox(e.whiteboard);
    if (!wbBox) throw new Error('whiteboard boundingBox is null');
    for (const [fx, fy] of [
      [0.5, 0.5],
      [0.4, 0.4],
    ]) {
      await this.userPage.page.mouse.click(wbBox.x + fx * wbBox.width, wbBox.y + fy * wbBox.height);
      await this.userPage.page.waitForTimeout(500);
    }
    const editingShapeErrors = this.viewerPageErrors.filter((m) => /Expected an editing shape/i.test(m));
    expect(
      editingShapeErrors,
      `viewer must not throw "Expected an editing shape!" (got: ${editingShapeErrors.join(' | ')})`,
    ).toHaveLength(0);
    await this.userPage.hasElement(e.whiteboard, 'whiteboard should still be mounted on the viewer');
  }

  async presenterDeletesTextBeingEdited() {
    await this.prepare();
    await this.modPage.waitAndClick(e.multiUsersWhiteboardOn);
    await this.viewerStartsTyping();
    await this.modPage.hasElement(e.wbTextTrue, 'presenter should see the text the viewer is typing');

    await this.modPage.waitAndClick(e.wbSelectTool);
    await this.modPage.press('ControlOrMeta+a');
    await this.modPage.press('Delete');
    await this.modPage.wasRemoved(e.wbTextTrue, 'presenter should have deleted the text');
    await this.userPage.wasRemoved(e.wbTextTrue, 'the deletion should reach the viewer');

    await this.viewerKeepsWorking();
  }

  async newTextSurvivesAccessGrant() {
    await this.prepare();
    // The viewer starts typing right after the grant, before the client's sync of the
    // page annotations (750 ms after an access change) has run.
    await this.modPage.waitAndClick(e.multiUsersWhiteboardOn);
    await this.viewerStartsTyping();
    await this.userPage.page.waitForTimeout(this.viewerSubmitDelayMs + 1000);

    // The held submit lands eventually and the server's copy comes back, so the text
    // being visible is not enough: the edit itself must have survived the sync.
    await this.userPage.hasElement(e.wbEditingTextArea, 'the viewer should still be editing the new text');
    await this.userPage.hasElement(e.wbTextTrue, "the viewer's new text should still be there");
    await this.modPage.hasElement(e.wbTextTrue, "presenter should receive the viewer's text");
    await this.viewerKeepsWorking();
  }
}
