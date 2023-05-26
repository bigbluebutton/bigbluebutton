const { test } = require('@playwright/test');
const { SharedNotes } = require('./sharednotes');

test.describe.parallel('Shared Notes', () => {
  const sharedNotes = new SharedNotes();

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await sharedNotes.initModPage(page, true);
    await sharedNotes.initUserPage1(true);
  });
  test('Open shared notes @ci', async () => {
    await sharedNotes.openSharedNotes();
  });

  test('Type in shared notes', async () => {
    await sharedNotes.typeInSharedNotes();
  });

  test('Formate text in shared notes', async () => {
    await sharedNotes.formatTextInSharedNotes();
  });

  test('Export shared notes', async ({ context }, testInfo) => {
    await sharedNotes.exportSharedNotes(testInfo);
  });

  test('Convert notes to whiteboard', async () => {
    await sharedNotes.convertNotesToWhiteboard();
  });

  test('Multiusers edit', async () => {
    await sharedNotes.editSharedNotesWithMoreThanOneUSer();
  });

  test('See notes without edit permission', async () => {
    await sharedNotes.seeNotesWithoutEditPermission();
  });

  test('Pin notes onto whiteboard', async () => {
    await sharedNotes.pinNotesOntoWhiteboard();
  });
});
