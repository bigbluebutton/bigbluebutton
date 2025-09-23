const { test } = require('../fixtures');
const { SharedNotes } = require('./sharednotes');
const { initializePages } = require('../core/helpers');
const { fullyParallel } = require('../playwright.config');

test.describe('Shared Notes', { tag: '@ci' }, () => {
  const sharedNotes = new SharedNotes();

  test.describe.configure({ mode: fullyParallel ? 'parallel' : 'serial' });
  test[fullyParallel ? 'beforeEach' : 'beforeAll'](async ({ browser }, testInfo) => {
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

  test('Export shared notes', async ({}, testInfo) => {
    await sharedNotes.exportSharedNotes(testInfo);
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
    test.skip(browserName === 'firefox', 'Webcams does not work properly, due to heavy firefoxx for testing');
    await sharedNotes.pinAndUnpinNotesOntoWhiteboard();
  });
});
