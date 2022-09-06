const { test } = require('@playwright/test');
const { API } = require('./api.js');

test.describe.parallel('API', () => {

  test('getMeetings / getMeetingInfo', async ({ browser, context, page }) => {
    const api = new API(browser, context, page);
    await api.getMeetingInfo();
  });

});
