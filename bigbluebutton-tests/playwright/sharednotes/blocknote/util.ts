import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../../core/constants';
import { elements as e } from '../../core/elements';
import { Page } from '../../core/page';

export async function startSharedNotesBlockNote(testPage: Page) {
  await testPage.waitAndClick(e.sharedNotesSidebarButton);
  await testPage.waitForSelector(e.hideNotesLabel, ELEMENT_WAIT_LONGER_TIME);
  await testPage.hasElement(e.blockNoteEditable, 'should display the BlockNote editor', ELEMENT_WAIT_LONGER_TIME);
}

export function getBlockNoteEditorLocator(testPage: Page) {
  return testPage.page.locator(e.blockNoteEditor);
}

export function getBlockNoteReadOnlyLocator(testPage: Page) {
  return testPage.page.locator(e.blockNoteReadOnly);
}

function checkUnreadNotesIndicator(testPage: Page) {
  return testPage.page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (!element) return false;
    const afterElement = getComputedStyle(element, 'after');
    return !!afterElement && afterElement.content !== 'none';
  }, e.sharedNotesSidebarButton);
}

export async function hasNoUnreadNotesIndicator(testPage: Page, description: string, timeout = ELEMENT_WAIT_TIME) {
  await expect(async () => {
    expect(await checkUnreadNotesIndicator(testPage)).toBeFalsy();
  }, description).toPass({ timeout });
}

// The indicator must not (re)appear: poll for the whole duration instead of
// passing on the first falsy check.
export async function unreadNotesIndicatorStaysHidden(testPage: Page, description: string, durationMs = 3000) {
  const deadline = Date.now() + durationMs;
  while (Date.now() < deadline) {
    // eslint-disable-next-line no-await-in-loop
    expect(await checkUnreadNotesIndicator(testPage), description).toBeFalsy();
    // eslint-disable-next-line no-await-in-loop
    await testPage.page.waitForTimeout(250);
  }
}

// U+2060 word-joiner: y-prosemirror wraps the remote collaboration-cursor name
// in these invisible separators, which is what #25225 leaked into the link.
export const WORD_JOINER = '⁠';

// Helpers backported from the 3.0 Markdown / collaboration-cursor specs (#25373,
// #25225). Those specs import startBlockNoteSharedNotes; on 4.0 the shared-notes
// sidebar button is data-test="sharedNotesSidebarButton" (renamed from 3.0's
// "sharedNotes") and the editor root is #bn-notes-scroll-container, so this opens
// the panel with the 4.0 selectors rather than 3.0's e.sharedNotes / [data-test="notes"].
export async function startBlockNoteSharedNotes(testPage: Page) {
  await testPage.waitAndClick(e.sharedNotesSidebarButton);
  await testPage.waitForSelector(e.hideNotesLabel, ELEMENT_WAIT_LONGER_TIME);
  await testPage.waitForSelector(e.blockNoteEditor, ELEMENT_WAIT_LONGER_TIME);
}

// The Markdown import/export options default to disabled, so the notes options
// menu hides them unless the settings are turned on. The menu bakes its items
// when it mounts (opening it does not re-render), so tests that exercise those
// items enable both flags on the running client before opening shared notes.
// They are client-only settings with no create-call parameter to seed them.
export async function enableMarkdownNotesOptions(testPage: Page): Promise<void> {
  await testPage.page.evaluate(() => {
    const { sharedNotes } = (
      globalThis as unknown as {
        meetingClientSettings: { public: { sharedNotes: Record<string, boolean> } };
      }
    ).meetingClientSettings.public;
    sharedNotes.importMarkdownEnabled = true;
    sharedNotes.exportMarkdownEnabled = true;
  });
}

export function getBlockNoteLinkLocator(testPage: Page) {
  return testPage.page.locator(`${e.blockNoteEditor} a`);
}

/**
 * Reads the rendered state of the first <a> link in another user's BlockNote
 * editor, plus whether a remote collaboration cursor is present. Runs via
 * `evaluate` so it never focuses/activates the page (which would blur the
 * cursor owner's editor and stop their awareness cursor from broadcasting).
 */
export function readLinkAndCursorState(testPage: Page) {
  return testPage.page.evaluate(
    ({ sel, wordJoiner }: { sel: string; wordJoiner: string }) => {
      const anchor = document.querySelector(`${sel} a`) as HTMLAnchorElement | null;
      // One `__base` element per remote cursor — count bases only for an accurate count.
      const cursorBases = document.querySelectorAll(`${sel} .bn-collaboration-cursor__base`);
      return {
        linkText: anchor ? (anchor.textContent ?? '') : '',
        linkHref: anchor ? (anchor.getAttribute('href') ?? '') : '',
        linkTextHasWordJoiner: anchor ? (anchor.textContent ?? '').includes(wordJoiner) : false,
        cursorWidgetInsideLink: anchor
          ? !!anchor.querySelector(
              '.bn-collaboration-cursor__base, .bn-collaboration-cursor__caret, .bn-collaboration-cursor__label',
            )
          : false,
        remoteCursorCount: cursorBases.length,
      };
    },
    { sel: e.blockNoteEditor, wordJoiner: WORD_JOINER },
  );
}

// Helpers backported from #25165. On 3.0 the shared-notes sidebar button carries
// data-test="sharedNotes" (renamed to sharedNotesSidebarButton on 4.0), so this
// helper opens the panel via e.sharedNotes to match the 3.0 client.
export async function startSharedNotesBlockNote(testPage: Page) {
  await testPage.waitAndClick(e.sharedNotes);
  await testPage.waitForSelector(e.hideNotesLabel, ELEMENT_WAIT_LONGER_TIME);
  await testPage.hasElement(e.blockNoteEditable, 'should display the BlockNote editor', ELEMENT_WAIT_LONGER_TIME);
}

export function getBlockNoteReadOnlyLocator(testPage: Page) {
  return testPage.page.locator(e.blockNoteReadOnly);
}
