import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';
import { dragAcrossWhiteboard, openClearAnnotations } from './util';

export class MultiUserWhiteboard extends MultiUsers {
  async viewerAnnotationReachesEveryone() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage2.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.toggleWhiteboardAccess(this.userPage.username);
    await this.userPage.hasElement(e.wbToolbar, 'should display the whiteboard toolbar for the attendee given access');
    await this.userPage2.wasRemoved(e.wbToolbar, 'should not display the whiteboard toolbar for the other attendee');

    // the attendee with access draws a rectangle
    await this.userPage.waitAndClick(e.wbRectangleShape);
    await dragAcrossWhiteboard(this.userPage, 0.3, 0.5);
    await this.hasShapeCount(e.wbDrawnShape, 1, 'should display the rectangle drawn by the attendee');

    // removing the access keeps the attendee annotation
    await this.toggleWhiteboardAccess(this.userPage.username);
    await this.userPage.wasRemoved(
      e.wbToolbar,
      'should not display the whiteboard toolbar for the attendee after the access is removed',
    );
    await this.userPage.hasText(
      e.smallToastMsg,
      e.whiteboardDisabledToast,
      'should notify the attendee that the whiteboard access was removed',
    );
    await this.hasShapeCount(
      e.wbDrawnShape,
      1,
      'should keep displaying the rectangle drawn by the attendee after the access is removed',
    );
  }

  async presenterClearsAllAnnotations() {
    await this.drawPresenterAndViewerShapes();
    await openClearAnnotations(this.modPage);
    await this.modPage.hasText(
      e.simpleModal,
      e.modClearAnnotationsDescription,
      'should warn the presenter that every annotation will be cleared',
    );
    await this.modPage.waitAndClick(e.confirmClearAnnotationsButton);
    await this.hasShapeCount(e.wbDrawnShape, 0, 'should clear the rectangle drawn by the presenter');
    await this.hasShapeCount(e.wbDraw, 0, 'should clear the pencil stroke drawn by the attendee');
    await this.hasShapeCount(e.currentSlideImg, 1, 'should keep displaying the slide');
  }

  async viewerClearsOwnAnnotations() {
    await this.drawPresenterAndViewerShapes();
    await openClearAnnotations(this.userPage);
    await this.userPage.hasText(
      e.simpleModal,
      e.viewerClearAnnotationsDescription,
      'should warn the attendee that only their own annotations will be cleared',
    );
    await this.userPage.waitAndClick(e.confirmClearAnnotationsButton);
    await this.hasShapeCount(e.wbDraw, 0, 'should clear the pencil stroke drawn by the attendee');
    await this.hasShapeCount(e.wbDrawnShape, 1, 'should keep the rectangle drawn by the presenter');
  }

  async cancelClearAnnotations() {
    await this.drawPresenterAndViewerShapes();
    await openClearAnnotations(this.modPage);
    await this.modPage.waitAndClick(e.confirmationModalCancel);
    await this.modPage.wasRemoved(e.simpleModal, 'should close the clear annotations modal');
    await this.hasShapeCount(e.wbDrawnShape, 1, 'should keep the rectangle drawn by the presenter');
    await this.hasShapeCount(e.wbDraw, 1, 'should keep the pencil stroke drawn by the attendee');
  }

  // the presenter draws a rectangle and the attendee, given access, a pencil stroke
  async drawPresenterAndViewerShapes() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.multiUsersWhiteboardOn);
    await this.userPage.hasElement(e.wbToolbar, 'should display the whiteboard toolbar for the attendee');
    await this.modPage.waitAndClick(e.wbRectangleShape);
    await dragAcrossWhiteboard(this.modPage, 0.2, 0.4);
    await this.hasShapeCount(e.wbDrawnShape, 1, 'should display the rectangle drawn by the presenter');
    await this.userPage.waitAndClick(e.wbPencilShape);
    await dragAcrossWhiteboard(this.userPage, 0.6, 0.7);
    await this.hasShapeCount(e.wbDraw, 1, 'should display the pencil stroke drawn by the attendee');
  }

  async toggleWhiteboardAccess(userName: string) {
    const isUserListOpen = await this.modPage.checkElement(e.userListPanel);
    if (!isUserListOpen) await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.waitAndClick(`${e.userListItem}[aria-label="${userName}"] ${e.changeWhiteboardAccess}`);
  }

  // every page in the meeting must show the same number of shapes
  async hasShapeCount(selector: string, count: number, description: string) {
    const testPages = [this.modPage, this.userPage, this.userPage2].filter(Boolean);
    for (const testPage of testPages) {
      await expect(testPage.page.locator(selector), `${description} (${testPage.username})`).toHaveCount(count, {
        timeout: ELEMENT_WAIT_LONGER_TIME,
      });
    }
  }
}
