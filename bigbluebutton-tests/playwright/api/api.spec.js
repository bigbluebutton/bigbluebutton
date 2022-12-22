const { test } = require('@playwright/test');
const { API } = require('./api.js');

test.describe.parallel('API', () => {

  test('getMeetings', async ({ browser, context, page }) => {
    const api = new API(browser, context, page);
    await api.testGetMeetings();
  });

  test('getMeetingInfo', async ({ browser, context, page }) => {
    const api = new API(browser, context, page);
    await api.testGetMeetingInfo();
  });

});
