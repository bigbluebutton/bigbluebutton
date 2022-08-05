const { test } = require('@playwright/test');
const { SharedNotes } = require('./sharednotes');

test.describe.parallel('Shared Notes', () => {
  test('Open Shared notes @ci', async ({ browser, page }) => {
    const sharedNotes = new SharedNotes(browser, page);
    await sharedNotes.init(true, true);
    await sharedNotes.openSharedNotes();
  });
  test('Type in shared notes', async ({ browser, page }) => {
    // https://docs.bigbluebutton.org/2.5/release-tests.html#using-shared-notes-panel
    const sharedNotes = new SharedNotes(browser, page);
    await sharedNotes.init(true, true);
    await sharedNotes.typeInSharedNotes();
  });
  test('Formate text in shared notes', async ({ browser, page }) => {
    // https://docs.bigbluebutton.org/2.5/release-tests.html#using-shared-notes-formatting-tools
    const sharedNotes = new SharedNotes(browser, page);
    await sharedNotes.init(true, true);
    await sharedNotes.formatTextInSharedNotes();
  });
  test('Export shared notes', async ({ browser, page }, testInfo) => {
    // https://docs.bigbluebutton.org/2.5/release-tests.html#exporting-shared-notes
    const sharedNotes = new SharedNotes(browser, page);
    await sharedNotes.init(true, true);
    await sharedNotes.exportSharedNotes(testInfo);
  });
});
