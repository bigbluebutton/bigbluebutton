const { test } = require('@playwright/test');
const { Stress } = require('./stress.js');

test.describe.parallel('Stress', () => {
  test.beforeEach(async () => test.setTimeout(0));

  test('First moderator joining as presenter', async ({ browser, context, page }) => {
    const stress = new Stress(browser, context, page);
    await stress.moderatorAsPresenter();
  });

  test.fixme('All users must receive breakout room invitations', async ({ browser, context, page }) => {
    const stress = new Stress(browser, context, page);
    await stress.breakoutRoomInvitation();
  });

  test.describe.parallel('Joining users at the same time', () => {
    test('Join 2 users (mod and attendee)', async ({ browser, context, page }) => {
      const stress = new Stress(browser, context, page);
      await stress.twoUsersJoinSameTime();
    });

    test('Join 2 users (mod and attendee) keeping the previous one connected', async ({ browser, context, page }) => {
      const stress = new Stress(browser, context, page);
      await stress.usersJoinKeepingConnected();
    });

    test('Join 2 users exceeding max participants limit', async ({ browser, context }) => {
      const stress = new Stress(browser, context);
      await stress.usersJoinExceddingParticipantsLimit();
    });
  });
});
