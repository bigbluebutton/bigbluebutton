import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { getCurrentSlideSvgPath, uploadSinglePresentation } from '../presentation/util';
import { MultiUsers } from '../user/multiusers';

// Whiteboard behaviour that depends on pages being identified by their page id: annotations, zoom,
// presenter changes and presentation removal must keep working as they did with page numbers.
export class PageIdentity extends MultiUsers {
  private static async drawRectangle(testPage: Page, from: number, to: number) {
    await testPage.waitAndClick(e.wbRectangleShape);
    const wbBox = await testPage.page.locator(e.whiteboard).boundingBox();
    if (!wbBox) throw new Error('whiteboard boundingBox is null');
    await testPage.page.mouse.move(wbBox.x + from * wbBox.width, wbBox.y + from * wbBox.height, { steps: 10 });
    await testPage.page.mouse.down();
    await testPage.page.mouse.move(wbBox.x + to * wbBox.width, wbBox.y + to * wbBox.height, { steps: 10 });
    await testPage.page.mouse.up();
  }

  private async expectShapesOnBoth(count: number, message: string) {
    for (const [role, testPage] of [
      ['presenter', this.modPage],
      ['viewer', this.userPage],
    ] as const) {
      await expect(testPage.page.locator(e.wbDrawnShape), `${role}: ${message}`).toHaveCount(count, {
        timeout: ELEMENT_WAIT_LONGER_TIME,
      });
    }
  }

  private static async waitForNewSlide(testPage: Page, previous: string | null) {
    await expect
      .poll(async () => getCurrentSlideSvgPath(testPage), { timeout: ELEMENT_WAIT_LONGER_TIME })
      .not.toBe(previous);
  }

  private async shareDefaultPresentation() {
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.managePresentations);
    const defaultItem = this.modPage.page.locator(e.presentationItem, {
      has: this.modPage.page.locator('[data-test="presentationName"]', { hasText: 'default.pdf' }),
    });
    await defaultItem.locator(e.presentationThumbnails).click();
    await this.modPage.waitAndClick(e.sharePresentationButton);
    await this.modPage.press('Escape');
  }

  // Ac: annotations of slides 1 and 2 stay on their own slide after switching presentations and back.
  async annotationsStayOnTheirSlideAcrossPresentations() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    await PageIdentity.drawRectangle(this.modPage, 0.3, 0.4);
    await this.expectShapesOnBoth(1, 'slide 1 should have its rectangle');

    const slideOne = await getCurrentSlideSvgPath(this.modPage);
    await this.modPage.waitAndClick(e.nextSlide);
    await PageIdentity.waitForNewSlide(this.modPage, slideOne);
    await this.expectShapesOnBoth(0, 'slide 2 should start without annotations');
    await PageIdentity.drawRectangle(this.modPage, 0.3, 0.4);
    await PageIdentity.drawRectangle(this.modPage, 0.5, 0.6);
    await this.expectShapesOnBoth(2, 'slide 2 should have its two rectangles');

    const slideTwo = await getCurrentSlideSvgPath(this.modPage);
    await uploadSinglePresentation(this.modPage, e.nonDefaultRatioPresentationFileName);
    await this.expectShapesOnBoth(0, 'the other presentation should have no annotations');

    await this.shareDefaultPresentation();
    await expect
      .poll(async () => getCurrentSlideSvgPath(this.modPage), { timeout: ELEMENT_WAIT_LONGER_TIME })
      .toBe(slideTwo);
    await this.expectShapesOnBoth(2, 'back on slide 2, its two rectangles should be there');

    await this.modPage.waitAndClick(e.prevSlide);
    await PageIdentity.waitForNewSlide(this.modPage, slideTwo);
    await this.expectShapesOnBoth(1, 'back on slide 1, its rectangle should be there');
  }

  // Ac: after taking presenter, the new presenter's navigation and infinite whiteboard toggle work.
  async takePresenterThenNavigateAndToggleInfiniteWhiteboard() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage2.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.takePresenter();
    await this.modPage2.press('Escape');

    const slideOne = await getCurrentSlideSvgPath(this.modPage);
    await this.modPage2.waitAndClick(e.nextSlide);
    await PageIdentity.waitForNewSlide(this.modPage, slideOne);
    await PageIdentity.waitForNewSlide(this.modPage2, slideOne);

    await this.modPage2.waitAndClick(e.turnInfiniteWhiteboardOn);
    await this.modPage2.hasElement(
      'button[data-test="turnInfiniteWhiteboardOff"]',
      'the infinite whiteboard should be on for the new presenter',
    );
    await this.modPage2.waitAndClick('button[data-test="turnInfiniteWhiteboardOff"]');
    await this.modPage2.hasElement(e.turnInfiniteWhiteboardOn, 'the infinite whiteboard should be off again');
  }

  // Ac: removing the current presentation while another user is drawing raises no error.
  async removePresentationWhileAnotherUserDraws() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await uploadSinglePresentation(this.modPage, e.nonDefaultRatioPresentationFileName);
    await this.userPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.multiUsersWhiteboardOn);
    await this.userPage.hasElement(e.wbToolbar, 'the viewer should be able to draw');

    const errors: string[] = [];
    for (const testPage of [this.modPage, this.userPage]) {
      testPage.page.on('pageerror', (err) => errors.push(err.message));
    }

    await this.userPage.waitAndClick(e.wbPencilShape);
    const wbBox = await this.userPage.page.locator(e.whiteboard).boundingBox();
    if (!wbBox) throw new Error('whiteboard boundingBox is null');
    await this.userPage.page.mouse.move(wbBox.x + 0.2 * wbBox.width, wbBox.y + 0.2 * wbBox.height);
    await this.userPage.page.mouse.down();
    const drawing = (async () => {
      for (let i = 0; i < 40; i += 1) {
        await this.userPage.page.mouse
          .move(wbBox.x + (0.2 + (i % 10) * 0.05) * wbBox.width, wbBox.y + (0.2 + (i % 7) * 0.05) * wbBox.height)
          .catch(() => {});
      }
    })();

    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.managePresentations);
    const current = this.modPage.page.locator(e.presentationItem, {
      has: this.modPage.page.locator('[data-test="presentationName"]', {
        hasText: e.nonDefaultRatioPresentationFileName,
      }),
    });
    await current.locator(e.removePresentation).click();
    await drawing;
    await this.userPage.page.mouse.up();
    await this.modPage.press('Escape');

    await this.modPage.hasElement(e.whiteboard, 'the presenter should still see a whiteboard');
    await this.userPage.hasElement(e.whiteboard, 'the viewer should still see a whiteboard');
    expect(errors, 'removing the presentation while drawing should raise no error').toHaveLength(0);
  }

  // Ac: the zoom of slide 2 is still there after going to slide 1 and back.
  async zoomIsKeptPerSlide() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    const zoomValue = this.modPage.page.locator(e.resetZoomButton);

    const slideOne = await getCurrentSlideSvgPath(this.modPage);
    await this.modPage.waitAndClick(e.nextSlide);
    await PageIdentity.waitForNewSlide(this.modPage, slideOne);
    const slideTwo = await getCurrentSlideSvgPath(this.modPage);

    await this.modPage.waitAndClick(e.zoomInButton);
    await expect(zoomValue, 'slide 2 should be zoomed to 125%').toContainText(/125%/);
    await this.modPage.waitAndClick(e.zoomInButton);
    await expect(zoomValue, 'slide 2 should be zoomed to 150%').toContainText(/150%/);

    await this.modPage.waitAndClick(e.prevSlide);
    await PageIdentity.waitForNewSlide(this.modPage, slideTwo);
    await expect(zoomValue, 'slide 1 should keep its own zoom').toContainText(/100%/);

    await this.modPage.waitAndClick(e.nextSlide);
    await expect
      .poll(async () => getCurrentSlideSvgPath(this.modPage), { timeout: ELEMENT_WAIT_LONGER_TIME })
      .toBe(slideTwo);
    await expect(zoomValue, 'slide 2 should be back at 150%').toContainText(/150%/);
  }
}
