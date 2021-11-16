const { test } = require('@playwright/test');
const { Status } = require('./status');
const { MultiUsers } = require('./multiusers');

test.describe.parallel('User test suite', () => {
  test('Change status', async ({ browser, page }) => {
    test.fixme();
    const status = new Status(browser, page);
    await status.init(true, true);
    await status.test();
  });
  test('User presence check (multiple users)', async ({ browser, context, page }) => {
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    const multiusers = new MultiUsers(browser, page1, page2);
    await multiusers.init(true, true);
    await multiusers.test();
  });
});
