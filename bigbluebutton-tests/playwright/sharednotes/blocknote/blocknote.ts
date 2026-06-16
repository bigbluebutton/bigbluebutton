import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../../core/constants';
import { elements as e } from '../../core/elements';
import { MultiUsers } from '../../user/multiusers';
import {
  getBlockNoteEditorLocator,
  getBlockNoteLinkLocator,
  readLinkAndCursorState,
  startBlockNoteSharedNotes,
} from './util';

// URL mirrors the link shown in the original #25225 report (it referenced issue 25175).
const LINK_URL = 'https://github.com/bigbluebutton/bigbluebutton/issues/25175';
const WORD_JOINER = '⁠';

export class BlockNoteSharedNotes extends MultiUsers {
  // Reproduces issue #25225: when a remote user's caret sits inside a link, that
  // user's collaboration-cursor name (and the U+2060 word-joiner separators around
  // it) must NOT be embedded in the link's text or href as seen by other users.
  async collaborationCursorMustNotEmbedInLink() {
    const { sharedNotesEnabled } = this.modPage.settings || {};
    if (!sharedNotesEnabled) {
      await this.modPage.hasElement(e.chatButton, 'should display the public chat button');
      await this.modPage.wasRemoved(e.sharedNotes, 'should not display the shared notes button');
      return;
    }

    await startBlockNoteSharedNotes(this.modPage);
    await startBlockNoteSharedNotes(this.userPage);

    // The moderator creates a link by typing a URL followed by a space (autolink).
    const modEditor = getBlockNoteEditorLocator(this.modPage);
    await modEditor.click();
    await this.modPage.page.keyboard.type(`${LINK_URL} `);

    // The link must sync to the attendee's editor.
    await expect(getBlockNoteLinkLocator(this.userPage), 'should sync the pasted link to the attendee').toHaveCount(1, {
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });

    // Place the moderator's caret a few characters inside the link — keyboard only.
    // (Clicking the link opens BlockNote's link toolbar, which steals editor focus and
    // stops y-prosemirror from broadcasting the cursor.) After typing, the caret sits
    // after the trailing space; stepping left past the space and into the URL makes the
    // node *after* the caret link-marked, which is what makes y-prosemirror wrap the
    // remote cursor widget in the link mark — the #25225 trigger.
    for (let i = 0; i < 9; i += 1) {
      await this.modPage.page.keyboard.press('ArrowLeft');
    }

    // Wait until the attendee actually renders the moderator's cursor *inside* the link.
    // This single poll is the presence guard + the bug precondition + a sync wait: a
    // remote cursor exists and sits within the <a> (the exact #25225 condition), so a
    // clean link cannot be a false pass. Reading via page.evaluate never focuses the
    // attendee page, so the moderator editor keeps focus and keeps broadcasting.
    // (A future upstream `marks: []` fix would render the widget *outside* the <a>;
    // this precondition would then need relaxing.)
    await expect
      .poll(async () => (await readLinkAndCursorState(this.userPage)).cursorWidgetInsideLink, {
        message: 'attendee should render the moderator cursor inside the link',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBe(true);
    const state = await readLinkAndCursorState(this.userPage);

    // The bug: the cursor name and U+2060 separators must not pollute the link text.
    expect(state.linkTextHasWordJoiner, 'link text must not contain U+2060 word-joiner separator characters').toBe(
      false,
    );
    expect(state.linkText, "link text must not contain the other user's name").not.toContain(this.modPage.username);
    expect(state.linkText, 'link text should equal the original URL').toBe(LINK_URL);

    // ...nor the href / navigation target.
    expect(state.linkHref, "link href must not contain the other user's name").not.toContain(this.modPage.username);
    expect(state.linkHref, 'link href must not contain U+2060').not.toContain(WORD_JOINER);
    expect(state.linkHref, 'link href should equal the original URL').toBe(LINK_URL);

    await this.modPage.waitAndClick(e.hideNotesLabel);
    await this.modPage.wasRemoved(e.hideNotesLabel, 'should not display the hide notes label');
  }
}
