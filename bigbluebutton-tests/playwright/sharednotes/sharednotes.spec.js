const { test } = require('@playwright/test');
const { SharedNotes } = require('./sharednotes');

test.describe.parallel('Shared Notes', () => {
  test('Open Shared notes', async ({ browser, page }) => {
    const sharedNotes = new SharedNotes(browser, page);
    await sharedNotes.init(true, true);
    await sharedNotes.openSharedNotes();
  });
});
