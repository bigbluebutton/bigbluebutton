import { expect, Locator } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { startSharedNotesBlockNote } from '../sharednotes/blocknote/util';
import { MultiUsers } from '../user/multiusers';
import { drawArrow } from '../user/util';

// The pointer tldraw draws for another user, tagged with that user's name.
const WHITEBOARD_REMOTE_CURSOR = 'div.tl-collaborator__cursor';
// What the media area button opens. A viewer only finds there the ways to become presenter.
const MEDIA_AREA_MENU = 'div#mediaAreaDropUp';

const userListRow = (userName: string) => `${e.userListItem}[aria-label="${userName}"]`;

function remoteCursor(testPage: Page, userName: string): Locator {
  return testPage.page
    .locator(WHITEBOARD_REMOTE_CURSOR)
    .filter({ has: testPage.page.getByText(userName, { exact: true }) });
}

export class LockSettingsParameters extends MultiUsers {
  async privateChatButtons(canChatWithOtherViewers: boolean) {
    await this.userPage.waitAndClick(e.usersListSidebarButton);
    await this.userPage.hasElement(
      `${userListRow(this.modPage.username)} ${e.startPrivateChat}`,
      'should offer the attendee a private chat with the moderator',
    );
    await this.userPage.hasElement(userListRow(this.userPage2.username), 'should list the other attendee');
    const otherAttendeeChat = `${userListRow(this.userPage2.username)} ${e.startPrivateChat}`;
    if (canChatWithOtherViewers) {
      await this.userPage.hasElement(
        otherAttendeeChat,
        'should offer the attendee a private chat with the other attendee',
      );
    } else {
      await this.userPage.wasRemoved(
        otherAttendeeChat,
        'should not offer the attendee a private chat with the other attendee',
      );
    }
  }

  async disableNotes() {
    // moderators are never locked, so the notes stay editable for them
    await startSharedNotesBlockNote(this.modPage);
    await this.userPage.waitAndClick(e.sharedNotesSidebarButton);
    await this.userPage.hasElement(
      e.blockNoteReadOnly,
      'should display the shared notes read-only for the attendee',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  async joinsUnlocked() {
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    const attendeeRow = this.modPage.page.locator(userListRow(this.userPage.username));
    await expect(attendeeRow, 'should list the attendee for the moderator').toBeVisible();
    // while a lock setting is active, the moderator sees a locked viewer labelled as such
    await expect(attendeeRow, 'should not show the attendee as locked to the moderator').not.toContainText(/locked/i);
    await this.userPage.hasElementEnabled(e.joinVideo, 'should keep the webcam button enabled for the attendee');
  }

  async hideViewersCursor() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator');
    await this.userPage.hasElement(
      e.wbToolbar,
      'should give the first attendee the whiteboard tools',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.userPage2.hasElement(e.whiteboard, 'should display the whiteboard for the second attendee');

    await this.userPage.hoverElement(e.whiteboard);
    await expect(
      remoteCursor(this.modPage, this.userPage.username),
      'should display the first attendee cursor for the moderator',
    ).toBeVisible();
    // The moderator's cursor moves after the attendee's: once it reaches the second attendee, the attendee's has too.
    await this.modPage.hoverElement(e.whiteboard);
    await expect(
      remoteCursor(this.userPage2, this.modPage.username),
      'should display the moderator cursor for the second attendee',
    ).toBeVisible();
    await expect(
      remoteCursor(this.userPage2, this.userPage.username),
      'should not display the first attendee cursor for the second attendee',
    ).toHaveCount(0);
  }

  async hideViewersAnnotation() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator');
    await this.userPage.hasElement(
      e.wbToolbar,
      'should give the first attendee the whiteboard tools',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.userPage2.hasElement(e.whiteboard, 'should display the whiteboard for the second attendee');

    await this.userPage.waitAndClick(e.wbRectangleShape);
    await this.userPage.waitAndClick(e.whiteboard);
    await this.userPage.hasElementCount(e.wbDrawnShape, 1, 'should display the rectangle for the attendee who drew it');
    await this.modPage.hasElementCount(e.wbDrawnShape, 1, 'should display the attendee rectangle for the moderator');
    // The moderator's arrow is drawn after the rectangle: once it reaches the second attendee, the rectangle has too.
    await drawArrow(this.modPage);
    await this.userPage2.hasElementCount(
      e.wbDrawnArrow,
      1,
      'should display the moderator arrow for the second attendee',
    );
    await this.userPage2.hasElementCount(
      e.wbDrawnShape,
      0,
      'should not display the first attendee rectangle for the second attendee',
    );
  }

  async viewerCanTakePresenter() {
    await this.userPage.waitAndClick(e.mediaAreaButton);
    await this.userPage.hasElement(e.takePresenterButton, 'should offer the attendee to take presenter');
    await this.userPage.wasRemoved(e.requestPresenterButton, 'should not ask the attendee to request presenter');
  }

  async viewerCanRequestPresenter() {
    await this.userPage.waitAndClick(e.mediaAreaButton);
    await this.userPage.hasElement(e.requestPresenterButton, 'should offer the attendee to request presenter');
    await this.userPage.wasRemoved(
      e.takePresenterButton,
      'should not offer the attendee to take presenter without approval',
    );
  }

  async viewerCannotBecomePresenter() {
    await this.userPage.waitAndClick(e.mediaAreaButton);
    await this.userPage.hasElement(MEDIA_AREA_MENU, 'should open the media area menu for the attendee');
    await this.userPage.wasRemoved(e.requestPresenterButton, 'should not offer the attendee to request presenter');
    await this.userPage.wasRemoved(e.takePresenterButton, 'should not offer the attendee to take presenter');
  }

  async multiUserWhiteboardOnJoin() {
    await this.userPage.hasElement(
      e.wbToolbar,
      'should give the attendee the whiteboard tools without any moderator action',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.hasElement(
      e.multiUsersWhiteboardOff,
      'should show the moderator the multi-user whiteboard is on',
    );
  }
}
