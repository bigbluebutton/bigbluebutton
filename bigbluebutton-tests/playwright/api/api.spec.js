const { test } = require('../fixtures');
const { API } = require('./api.js');
const { APIBreakout } = require('./breakout.js');

test.describe.parallel('API', () => {
  test('getMeetings', async ({ browser, context, page }, testInfo) => {
    const api = new API(browser, context, page, testInfo);
    await api.testGetMeetings();
  });

  test('getMeetingInfo', async ({ browser, context, page }, testInfo) => {
    const api = new API(browser, context, page, testInfo);
    await api.testGetMeetingInfo();
  });

  test('breakoutWithoutParent', async ({ browser, context }) => {
    const api = new APIBreakout(browser, context);
    await api.testBreakoutWithoutParent();
  });

  test('breakoutWithoutSequenceNumber', async ({ browser, context, page }) => {
    const api = new APIBreakout(browser, context);
    await api.initModPage(page);
    await api.testBreakoutWithoutSequenceNumber();
  });

  test('breakoutWithNonexistentParent', async ({ browser, context }) => {
    const api = new APIBreakout(browser, context);
    await api.testBreakoutWithNonexistentParent();
  });

  test('breakoutMeetingInfo', async ({ browser, context, page }, testInfo) => {
    const api = new APIBreakout(browser, context);
    await api.initPages(page, testInfo);
    await api.create();
    await api.testBreakoutMeetingInfoNoJoins();
    await api.joinRoom();
    await api.testBreakoutMeetingInfoOneJoin();
  });
});
