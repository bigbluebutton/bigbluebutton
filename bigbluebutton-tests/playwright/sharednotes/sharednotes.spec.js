const { test } = require('@playwright/test');
const SharedNotes = require('./sharednotes');

test.describe.parallel('Shared Notes', () => {
  test('Open Shared notes', async ({ browser, context, page }) => {
    const test = new SharedNotes(browser, page);
    await test.init(true, true);
    await test.openSharedNotes();
  })
})