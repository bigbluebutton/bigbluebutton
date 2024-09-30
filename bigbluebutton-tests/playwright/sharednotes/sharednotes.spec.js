const { test } = require('../fixtures');
const { SharedNotes } = require('./sharednotes');
const { linkIssue, initializePages } = require('../core/helpers');
const { fullyParallel } = require('../playwright.config');

test.describe('Shared Notes', () => {
  const sharedNotes = new SharedNotes();

  test.describe.configure({ mode: fullyParallel ? 'parallel' : 'serial' });
  test[fullyParallel ? 'beforeEach' : 'beforeAll'](async ({ browser }) => {
    await initializePages(sharedNotes, browser, { isMultiUser: true });
  });

  test('Open shared notes', { tag: '@ci' }, async () => {
    await sharedNotes.openSharedNotes();
  });

  test('Type in shared notes', { tag: '@ci' }, async () => {
    await sharedNotes.typeInSharedNotes();
  });

  test('Formate text in shared notes', { tag: '@ci' }, async () => {
    await sharedNotes.formatTextInSharedNotes();
  });

  test('Export shared notes', { tag: '@ci' }, async ({}, testInfo) => {
    await sharedNotes.exportSharedNotes(testInfo);
  });

  test('Convert notes to presentation', { tag: '@ci' }, async () => {
    await sharedNotes.convertNotesToWhiteboard();
  });

  test('Multiusers edit', async () => {
    await sharedNotes.editSharedNotesWithMoreThanOneUSer();
  });

  test('See notes without edit permission', async () => {
    await sharedNotes.seeNotesWithoutEditPermission();
  });

  test('Pin and unpin notes onto whiteboard', { tag: [ '@ci', '@flaky' ] }, async () => {
    linkIssue('20892');
    await sharedNotes.pinAndUnpinNotesOntoWhiteboard();
  });
});
