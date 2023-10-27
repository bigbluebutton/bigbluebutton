const { test } = require('@playwright/test');
const { SharedNotes } = require('./sharednotes');

test.describe.parallel('Shared Notes', () => {
  const sharedNotes = new SharedNotes();

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await sharedNotes.initModPage(page, true);
    await sharedNotes.initUserPage(true, context);
  });
  test('Open shared notes @ci', async ({ browserName }) => {
    test.skip(browserName === 'firefox');
    await sharedNotes.openSharedNotes();
  });

  test('Type in shared notes', async () => {
    await sharedNotes.typeInSharedNotes();
  });

  test('Formate text in shared notes', async () => {
    await sharedNotes.formatTextInSharedNotes();
  });

  test('Export shared notes @ci', async ({}, testInfo) => {
    await sharedNotes.exportSharedNotes(testInfo);
  });

  test('Convert notes to whiteboard', async () => {
    await sharedNotes.convertNotesToWhiteboard();
  });

  test('Multiusers edit', async ({ browserName }) => {
    test.skip(browserName === 'firefox', 'Breaks only on Firefox.(Must see it).');
    await sharedNotes.editSharedNotesWithMoreThanOneUSer();
  });

  test('See notes without edit permission', async () => {
    await sharedNotes.seeNotesWithoutEditPermission();
  });

  test('Pin and unpin notes onto whiteboard', async () => {
    await sharedNotes.pinAndUnpinNotesOntoWhiteboard();
  });
});
