import { expect, Locator } from '@playwright/test';

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

export async function hoverBlockNoteLink(testPage: Page): Promise<void> {
  const link = getBlockNoteLinkLocator(testPage);
  const rect = await link.evaluate((element) => {
    const clientRect = element.getClientRects()[0];
    return {
      x: clientRect.x,
      y: clientRect.y,
      width: clientRect.width,
      height: clientRect.height,
    };
  });
  await testPage.page.mouse.move(rect.x + 5, rect.y + rect.height / 2);
  await testPage.page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2, { steps: 5 });
  await testPage.page.locator(e.blockNoteLinkToolbar).waitFor({ timeout: ELEMENT_WAIT_LONGER_TIME });
}

// Collects every uncaught exception raised by the client from now on. The array is
// filled asynchronously, so it must be read *after* the interaction under test.
export function collectPageErrors(testPage: Page): string[] {
  const pageErrors: string[] = [];
  testPage.page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });
  return pageErrors;
}

// BlockNote renders the drag/plus handles (`.bn-side-menu`) and the table row/column
// grips (`.bn-table-handle`) floating inside the editor's left padding, i.e. inside
// the very band this helper clicks. Their positions depend on the theme's paddings,
// so they are measured at runtime and excluded instead of hardcoding pixel offsets.
const FLOATING_HANDLES_SELECTOR = '.bn-side-menu, .bn-table-handle';
// Keep a small gap from the handles and from the block content itself, so a click always
// lands on the editor's empty margin and never on a neighbouring target. It has to stay
// tight: next to a top-level block the handles leave only a few pixels of empty margin
// (the upstream issue describes exactly that — "click the empty space, avoid the plus
// sign or the drag icon"), while a nested block leaves a much wider band.
const MARGIN_CLICK_GAP = 2;
// Comfortably past the browser's double-click interval (~500ms), so each margin click is
// registered on its own instead of as the second/third click of a multi-click.
const DOUBLE_CLICK_RESET_TIME = 700;

/**
 * Clicks the empty space in the editor's left margin, level with `blockContent`.
 *
 * This is the interaction from BlockNote issue #2748 (BBB #25076): the click lands in
 * the editor's padding, so ProseMirror puts the selection *before* the block instead of
 * inside it.
 */
export async function clickEditorLeftMargin(testPage: Page, blockContent: Locator): Promise<void> {
  // Hovering the block is what makes the floating handles render, so they can only be
  // measured (and avoided) after the pointer is over the target block.
  await blockContent.hover();

  const editorBox = await testPage.page.locator(e.blockNoteEditor).boundingBox();
  const blockBox = await blockContent.boundingBox();
  expect(editorBox, 'the BlockNote editor should be visible').not.toBeNull();
  expect(blockBox, 'the target block should be visible').not.toBeNull();

  const handles = testPage.page.locator(FLOATING_HANDLES_SELECTOR);
  const handleBoxes = await handles.all().then((locators) => Promise.all(locators.map((h) => h.boundingBox())));
  const blockedFrom = handleBoxes.reduce(
    (leftmost, box) => (box && box.width > 0 && box.x < leftmost ? box.x : leftmost),
    blockBox!.x,
  );

  const firstX = editorBox!.x + 1;
  const lastX = blockedFrom - MARGIN_CLICK_GAP;
  expect(
    lastX,
    'the editor left margin should expose empty space to click (left of the block and of its handles)',
  ).toBeGreaterThan(firstX);

  // Level with the top row of the block: for a table that is its first row, which is
  // where the reported crash happens.
  const y = blockBox!.y + Math.min(blockBox!.height / 2, 12);
  // eslint-disable-next-line no-restricted-syntax
  for (const x of [firstX, (firstX + lastX) / 2, lastX]) {
    // Each position must land as a *single* click: consecutive clicks in the same spot
    // are coalesced by the browser into double/triple clicks, which select a word or the
    // whole block instead of placing the caret before it. Parking the pointer elsewhere
    // and waiting past the double-click interval keeps every click a fresh one.
    // eslint-disable-next-line no-await-in-loop
    await testPage.page.mouse.move(editorBox!.x + editorBox!.width / 2, y);
    // eslint-disable-next-line no-await-in-loop
    await testPage.page.waitForTimeout(DOUBLE_CLICK_RESET_TIME);
    // eslint-disable-next-line no-await-in-loop
    await testPage.page.mouse.click(x, y);
  }
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
