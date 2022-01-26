const { test } = require('@playwright/test');
const { Stress } = require('./stress.js');

test.describe.parallel('Stress', () => {
  test.beforeEach(async () => test.setTimeout(0));

  test('First moderator joining as presenter', async ({ browser, context, page }) => {
    const stress = new Stress(browser, context, page);
    await stress.moderatorAsPresenter();
  });

  test('All users must receive breakout room invitations', async ({ browser, context, page }) => {
    const stress = new Stress(browser, context, page);
    await stress.breakoutRoomInvitation();
  });
});
