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
    const multiusers = new MultiUsers(browser, context);
    await multiusers.initPages(page);
    await multiusers.userPresence();
  });
});
