const { test } = require('../fixtures');
const { Stress } = require('./stress.js');

// @ci Note: Stress tests are not intended to be run in CI

test.describe.parallel('Stress', () => {
  test.beforeEach(async () => test.setTimeout(0));

  test('First moderator joining as presenter', async ({ browser, context, page }, testInfo) => {
    const stress = new Stress(browser, context, page, testInfo);
    await stress.moderatorAsPresenter();
  });

  test.fixme('All users must receive breakout room invitations', async ({ browser, context, page }, testInfo) => {
    const stress = new Stress(browser, context, page, testInfo);
    await stress.breakoutRoomInvitation();
  });

  test.describe.parallel('Joining users at the same time', () => {
    test('Join 2 users (mod and attendee)', async ({ browser, context, page }, testInfo) => {
      const stress = new Stress(browser, context, page, testInfo);
      await stress.twoUsersJoinSameTime();
    });

    test('Join 2 users (mod and attendee) keeping the previous one connected', async ({ browser, context, page }, testInfo) => {
      const stress = new Stress(browser, context, page, testInfo);
      await stress.usersJoinKeepingConnected();
    });

    test('Join 2 users exceeding max participants limit', async ({ browser, context }, testInfo) => {
      const stress = new Stress(browser, context, testInfo);
      await stress.usersJoinExceedingParticipantsLimit();
    });
  });
});
