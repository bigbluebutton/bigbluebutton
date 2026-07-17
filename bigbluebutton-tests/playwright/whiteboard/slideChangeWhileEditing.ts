import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';

export class SlideChangeWhileEditing extends MultiUsers {
  // Regression test for issue 25332.
  // A viewer editing a whiteboard text shape used to crash the client with
  // "Expected an editing shape!" when the presenter changed the slide while the
  // viewer was still mid-edit: the slide-change effect mutated the tldraw store
  // (removing the shape being edited) without first taking the editor out of the
  // select.editing_shape state, so the viewer's next pointer-down hit tldraw's
  // editing-shape assertion and tripped the error boundary.
  async crashOnSlideChangeWhileEditing() {
    // The viewer is the page that crashed, so watch it for uncaught errors.
    const viewerPageErrors: string[] = [];
    this.userPage.page.on('pageerror', (err) => viewerPageErrors.push(err.message));

    await this.modPage.hasElement(
      e.whiteboard,
      'should display the whiteboard for the presenter',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.userPage.hasElement(e.whiteboard, 'should display the whiteboard for the viewer');
    // Changing slides requires a deck with at least two slides; the default
    // presentation provides them (same assumption as the skipSlide test).
    await this.modPage.hasElement(e.nextSlide, 'should display the next-slide control (deck has >= 2 slides)');

    // Presenter grants multi-user whiteboard so the viewer can draw.
    await this.modPage.waitAndClick(e.multiUsersWhiteboardOn);

    // Viewer enters select.editing_shape: pick the text tool, click the canvas and
    // type some text. Do NOT click away or press Escape/Enter - that would commit
    // the edit and leave editing_shape, defeating the precondition.
    await this.userPage.waitAndClick(e.wbTextShape);
    const wbBox = await this.userPage.page.locator(e.whiteboard).boundingBox();
    if (!wbBox) throw new Error('whiteboard boundingBox is null');
    const textX = wbBox.x + 0.4 * wbBox.width;
    const textY = wbBox.y + 0.4 * wbBox.height;
    await this.userPage.page.mouse.click(textX, textY);
    await this.userPage.page.waitForTimeout(300);
    await this.userPage.page.keyboard.type('Hello');

    // Deterministic precondition: the text shape exists (wbTextTrue) AND the editor
    // is actively editing it (tldraw only renders the editing textarea while
    // isEditing is true). Asserting both avoids racing the slide change against an
    // edit that has not actually entered editing_shape yet.
    await this.userPage.hasElement(e.wbTextTrue, 'viewer should have a text shape with content');
    await this.userPage.hasElement(e.wbEditingTextArea, 'viewer should be actively editing the text shape');

    // The race: presenter advances the slide while the viewer is mid-edit. Give the
    // slide-change effect time to run on the viewer (it mutates the tldraw store).
    await this.modPage.waitAndClick(e.nextSlide);
    await this.userPage.page.waitForTimeout(2500);

    // The viewer's next pointer-down on the canvas is what used to throw
    // "Expected an editing shape!". Probe a few spots (incl. where the now-removed
    // text shape was) so the pointer-down resolves to the dangling editing shape.
    const probePoints = [
      [0.5, 0.5],
      [0.6, 0.55],
      [0.4, 0.4],
    ];
    for (const [fx, fy] of probePoints) {
      await this.userPage.page.mouse.move(wbBox.x + fx * wbBox.width, wbBox.y + fy * wbBox.height);
      await this.userPage.page.mouse.down();
      await this.userPage.page.waitForTimeout(150);
      await this.userPage.page.mouse.up();
      await this.userPage.page.waitForTimeout(800);
    }
    // Give the client a beat to surface any async error / error boundary.
    await this.userPage.page.waitForTimeout(1000);

    const editingShapeErrors = viewerPageErrors.filter((m) => /Expected an editing shape/i.test(m));
    expect(
      editingShapeErrors,
      `viewer must not throw "Expected an editing shape!" on slide change while editing (got: ${editingShapeErrors.join(' | ')})`,
    ).toHaveLength(0);
    // The whiteboard must still be mounted (not replaced by the error-boundary fallback).
    await this.userPage.hasElement(
      e.whiteboard,
      'whiteboard should still be mounted on the viewer after the slide change',
    );
  }
}
