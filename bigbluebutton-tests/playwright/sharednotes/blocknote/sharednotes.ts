import { expect } from '@playwright/test';

import { ELEMENT_WAIT_TIME } from '../../core/constants';
import { elements as e } from '../../core/elements';
import { MultiUsers } from '../../user/multiusers';
import {
  startSharedNotesBlockNote,
  getBlockNoteEditorLocator,
  getBlockNoteReadOnlyLocator,
} from './util';

export class SharedNotesBlockNote extends MultiUsers {
  async openSharedNotes() {
    const { sharedNotesEnabled } = this.modPage.settings || {};

    if (!sharedNotesEnabled) {
      await this.modPage.hasElement(e.messagesSidebarButton, 'should display the public chat button');
      await this.modPage.wasRemoved(e.sharedNotesSidebarButton, 'should not display the shared notes button');
      return;
    }
    await startSharedNotesBlockNote(this.modPage);
    const editorLocator = getBlockNoteEditorLocator(this.modPage);
    await expect(editorLocator, 'should display the BlockNote editor in editable mode').toBeVisible({
      timeout: ELEMENT_WAIT_TIME,
    });

    await this.modPage.waitAndClick(e.hideNotesLabel);
    await this.modPage.wasRemoved(e.hideNotesLabel, 'should not display the hide notes label');
  }

  async typeInSharedNotes() {
    const { sharedNotesEnabled } = this.modPage.settings || {};

    if (!sharedNotesEnabled) {
      await this.modPage.hasElement(e.messagesSidebarButton, 'should display the public chat button');
      await this.modPage.wasRemoved(e.sharedNotesSidebarButton, 'should not display the shared notes button');
      return;
    }
    await startSharedNotesBlockNote(this.modPage);
    const editorLocator = getBlockNoteEditorLocator(this.modPage);
    await editorLocator.click();
    await editorLocator.pressSequentially(e.message);
    await expect(editorLocator, 'should contain the typed text on shared notes').toContainText(e.message, {
      timeout: ELEMENT_WAIT_TIME,
    });

    await editorLocator.press('Control+Z');
    await editorLocator.press('Control+Z');
    await editorLocator.press('Control+Z');

    await this.modPage.waitAndClick(e.hideNotesLabel);
    await this.modPage.wasRemoved(e.hideNotesLabel, 'should not display the hide notes label');
  }

  async formatTextInSharedNotes() {
    const { sharedNotesEnabled } = this.modPage.settings || {};

    if (!sharedNotesEnabled) {
      await this.modPage.hasElement(e.messagesSidebarButton, 'should display the public chat button');
      await this.modPage.wasRemoved(e.sharedNotesSidebarButton, 'should not display the shared notes button');
      return;
    }
    await startSharedNotesBlockNote(this.modPage);
    const editorLocator = getBlockNoteEditorLocator(this.modPage);
    await editorLocator.click();
    await editorLocator.pressSequentially(e.message);

    await editorLocator.press('Control+Z');
    await expect(editorLocator, 'should not contain any text after undoing').not.toContainText(e.message, {
      timeout: ELEMENT_WAIT_TIME,
    });
    // Re-type so we have content to format (Y.js collaborative redo is not reliable in tests)
    await editorLocator.pressSequentially(e.message);
    await expect(editorLocator, 'should contain the message again after re-typing').toContainText(e.message, {
      timeout: ELEMENT_WAIT_TIME,
    });

    await this.formatBlockNoteMessage();
    const html = await editorLocator.innerHTML();

    await expect(html.includes('<u>'), 'should include underline formatting').toBeTruthy();
    await expect(html.includes('<strong>'), 'should include bold formatting').toBeTruthy();
    await expect(html.includes('<em>'), 'should include italic formatting').toBeTruthy();

    await editorLocator.press('Control+Z');
    await editorLocator.press('Control+Z');
    await editorLocator.press('Control+Z');

    await this.modPage.waitAndClick(e.hideNotesLabel);
    await this.modPage.wasRemoved(e.hideNotesLabel, 'should not display the hide notes label');
  }

  async exportSharedNotesAsPDF() {
    const { sharedNotesEnabled } = this.modPage.settings || {};

    if (!sharedNotesEnabled) {
      await this.modPage.hasElement(e.messagesSidebarButton, 'should display the public chat button');
      await this.modPage.wasRemoved(e.sharedNotesSidebarButton, 'should not display the shared notes button');
      return;
    }
    await startSharedNotesBlockNote(this.modPage);
    const editorLocator = getBlockNoteEditorLocator(this.modPage);
    await editorLocator.click();
    await editorLocator.pressSequentially(e.message);

    await this.modPage.waitAndClick(e.notesOptions);
    await this.modPage.hasElement(e.exportNotesAsPDF, 'should display the export as PDF option');

    // Intercept the outgoing request — the server responds with Content-Disposition: attachment
    // so the popup tab never navigates; checking the request URL is the reliable approach.
    const [request] = await Promise.all([
      this.modPage.page.context().waitForEvent('request', {
        predicate: (req) => req.url().includes('/hocuspocus/api/documents/'),
        timeout: 15000,
      }),
      this.modPage.waitAndClick(e.exportNotesAsPDF),
    ]);
    await expect(request.url(), 'should request the PDF export endpoint').toContain('/export/pdf');

    await this.modPage.waitAndClick(e.hideNotesLabel);
    await this.modPage.wasRemoved(e.hideNotesLabel, 'should not display the hide notes label');
  }

  async convertNotesToWhiteboard() {
    const { sharedNotesEnabled } = this.modPage.settings || {};

    if (!sharedNotesEnabled) {
      await this.modPage.hasElement(e.messagesSidebarButton, 'should display the public chat button');
      await this.modPage.wasRemoved(e.sharedNotesSidebarButton, 'should not display the shared notes button');
      return;
    }
    await startSharedNotesBlockNote(this.modPage);
    const editorLocator = getBlockNoteEditorLocator(this.modPage);
    await editorLocator.click();
    await editorLocator.pressSequentially('test');
    await this.modPage.page.waitForTimeout(1000);

    await this.modPage.waitAndClick(e.notesOptions);
    await this.modPage.waitAndClick(e.sendNotesToWhiteboard);

    await this.modPage.hasText(
      e.currentSlideText,
      /test/,
      'should the slide contain the text "test" for the moderator',
      30000,
    );
    await this.userPage.hasText(
      e.currentSlideText,
      /test/,
      'should the slide contain the text "test" for the attendee',
      20000,
    );

    await editorLocator.press('Control+Z');

    await this.modPage.waitAndClick(e.hideNotesLabel);
    await this.modPage.wasRemoved(e.hideNotesLabel, 'should not display the hide notes label button');
  }

  async editSharedNotesWithMoreThanOneUser() {
    const { sharedNotesEnabled } = this.modPage.settings || {};

    if (!sharedNotesEnabled) {
      await this.modPage.hasElement(e.messagesSidebarButton, 'should display the public chat button');
      await this.modPage.wasRemoved(e.sharedNotesSidebarButton, 'should not display the shared notes button');
      return;
    }
    // Open notes for both users before any typing so Hocuspocus registers both sessions
    await startSharedNotesBlockNote(this.userPage);
    const userEditorLocator = getBlockNoteEditorLocator(this.userPage);

    await startSharedNotesBlockNote(this.modPage);
    const modEditorLocator = getBlockNoteEditorLocator(this.modPage);
    await modEditorLocator.click();
    await modEditorLocator.pressSequentially('Hello');

    // user waits for mod's text to sync, then selects all and replaces
    await expect(userEditorLocator, 'should sync mod content to user before editing').toContainText(
      'Hello',
      { timeout: ELEMENT_WAIT_TIME },
    );
    await userEditorLocator.click();
    await userEditorLocator.press('Control+A');
    await userEditorLocator.pressSequentially('Jello');

    await expect(modEditorLocator, 'should the shared notes contain the text "Jello" for the moderator').toContainText(
      /Jello/,
      { timeout: ELEMENT_WAIT_TIME },
    );
    await expect(userEditorLocator, 'should the shared notes contain the text "Jello" for the attendee').toContainText(
      /Jello/,
      { timeout: ELEMENT_WAIT_TIME },
    );

    await this.modPage.waitAndClick(e.hideNotesLabel);
    await this.modPage.wasRemoved(e.hideNotesLabel, 'should not display the hide notes button for the moderator');
    await this.userPage.waitAndClick(e.hideNotesLabel);
    await this.userPage.wasRemoved(e.hideNotesLabel, 'should not display the hide notes button for the attendee');
  }

  async seeNotesWithoutEditPermission() {
    const { sharedNotesEnabled } = this.modPage.settings || {};

    if (!sharedNotesEnabled) {
      await this.modPage.hasElement(e.messagesSidebarButton, 'should display the public chat button');
      await this.modPage.wasRemoved(e.sharedNotesSidebarButton, 'should not display the shared notes button');
      return;
    }
    // type on shared notes as moderator
    await startSharedNotesBlockNote(this.modPage);
    const modEditorLocator = getBlockNoteEditorLocator(this.modPage);
    await modEditorLocator.click();
    await modEditorLocator.pressSequentially('Hello');

    // open user notes to join the Hocuspocus session
    await startSharedNotesBlockNote(this.userPage);

    // lock shared notes editing for viewers
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.waitAndClick(e.lockViewersButton);
    await this.modPage.waitAndClick(e.participantPermissionsTab);
    await this.modPage.waitAndClickElement(e.lockEditSharedNotes);
    await this.modPage.waitAndClick(e.applyLockSettings);

    // attendee's editor should become read-only and still show content
    const userReadOnlyLocator = getBlockNoteReadOnlyLocator(this.userPage);
    await expect(userReadOnlyLocator, 'should display the text "Hello" in read-only mode for the attendee').toContainText(
      /Hello/,
      { timeout: 20000 },
    );
    await this.userPage.wasRemoved(
      e.blockNoteToolbar,
      'should not display the BlockNote toolbar when shared notes are locked for editing',
    );
  }

  async pinAndUnpinNotesOntoWhiteboard() {
    const { sharedNotesEnabled } = this.modPage.settings || {};

    if (!sharedNotesEnabled) {
      await this.modPage.hasElement(e.messagesSidebarButton, 'should display the public chat button');
      await this.modPage.wasRemoved(e.sharedNotesSidebarButton, 'should not display the shared notes button');
      return;
    }
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);
    // user minimize presentation
    await this.userPage.waitAndClick(e.minimizePresentation);
    await this.userPage.hasElement(
      e.restorePresentation,
      'should display the restore presentation button for the attendee',
    );
    // type on shared notes as moderator
    await startSharedNotesBlockNote(this.modPage);
    const editorLocator = getBlockNoteEditorLocator(this.modPage);
    await editorLocator.click();
    await editorLocator.pressSequentially('Hello');
    await this.modPage.page.waitForTimeout(1000); // avoid pinning notes before the text is fully synced
    // pin notes
    await this.modPage.waitAndClick(e.notesOptions);
    await this.modPage.waitAndClick(e.pinNotes);
    await this.modPage.hasElement(e.unpinNotes, 'should display the unpin notes button');
    await this.userPage.hasElement(
      e.minimizePresentation,
      'should display the minimize presentation button for the attendee',
    );
    // check text content on pinned shared notes
    const userEditorLocator = getBlockNoteEditorLocator(this.userPage);
    await expect(editorLocator, 'should display the text "Hello" on the shared notes for the moderator').toContainText(
      /Hello/,
      { timeout: 20000 },
    );
    await expect(
      userEditorLocator,
      'should display the text "Hello" on the shared notes for the attendee',
    ).toContainText(/Hello/);
    // unpin notes
    await this.modPage.closeAllToastNotifications();
    await this.modPage.waitAndClick(e.unpinNotes);
    await this.modPage.hasElement(e.whiteboard, 'should restore the presentation for the moderator (previous state)');
    await this.userPage.hasElement(
      e.whiteboard,
      'should restore the presentation for the attendee as it syncs to presenter state',
    );
    // pin notes again as moderator
    await startSharedNotesBlockNote(this.modPage);
    await this.modPage.waitAndClick(e.notesOptions);
    await this.modPage.waitAndClick(e.pinNotes);
    await this.modPage.hasElement(
      e.unpinNotes,
      'should display the unpin notes button for the moderator after pinning the notes again',
    );
    // make viewer as presenter and unpin notes
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.waitAndClick(e.moreOptionsUserItemButton);
    await this.modPage.waitAndClick(e.makePresenter);
    await this.userPage.closeAllToastNotifications();
    await this.userPage.waitAndClick(e.unpinNotes);
    await this.userPage.hasElement(e.whiteboard, 'should restore the presentation for the attendee (previous state)');
    await this.modPage.hasElement(e.whiteboard, 'should restore the presentation for the moderator (previous state)');
  }

  async formatBlockNoteMessage() {
    // U for '!' — BlockNote has no Ctrl+U shortcut; click the toolbar button instead.
    // The static toolbar uses e.preventDefault() on mousedown to preserve selection.
    await this.modPage.down('Shift');
    await this.modPage.press('ArrowLeft');
    await this.modPage.up('Shift');
    await this.modPage.page.locator(e.blockNoteUnderlineButton).click();
    await this.modPage.press('ArrowLeft');

    // B for 'World'
    await this.modPage.down('Shift');
    let i = 5;
    while (i > 0) {
      await this.modPage.press('ArrowLeft');
      i--;
    }
    await this.modPage.up('Shift');
    await this.modPage.press('Control+B');
    await this.modPage.press('ArrowLeft');

    await this.modPage.press('ArrowLeft');

    // I for 'Hello'
    await this.modPage.down('Shift');
    i = 5;
    while (i > 0) {
      await this.modPage.press('ArrowLeft');
      i--;
    }
    await this.modPage.up('Shift');
    await this.modPage.press('Control+I');
    await this.modPage.press('ArrowLeft');
  }
}
