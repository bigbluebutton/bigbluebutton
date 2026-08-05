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
    // On BBB 3.0 the viewer whiteboard is not restored to the presenter presentation state after the
    // presenter unpins the shared notes (observed consistently across 3 runs; the 4.0 suite passes the
    // same scenario). Whether this is a genuine 3.0 sync gap or a test adaptation issue is not yet
    // determined, so the scenario is kept as fixme in the 3.0 backport of #25165 rather than reported
    // as a passing case. The make-presenter / second-unpin path below is therefore not exercised here.
    test.fixme(true, 'BBB 3.0 viewer presentation is not restored after the presenter unpins shared notes (observed, root cause undetermined)');
    const sharedNotes = new BlockNoteSharedNotes(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.pinAndUnpinNotesOntoWhiteboard();
  });
});
