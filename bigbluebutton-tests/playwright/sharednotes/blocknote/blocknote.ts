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

    // The moderator clicks the link and nudges the caret a few characters inward, so
    // the node following the caret is link-marked (the condition that makes
    // y-prosemirror wrap the cursor widget in the link mark).
    await getBlockNoteLinkLocator(this.modPage).first().click();
    await this.modPage.page.keyboard.press('ArrowLeft');
    await this.modPage.page.keyboard.press('ArrowLeft');
    await this.modPage.page.keyboard.press('ArrowLeft');

    // Poll until the attendee renders the moderator's remote cursor. The read runs
    // inside readLinkAndCursorState via page.evaluate, which never focuses/activates
    // the attendee page, so the moderator editor keeps focus and keeps broadcasting
    // its cursor. This presence guard also prevents a clean-but-cursorless link from
    // being a false pass.
    await expect
      .poll(async () => (await readLinkAndCursorState(this.userPage)).remoteCursorCount, {
        message: 'attendee should render the moderator collaboration cursor',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBeGreaterThan(0);
    const state = await readLinkAndCursorState(this.userPage);

    // Precondition: the cursor widget is actually positioned inside the link — the exact
    // condition that triggers #25225. The fix neutralises the text leak without
    // relocating the widget, so this stays true; a future upstream `marks: []` fix would
    // move the widget out of the <a> and this guard should then be relaxed.
    expect(state.cursorWidgetInsideLink, 'precondition: the remote cursor must sit inside the link').toBe(true);

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
