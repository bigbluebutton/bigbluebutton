const { test } = require('@playwright/test');
const { VirtualizeList } = require('./virtualize');

test.describe.parallel('Virtualize list', () => {
  test.fixme('Virtualized Users List', async ({ browser, page }) => {
    test.setTimeout(0);
    const virtualizeList = new VirtualizeList(browser, page);
    await virtualizeList.init();
    await virtualizeList.test();
  });
});
