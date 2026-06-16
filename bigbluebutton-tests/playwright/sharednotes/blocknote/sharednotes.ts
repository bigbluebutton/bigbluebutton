import { elements as e } from '../../core/elements';
import { MultiUsers } from '../../user/multiusers';
import {
  getNotesLocator,
  hasNoUnreadNotesIndicator,
  startSharedNotes,
  unreadNotesIndicatorStaysHidden,
} from './util';

export class SharedNotes extends MultiUsers {
  async unreadNotesIndicator() {
    const { sharedNotesEnabled } = this.modPage.settings || {};

    if (!sharedNotesEnabled) {
      await this.modPage.hasElement(e.messagesSidebarButton, 'should display the public chat button');
      await this.modPage.wasRemoved(e.sharedNotesSidebarButton, 'should not display the shared notes button');
      return;
    }

    // viewer starts without the unread indicator
    await this.userPage.hasElement(e.sharedNotesSidebarButton, 'should display the shared notes button');
    await hasNoUnreadNotesIndicator(this.userPage, 'should not display the unread indicator before any edit');

    // moderator opens the notes and types
    await startSharedNotes(this.modPage);
    const notesEditor = getNotesLocator(this.modPage);
    await notesEditor.click();
    await this.modPage.page.keyboard.type('Hello attendees');

    // viewer (notes panel closed) must see the unread indicator
    await this.userPage.hasNotificationIcon(e.sharedNotesSidebarButton, 'should display the unread indicator for the viewer');

    // opening the notes clears the indicator
    await startSharedNotes(this.userPage);
    await hasNoUnreadNotesIndicator(this.userPage, 'should clear the unread indicator when the notes panel is open');

    // closing the panel must not bring the indicator back (notes were read)
    await this.userPage.waitAndClick(e.hideNotesLabel);
    await this.userPage.wasRemoved(e.hideNotesLabel, 'should not display the hide notes label');
    await unreadNotesIndicatorStaysHidden(this.userPage, 'should keep the indicator hidden after reading the notes');

    // new edits after the viewer read the notes must light the indicator again
    const modNotesEditor = getNotesLocator(this.modPage);
    await modNotesEditor.click();
    await this.modPage.page.keyboard.type('New content');
    await this.userPage.hasNotificationIcon(e.sharedNotesSidebarButton, 'should display the unread indicator again after new edits');
  }
}
