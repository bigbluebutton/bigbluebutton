const { test } = require('@playwright/test');
const { Status } = require('./status');

test.describe.parallel('User test suite', () => {
  test('Change status', async ({ page }) => {
    test.fixme();
    const status = new Status(page);
    await status.init(true, true);
    await status.test();
  });
});
