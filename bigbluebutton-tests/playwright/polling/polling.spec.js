const { test } = require('@playwright/test');
const { Polling } = require('./poll');

test.describe.parallel('Polling', () => {
  test('Create Poll', async ({ browser, context, page }) => {
    const polling = new Polling(browser, context);
    await polling.initPages(page);
    await polling.createPoll();
  });

  test('Create anonymous poll', async ({ browser, context, page }) => {
    const polling = new Polling(browser, context);
    await polling.initPages(page);
    await polling.pollAnonymous()
  });

  test('Create quick poll - from the slide', async ({ browser, context, page }) => {
    const polling = new Polling(browser, context);
    await polling.initPages(page);
    await polling.quickPoll();
  });

  test('Create poll with user response', async ({ browser, context, page }) => {
    const polling = new Polling(browser, context);
    await polling.initPages(page);
    await polling.pollUserResponse();
  });

  test('Stop a poll manually', async ({ browser, context, page }) => {
    const polling = new Polling(browser, context);
    await polling.initPages(page);
    await polling.stopPoll();
  });

  test('Poll results in chat message', async ({ browser, context, page }) => {
    const polling = new Polling(browser, context);
    await polling.initPages(page);
    await polling.pollResultsOnChat();
  });

  test('Poll results on whiteboard', async ({ browser, page }) => {
    const polling = new Polling(browser);
    await polling.initModPage(page);
    await polling.pollResultsOnWhiteboard();
  });

  test('Poll results in a different presentation', async ({ browser, page }) => {
    const polling = new Polling(browser);
    await polling.initModPage(page);
    await polling.pollResultsInDifferentPresentation();
  });

  test('Manage response choices', async ({ browser, context, page }) => {
    const polling = new Polling(browser, context);
    await polling.initPages(page);
    await polling.manageResponseChoices();
  });
});
