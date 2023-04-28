const { test } = require('@playwright/test');
const { Polling } = require('./poll');


test.describe.serial('Polling', () => {
  const polling = new Polling();
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await polling.initModPage(page, true);
    await polling.initUserPage(true, context);
  });

  // Manage
  test('Create poll @ci', async () => {
    await polling.createPoll();
  });

  test('Create anonymous poll @ci', async () => {
    await polling.pollAnonymous();
  });

  test('Create quick poll - from the slide', async () => {
    await polling.quickPoll();
  });

  test('Create poll with user response @ci', async () => {
    await polling.pollUserResponse();
  });

  test('Stop a poll manually @ci', async () => {
    await polling.stopPoll();
  });

  test('Manage response choices', async () => {
    await polling.manageResponseChoices();
  });

  test('Not able to start new poll without presentation', async () => {
    await polling.notAbleStartNewPollWithoutPresentation();
  });
});

/*
test.describe.parallel('Polling', () => {
  test.describe.parallel('Manage', () => {
    test('Not able to start new poll without presentation', async ({ browser, context, page }) => {
      const polling = new Polling(browser, context);
      await polling.initPages(page);
      await polling.notAbleStartNewPollWithoutPresentation();
    });

    test('Custom input', async ({ browser, context, page }) => {
      const polling = new Polling(browser, context);
      await polling.initPages(page);
      await polling.customInput();
    });

    test('Allow multiple choices', async ({ browser, context, page }) => {
      const polling = new Polling(browser, context);
      await polling.initPages(page);
      await polling.allowMultipleChoices();
    });

    test('Smart slides questions', async ({ browser, context, page }) => {
      const polling = new Polling(browser, context);
      await polling.initPages(page);
      await polling.smartSlidesQuestions();
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
*/