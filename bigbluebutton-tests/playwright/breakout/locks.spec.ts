import { test } from '../core/setup/fixtures';
import { BreakoutLocks, LOCKS_WITHOUT_SWITCH_CREATE_PARAMETER } from './locks';

test.describe.parallel('Breakout lock settings', { tag: '@nightly' }, () => {
  test('Rooms inherit the public chat, notes, user list, cursor, annotation and lock-on-join settings', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const locks = new BreakoutLocks(browser, context);
    await locks.initModPage(page, { createParameter: LOCKS_WITHOUT_SWITCH_CREATE_PARAMETER, testInfo });
    await locks.initUserPage(context, { testInfo });
    await locks.otherLockSettingsFollowInheritance(true);
  });

  test('Rooms do not take the public chat, notes, user list, cursor and annotation settings without inheritance and keep lock-on-join on', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const locks = new BreakoutLocks(browser, context);
    await locks.initModPage(page, { createParameter: LOCKS_WITHOUT_SWITCH_CREATE_PARAMETER, testInfo });
    await locks.initUserPage(context, { testInfo });
    await locks.otherLockSettingsFollowInheritance(false);
  });

  test('Inherited public chat and shared notes locks bind the attendee in the room', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const locks = new BreakoutLocks(browser, context);
    await locks.initPages(page, testInfo);
    await locks.chatAndNotesLocksInRoom(true);
  });

  test('Without inheritance the attendee chats and edits the notes in the room', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const locks = new BreakoutLocks(browser, context);
    await locks.initPages(page, testInfo);
    await locks.chatAndNotesLocksInRoom(false);
  });

  test('Locks the moderator applies in an inheriting room bind the attendee', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const locks = new BreakoutLocks(browser, context);
    await locks.initPages(page, testInfo);
    await locks.locksAppliedInRoomBindAttendee(true);
  });

  test(
    'See other viewers webcams is enforced in a room that inherited it',
    { tag: '@media' },
    async ({ browser, context, page }, testInfo) => {
      const locks = new BreakoutLocks(browser, context);
      await locks.initModPage(page, { testInfo });
      await locks.initUserPage(context, { testInfo });
      await locks.initUserPage2(context, { testInfo });
      await locks.otherViewersWebcamsInRoom(true);
    },
  );

  test(
    'Attendees see each other webcams in a room that did not inherit See other viewers webcams',
    { tag: '@media' },
    async ({ browser, context, page }, testInfo) => {
      const locks = new BreakoutLocks(browser, context);
      await locks.initModPage(page, { testInfo });
      await locks.initUserPage(context, { testInfo });
      await locks.initUserPage2(context, { testInfo });
      await locks.otherViewersWebcamsInRoom(false);
    },
  );
});
