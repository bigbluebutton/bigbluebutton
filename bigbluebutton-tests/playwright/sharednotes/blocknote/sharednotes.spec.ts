import { initializePages } from '../../core/helpers';
import { test } from '../../core/setup/fixtures';
import { SharedNotesBlockNote } from './sharednotes';

const CREATE_PARAMETER = 'sharedNotesEditor=blockNote';

test.describe.parallel('Shared Notes - BlockNote', { tag: '@ci' }, () => {
  test('Open shared notes', async ({ browser, context }, testInfo) => {
    const sharedNotes = new SharedNotesBlockNote(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.openSharedNotes();
  });

  test('Type in shared notes', async ({ browser, context }, testInfo) => {
    const sharedNotes = new SharedNotesBlockNote(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.typeInSharedNotes();
  });

  test('Format text in shared notes', async ({ browser, context }, testInfo) => {
    const sharedNotes = new SharedNotesBlockNote(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.formatTextInSharedNotes();
  });

  test('Export shared notes as PDF', async ({ browser, context, browserName }, testInfo) => {
    test.skip(browserName === 'firefox', 'window.open popup handling differs on Firefox');
    const sharedNotes = new SharedNotesBlockNote(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.exportSharedNotesAsPDF();
  });

  test('Convert notes to presentation', async ({ browser, context }, testInfo) => {
    const sharedNotes = new SharedNotesBlockNote(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.convertNotesToWhiteboard();
  });

  test('Multiusers edit', async ({ browser, context }, testInfo) => {
    const sharedNotes = new SharedNotesBlockNote(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.editSharedNotesWithMoreThanOneUser();
  });

  test('See notes without edit permission', async ({ browser, context }, testInfo) => {
    const sharedNotes = new SharedNotesBlockNote(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.seeNotesWithoutEditPermission();
  });

  // different failures in CI and local
  // local: not able to click on "unpin" button
  // CI: not restoring presentation for viewer after unpinning notes
  test('Pin and unpin notes onto whiteboard', async ({ browser, context, browserName }, testInfo) => {
    test.skip(browserName === 'firefox', 'Webcams does not work properly, due to heavy firefox for testing');
    const sharedNotes = new SharedNotesBlockNote(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.pinAndUnpinNotesOntoWhiteboard();
  });
});
