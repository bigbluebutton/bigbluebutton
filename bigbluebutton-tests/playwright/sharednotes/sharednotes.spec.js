const { test } = require('@playwright/test');
const { SharedNotes } = require('./sharednotes');

test.describe.parallel('Shared Notes', () => {
  test('Open Shared notes @ci', async ({ browser, page, context }) => {
    const sharedNotes = new SharedNotes(browser, context);
    await sharedNotes.initModPage(page);
    await sharedNotes.openSharedNotes();
  });
  test('Type in shared notes', async ({ browser, page, context }) => {
    // https://docs.bigbluebutton.org/2.6/release-tests.html#using-shared-notes-panel
    const sharedNotes = new SharedNotes(browser, context);
    await sharedNotes.initModPage(page);
    await sharedNotes.typeInSharedNotes();
  });
  test('Formate text in shared notes', async ({ browser, page, context }) => {
    // https://docs.bigbluebutton.org/2.6/release-tests.html#using-shared-notes-formatting-tools
    const sharedNotes = new SharedNotes(browser, context);
    await sharedNotes.initModPage(page);
    await sharedNotes.formatTextInSharedNotes();
  });
  test('Export shared notes', async ({ browser, page, context }, testInfo) => {
    // https://docs.bigbluebutton.org/2.6/release-tests.html#exporting-shared-notes
    const sharedNotes = new SharedNotes(browser, context);
    await sharedNotes.initModPage(page);
    await sharedNotes.exportSharedNotes(testInfo);
  });
  test('Convert notes to whiteboard', async ({ browser, page, context }) => {
    const sharedNotes = new SharedNotes(browser, context);
    await sharedNotes.initPages(page);
    await sharedNotes.convertNotesToWhiteboard();
  });
  test('Multi users edit', async ({ browser, page, context }) => {
    const sharedNotes = new SharedNotes(browser, context);
    await sharedNotes.initPages(page);
    await sharedNotes.editSharedNotesWithMoreThanOneUSer();
  });
  test('See notes without edit permission', async ({ browser, page, context }) => {
    const sharedNotes = new SharedNotes(browser, context);
    await sharedNotes.initPages(page);
    await sharedNotes.seeNotesWithoutEditPermission();
  });
  test('Pin notes onto whiteboard', async ({ browser, page, context }) => {
    const sharedNotes = new SharedNotes(browser, context);
    await sharedNotes.initModPage(page);
    await sharedNotes.initUserPage1();
    await sharedNotes.pinNotesOntoWhiteboard();
  });
});
