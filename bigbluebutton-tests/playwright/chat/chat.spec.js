const { test } = require('@playwright/test');
const { Send } = require('./send');
const { Clear } = require('./clear');
const { Save } = require('./save');

test.describe.parallel('Chat test suite', () => {
  test('Send public message', async ({ page }) => {
    const send = new Send(page);
    await send.init(true, true);
    await send.test();
  });
  
  test('Clear chat', async ({ page }) => {
    const clear = new Clear(page);
    await clear.init(true, true);
    await clear.test();
  });

  test('Save chat', async ({ page }) => {
    test.fixme();
    const save = new Save(page);
    await save.init(true, true);
    await save.test();
  });
});