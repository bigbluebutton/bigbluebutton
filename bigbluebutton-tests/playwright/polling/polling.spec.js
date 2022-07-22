const { test } = require('@playwright/test');
const { Polling } = require('./poll');

test.describe.parallel('Polling', () => {
  test.describe.parallel('Manage', () => {
    test('Create Poll @ci', async ({ browser, context, page }) => {
      const polling = new Polling(browser, context);
      await polling.initPages(page, true);
      await polling.createPoll();
    });

    // https://docs.bigbluebutton.org/2.5/release-tests.html#start-an-anonymous-poll-automated
    test('Create anonymous poll @ci', async ({ browser, context, page }) => {
      const polling = new Polling(browser, context);
      await polling.initPages(page);
      await polling.pollAnonymous();
    });

    // https://docs.bigbluebutton.org/2.5/release-tests.html#quick-poll-option-automated
    test('Create quick poll - from the slide', async ({ browser, context, page }) => {
      const polling = new Polling(browser, context);
      await polling.initPages(page);
      await polling.quickPoll();
    });

    test('Create poll with user response @ci', async ({ browser, context, page }) => {
      const polling = new Polling(browser, context);
      await polling.initPages(page);
      await polling.pollUserResponse();
    });

    test('Stop a poll manually @ci', async ({ browser, context, page }) => {
      const polling = new Polling(browser, context);
      await polling.initPages(page);
      await polling.stopPoll();
    });

    test('Manage response choices @ci', async ({ browser, context, page }) => {
      const polling = new Polling(browser, context);
      await polling.initPages(page);
      await polling.manageResponseChoices();
    });
  });

  test.describe.parallel('Results', () => {
    test('Poll results in chat message @ci', async ({ browser, context, page }) => {
      const polling = new Polling(browser, context);
      await polling.initPages(page);
      await polling.pollResultsOnChat();
    });

    test('Poll results on whiteboard @ci', async ({ browser, page }) => {
      const polling = new Polling(browser);
      await polling.initModPage(page);
      await polling.pollResultsOnWhiteboard();
    });

    test('Poll results in a different presentation', async ({ browser, page }) => {
      const polling = new Polling(browser);
      await polling.initModPage(page);
      await polling.pollResultsInDifferentPresentation();
    });
  });
});
