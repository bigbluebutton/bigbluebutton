const { test } = require('@playwright/test');
const { Send } = require('./send');
const { Clear } = require('./clear');
const { Save } = require('./save');

test.describe.parallel('Chat test suite', () => {
  test('Send public message', async ({ browser, page }) => {
    const send = new Send(browser, page);
    await send.init(true, true);
    await send.test();
  });
  
  test('Clear chat', async ({ browser, page }) => {
    const clear = new Clear(browser, page);
    await clear.init(true, true);
    await clear.test();
  });

  test('Save chat', async ({ browser, page }) => {
    test.fixme();
    const save = new Save(browser, page);
    await save.init(true, true);
    await save.test();
  });
});
