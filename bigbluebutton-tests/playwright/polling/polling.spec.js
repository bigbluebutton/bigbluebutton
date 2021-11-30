const { test } = require('@playwright/test');
const { Polling } = require('./poll');

test.describe.parallel('Polling', () => {
  test('Create Poll', async ({ browser, context, page }) => {
    const test = new Polling(browser, context);
    await test.initPages(page);
    await test.createPoll();
  });

  test('Create anonymous poll', async ({ browser, context, page }) => {
    const test = new Polling(browser, context);
    await test.initPages(page);
    await test.pollAnonymous()
  });

  test('Create quick poll - from the slide', async ({ browser, context, page }) => {
    const test = new Polling(browser, context);
    await test.initPages(page);
    await test.quickPoll();
  });

  test('Create poll with user response', async ({ browser, context, page }) => {
    const test = new Polling(browser, context);
    await test.initPages(page);
    await test.pollUserResponse();
  });

  test('Stop a poll manually', async ({ browser, context, page }) => {
    const test = new Polling(browser, context);
    await test.initPages(page);
    await test.stopPoll();
  });

  test('Poll results in chat message', async ({ browser, context, page }) => {
    const test = new Polling(browser, context);
    await test.initPages(page);
    await test.pollResultsOnChat();
  });

  test('Poll results on whiteboard', async ({ browser, page }) => {
    const test = new Polling(browser);
    await test.initModPage(page);
    await test.pollResultsOnWhiteboard();
  });

  test('Poll results in a different presentation', async ({ browser, page }) => {
    const test = new Polling(browser);
    await test.initModPage(page);
    await test.pollResultsInDifferentPresentation();
  });

  test('Manage response choices', async ({ browser, context, page }) => {
    const test = new Polling(browser, context);
    await test.initPages(page);
    await test.manageResponseChoices();
  });
});