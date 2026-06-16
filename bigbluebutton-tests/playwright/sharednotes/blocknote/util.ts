import { Locator } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../../core/constants';
import { elements as e } from '../../core/elements';
import { Page } from '../../core/page';

// The BlockNote editor renders inline (no Etherpad iframes); its editable area
// is the ProseMirror root `.bn-editor` inside the shared-notes panel.
export const BLOCKNOTE_EDITOR = '[data-test="notes"] .bn-editor';

export async function startBlockNoteSharedNotes(testPage: Page): Promise<void> {
  await testPage.waitAndClick(e.sharedNotes);
  await testPage.waitForSelector(e.hideNotesLabel, ELEMENT_WAIT_LONGER_TIME);
  await testPage.waitForSelector(BLOCKNOTE_EDITOR, ELEMENT_WAIT_LONGER_TIME);
}

export function getBlockNoteEditorLocator(testPage: Page): Locator {
  return testPage.page.locator(BLOCKNOTE_EDITOR);
}

export function getBlockNoteLinkLocator(testPage: Page): Locator {
  return testPage.page.locator(`${BLOCKNOTE_EDITOR} a`);
}

/**
 * Reads the rendered state of the first <a> link in another user's BlockNote
 * editor, plus whether a remote collaboration cursor is present. Runs via
 * `evaluate` so it never focuses/activates the page (which would blur the
 * cursor owner's editor and stop their awareness cursor from broadcasting).
 */
export function readLinkAndCursorState(testPage: Page) {
  return testPage.page.evaluate((sel: string) => {
    const WORD_JOINER = '⁠';
    const anchor = document.querySelector(`${sel} a`) as HTMLAnchorElement | null;
    // One `__base` element per remote cursor — count bases only for an accurate count.
    const cursorBases = document.querySelectorAll(`${sel} .bn-collaboration-cursor__base`);
    return {
      linkText: anchor ? (anchor.textContent ?? '') : '',
      linkHref: anchor ? (anchor.getAttribute('href') ?? '') : '',
      linkTextHasWordJoiner: anchor ? (anchor.textContent ?? '').includes(WORD_JOINER) : false,
      cursorWidgetInsideLink: anchor
        ? !!anchor.querySelector(
            '.bn-collaboration-cursor__base, .bn-collaboration-cursor__caret, .bn-collaboration-cursor__label',
          )
        : false,
      remoteCursorCount: cursorBases.length,
    };
  }, BLOCKNOTE_EDITOR);
}
