const { test } = require('@playwright/test');
const { Draw } = require('./draw');
const { MultiUsers } = require('../user/multiusers');

test.describe.parallel('Whiteboard @ci', () => {
  test('Draw rectangle', async ({ browser, page }) => {
    const draw = new Draw(browser, page);
    await draw.init(true, true);
    await draw.test();
  })

  test('Give Additional Whiteboard Access', async ({ browser, context, page }) => {
    const multiusers = new MultiUsers(browser, context);
    await multiusers.initPages(page);
    await multiusers.whiteboardAccess();
  });
});
