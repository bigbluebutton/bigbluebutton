const { test } = require('../fixtures');
const { SharedNotes } = require('./sharednotes');
const { initializePages } = require('../core/helpers');
const { fullyParallel } = require('../playwright.config');

test.describe('Shared Notes', { tag: '@ci' }, () => {
  const sharedNotes = new SharedNotes();

  test.describe.configure({ mode: fullyParallel ? 'parallel' : 'serial' });
  test[fullyParallel ? 'beforeEach' : 'beforeAll'](async ({ browser, browserName }) => {
    test.skip(browserName === 'firefox', 'shared notes in inconsistent on firefox running on @ci')
    await initializePages(sharedNotes, browser, { isMultiUser: true });
  });
<<<<<<< HEAD
  test('Open shared notes @ci', async () => {
=======

  test('Open shared notes', async () => {
>>>>>>> upstream/v3.0.x-release
    await sharedNotes.openSharedNotes();
  });

  test('Type in shared notes', async () => {
    await sharedNotes.typeInSharedNotes();
  });

  test('Formate text in shared notes', async () => {
    await sharedNotes.formatTextInSharedNotes();
  });

  test('Export shared notes', async ({}, testInfo) => {
    await sharedNotes.exportSharedNotes(testInfo);
  });

  test('Convert notes to presentation', async () => {
    await sharedNotes.convertNotesToWhiteboard();
  });

  test('Multiusers edit', async ({ browserName }) => {
    test.skip(browserName === 'firefox', 'Breaks only on Firefox.(Must see it).');
    await sharedNotes.editSharedNotesWithMoreThanOneUSer();
  });

  test('See notes without edit permission', async () => {
    await sharedNotes.seeNotesWithoutEditPermission();
  });

  // different failures in CI and local
  // local: not able to click on "unpin" button
  // CI: not restoring presentation for viewer after unpinning notes
  test('Pin and unpin notes onto whiteboard', async () => {
    await sharedNotes.pinAndUnpinNotesOntoWhiteboard();
  });
});
