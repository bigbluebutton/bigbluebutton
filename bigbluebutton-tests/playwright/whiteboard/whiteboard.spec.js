const { test } = require('@playwright/test');
const Draw = require('./draw');
const { MultiUsers } = require('../user/multiusers');

test.describe.parallel('Whiteboard', () => {
  test('Draw rectangle', async ({ browser, page }) => {
    const draw = new Draw(browser, page);
    await draw.init(true, true);
    await draw.test();
  })

  test('Give Additional Whiteboard Access', async ({ browser, context }) => {
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    const multiusers = new MultiUsers(browser, page1, page2);
    await multiusers.init();
    await multiusers.whiteboardAccess();
  });
});