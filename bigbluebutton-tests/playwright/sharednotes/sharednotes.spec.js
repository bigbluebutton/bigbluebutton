const { test } = require('../fixtures');
const { SharedNotes } = require('./sharednotes');
const { initializePages } = require('../core/helpers');
const { fullyParallel } = require('../playwright.config');

test.describe('Shared Notes', () => {
  const sharedNotes = new SharedNotes();

  test.describe.configure({ mode: fullyParallel ? 'parallel' : 'serial' });
  test[fullyParallel ? 'beforeEach' : 'beforeAll'](async ({ browser, browserName }) => {
    test.skip(browserName === 'firefox', 'shared notes in inconsistent on firefox running on @ci')
    await initializePages(sharedNotes, browser, { isMultiUser: true });
  });
  test('Open shared notes @ci', async () => {
    await sharedNotes.openSharedNotes();
  });

  test('Type in shared notes @ci', async () => {
    await sharedNotes.typeInSharedNotes();
  });

  test('Formate text in shared notes @ci', async () => {
    await sharedNotes.formatTextInSharedNotes();
  });

  test('Export shared notes @ci', async ({}, testInfo) => {
    await sharedNotes.exportSharedNotes(testInfo);
  });

  test('Convert notes to presentation @ci', async () => {
    await sharedNotes.convertNotesToWhiteboard();
  });

  test('Multiusers edit', async ({ browserName }) => {
    test.skip(browserName === 'firefox', 'Breaks only on Firefox.(Must see it).');
    await sharedNotes.editSharedNotesWithMoreThanOneUSer();
  });

  test('See notes without edit permission', async () => {
    await sharedNotes.seeNotesWithoutEditPermission();
  });

  test('Pin and unpin notes onto whiteboard @ci', async () => {
    await sharedNotes.pinAndUnpinNotesOntoWhiteboard();
  });
});
