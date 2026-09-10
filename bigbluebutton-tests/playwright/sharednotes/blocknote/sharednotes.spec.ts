import { initializePages, linkIssue } from '../../core/helpers';
import { test } from '../../core/setup/fixtures';
import { BlockNoteSharedNotes } from './sharednotes';

const CREATE_PARAMETER = 'sharedNotesEditor=blockNote';

test.describe.parallel('Shared Notes - BlockNote', { tag: '@ci' }, () => {
  test('Open shared notes', async ({ browser, context }, testInfo) => {
    const sharedNotes = new BlockNoteSharedNotes(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.openSharedNotes();
  });

  test('Type in shared notes', async ({ browser, context }, testInfo) => {
    const sharedNotes = new BlockNoteSharedNotes(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.typeInSharedNotes();
  });

  test('Type fractions without opening the slash menu', async ({ browser, context }, testInfo) => {
    linkIssue(25577);
    const sharedNotes = new BlockNoteSharedNotes(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.typeFractionsWithoutOpeningSlashMenu();
  });

  test('Format text in shared notes', async ({ browser, context }, testInfo) => {
    const sharedNotes = new BlockNoteSharedNotes(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.formatTextInSharedNotes();
  });

  test('Export shared notes as PDF', async ({ browser, context, browserName }, testInfo) => {
    test.skip(browserName === 'firefox', 'window.open popup handling differs on Firefox');
    const sharedNotes = new BlockNoteSharedNotes(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.exportSharedNotesAsPDF();
  });

  test('Export empty shared notes as PDF returns a PDF, not an error', async ({ browser, context }, testInfo) => {
    linkIssue(25122);
    const sharedNotes = new BlockNoteSharedNotes(browser, context);
    await initializePages(sharedNotes, browser, { createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.exportEmptyNotesAsPDF();
  });

  test('Convert notes to presentation', async ({ browser, context }, testInfo) => {
    const sharedNotes = new BlockNoteSharedNotes(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.convertNotesToWhiteboard();
  });

  test('Multiusers edit', async ({ browser, context }, testInfo) => {
    const sharedNotes = new BlockNoteSharedNotes(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.editSharedNotesWithMoreThanOneUser();
  });

  test('See notes without edit permission', async ({ browser, context }, testInfo) => {
    const sharedNotes = new BlockNoteSharedNotes(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.seeNotesWithoutEditPermission();
  });

  // different failures in CI and local
  // local: not able to click on "unpin" button
  // CI: not restoring presentation for viewer after unpinning notes
  test('Pin and unpin notes onto whiteboard', async ({ browser, context, browserName }, testInfo) => {
    test.skip(browserName === 'firefox', 'Webcams does not work properly, due to heavy firefox for testing');
    const sharedNotes = new BlockNoteSharedNotes(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.pinAndUnpinNotesOntoWhiteboard();
  });

  test('Pinned header exposes permitted notes actions', async ({ browser, context, browserName }, testInfo) => {
    linkIssue(25584);
    test.skip(browserName === 'firefox', 'Webcams does not work properly, due to heavy firefox for testing');
    const sharedNotes = new BlockNoteSharedNotes(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.pinnedHeaderActions();
  });

  test('Unread indicator notifies users of new notes content', async ({ browser, context }, testInfo) => {
    const sharedNotes = new BlockNoteSharedNotes(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.unreadNotesIndicator();
  });
});
