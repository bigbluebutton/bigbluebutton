import { initializePages } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { SharedNotes } from './sharednotes';

test.describe.parallel('Shared Notes', { tag: '@ci' }, () => {
  let sharedNotes: SharedNotes;

  test.beforeEach(async ({ browser, context }, testInfo) => {
    sharedNotes = new SharedNotes(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, testInfo });
  });

  test('Open shared notes', async () => {
    await sharedNotes.openSharedNotes();
  });

  test('Type in shared notes', async ({ browserName }) => {
    test.skip(browserName === 'firefox', 'Firefox has different fonts on local and ci');
    await sharedNotes.typeInSharedNotes();
  });

  test('Formate text in shared notes', async () => {
    await sharedNotes.formatTextInSharedNotes();
  });

  test('Export shared notes', async () => {
    await sharedNotes.exportSharedNotes();
  });

  test('Convert notes to presentation', async () => {
    await sharedNotes.convertNotesToWhiteboard();
  });

  test('Multiusers edit', async () => {
    await sharedNotes.editSharedNotesWithMoreThanOneUSer();
  });

  test('See notes without edit permission', async () => {
    await sharedNotes.seeNotesWithoutEditPermission();
  });

  // different failures in CI and local
  // local: not able to click on "unpin" button
  // CI: not restoring presentation for viewer after unpinning notes
  test('Pin and unpin notes onto whiteboard', async ({ browserName }) => {
    test.skip(browserName === 'firefox', 'Webcams does not work properly, due to heavy firefox for testing');
    await sharedNotes.pinAndUnpinNotesOntoWhiteboard();
  });
});
