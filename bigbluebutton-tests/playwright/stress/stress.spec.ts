import { test } from '../core/setup/fixtures';
import { Stress } from './stress';

// @ci Note: Stress tests are not intended to be run in CI

// timeouts are several times the usual duration, so a hang fails the test instead of blocking the whole run
test.describe.parallel('Stress', () => {
  test('First moderator joining as presenter', async ({ browser, context, page }, testInfo) => {
    test.setTimeout(15 * 60 * 1000);
    const stress = new Stress(browser, context, page, testInfo);
    await stress.moderatorAsPresenter();
  });

  test('All users must receive breakout room invitations', async ({ browser, context, page }, testInfo) => {
    test.setTimeout(15 * 60 * 1000);
    const stress = new Stress(browser, context, page, testInfo);
    await stress.breakoutRoomInvitation();
  });

  test.describe.parallel('Joining users at the same time', () => {
    test('Join 2 users (mod and attendee)', async ({ browser, context, page }, testInfo) => {
      test.setTimeout(15 * 60 * 1000);
      const stress = new Stress(browser, context, page, testInfo);
      await stress.twoUsersJoinSameTime();
    });

    test('Join 2 users (mod and attendee) keeping the previous one connected', async ({
      browser,
      context,
      page,
    }, testInfo) => {
      test.setTimeout(15 * 60 * 1000);
      const stress = new Stress(browser, context, page, testInfo);
      await stress.usersJoinKeepingConnected();
    });

    test('Join 2 users exceeding max participants limit', async ({ browser, context, page }, testInfo) => {
      test.setTimeout(45 * 60 * 1000);
      const stress = new Stress(browser, context, page, testInfo);
      await stress.usersJoinExceedingParticipantsLimit();
    });
  });
});
