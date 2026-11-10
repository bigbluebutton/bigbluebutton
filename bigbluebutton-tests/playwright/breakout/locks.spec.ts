import { linkIssue } from '../core/helpers';
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

  test('Rooms do not take the public chat, notes, user list, cursor, annotation and lock-on-join settings without inheritance', async ({
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

// keeps @ci, not @nightly: the nightly's @nightly jobs do not leave quarantined tests out
test.describe.parallel('Breakout lock settings', { tag: '@ci' }, () => {
  // Suspected product issue: without inheritance CreateBreakoutRoomsCmdMsgHdlr.scala:104 sends lockOnJoin=false,
  // so the attendee joins the room unlocked (HandlerHelpers.scala:97, locked = lockOnJoin). Locks bind only locked
  // viewers (LockSettingsUtil.scala:96,102, SendGroupChatMessageMsgHdlr.scala:61; in the client
  // chat-message-form/component.tsx:821-830 and video-provider/hooks/index.ts:156), and
  // ChangeLockSettingsInMeetingCmdMsgHdlr never locks the users already in the room. The server also accepts the
  // attendee's public chat messages there.
  test(
    'Locks the moderator applies in a room without inheritance bind the attendee',
    { tag: '@known-issue' },
    async ({ browser, context, page }, testInfo) => {
      linkIssue(26275);
      const locks = new BreakoutLocks(browser, context);
      await locks.initPages(page, testInfo);
      await locks.locksAppliedInRoomBindAttendee(false);
    },
  );
});
