import { test } from '../core/setup/fixtures';
import { PrivateChatRules } from './privateChatRules';

// the private chat lock, set when the meeting starts; lockOnJoin=true (the default) makes it bind the attendees
const PRIVATE_CHAT_LOCK = 'lockSettingsDisablePrivateChat=true&lockSettingsLockOnJoin=true';

test.describe.parallel('Private chat rules on the server', { tag: '@ci' }, () => {
  test('disabledFeatures=privateChat keeps the private chats that involve a moderator', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const rules = new PrivateChatRules(browser, context);
    await rules.initModPage(page, { createParameter: 'disabledFeatures=privateChat', testInfo });
    await rules.initUserPage(context, { testInfo });
    await rules.initUserPage2(context, { testInfo });
    await rules.disabledPrivateChatKeepsModeratorChats();
  });

  test('lockSettingsDisablePrivateChat leaves a locked attendee only the moderator until unlocked', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const rules = new PrivateChatRules(browser, context);
    await rules.initModPage(page, { createParameter: PRIVATE_CHAT_LOCK, testInfo });
    // the meeting runs, so its lock settings were set before this moment
    const lockedSince = Date.now();
    await rules.initUserPage(context, { testInfo });
    await rules.initUserPage2(context, { testInfo });
    await rules.privateChatLockUntilUnlocked(lockedSince);
  });

  test('A private chat lock inherited by a breakout room refuses a chat between attendees in the room', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const rules = new PrivateChatRules(browser, context);
    await rules.initModPage(page, { createParameter: PRIVATE_CHAT_LOCK, testInfo });
    await rules.initUserPage(context, { testInfo });
    await rules.initUserPage2(context, { testInfo });
    await rules.privateChatLockInRoom(true);
  });

  test('Attendees chat privately in a breakout room that did not inherit the private chat lock', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const rules = new PrivateChatRules(browser, context);
    await rules.initModPage(page, { createParameter: PRIVATE_CHAT_LOCK, testInfo });
    await rules.initUserPage(context, { testInfo });
    await rules.initUserPage2(context, { testInfo });
    await rules.privateChatLockInRoom(false);
  });
});
