import { type Browser, type BrowserContext, type Page as PlaywrightPage, type TestInfo } from '@playwright/test';

import { isApolloClientExposed } from '../core/apolloProbe';
import { ELEMENT_WAIT_TIME } from '../core/constants';
import { exposeLiveKitRooms, isLiveKit } from '../core/livekit';
import { test } from '../core/setup/fixtures';
import { Listen } from './listen';

// "Listen to breakout" (LiveKit multi-room): a moderator transfers their audio
// into a breakout room to monitor it, then returns to the main room. Server
// state (breakout-listen / primary user_livekit_room memberships) is read through
// the in-page Apollo client (core/apolloProbe); the audible side is asserted via
// the breakout-side talking indicators.
//
// General test strategy:
// - Golden path (ie.: the base use case): the attendee-side talking indicator
//   proves the moderator publishes into the breakout; the moderator's
//   own main-room page showing no isTalking proves the rooms' audio is
//   isolated; and after the return, the moderator must show as talking in main
//   WITHOUT any mute/unmute interaction first.
// - Not-so-golden paths:
//   - Page reloads: assertions that reloads/reconnects persists the listen-in
//     state for the affected moderator
//   - Breakout-end mid-listen must unwind the transfer: cleanup memberships,
//     back in main room, working mic and no toast.
//   - Single-active membership: listening to a second room must converge to
//     exactly one breakout-listen row at a time.
//   - Invalid targets: transferring to invalid room targets should be no-ops
//     for the end user.
//
// See: docs/docs/testing/release-testing.md (Breakout Rooms)

const APOLLO_EXPOSURE_SKIP_REASON =
  'requires window.__APOLLO_CLIENT__ for the LiveKit membership probe ' +
  '(dev bundle or enableApolloDevTools provisioned via clientSettingsOverride)';
const LIVEKIT_SKIP_REASON = 'listen-to-breakout is a LiveKit-only (multi-room) feature';

const initListen = async (
  browser: Browser,
  context: BrowserContext,
  page: PlaywrightPage,
  testInfo: TestInfo,
): Promise<Listen> => {
  test.skip(!isLiveKit, LIVEKIT_SKIP_REASON);
  const listen = new Listen(browser, context);
  // The switch test reads which room holds the microphone straight from the
  // client's room registry, which is only exposed on opt-in, before load.
  await exposeLiveKitRooms(page);
  await listen.initModAndUser(page, testInfo);
  test.skip(!(await isApolloClientExposed(listen.modPage.page, ELEMENT_WAIT_TIME)), APOLLO_EXPOSURE_SKIP_REASON);
  return listen;
};

test.describe('Listen to breakout room', { tag: ['@ci'] }, () => {
  test('moderator listens to a breakout, is heard, and returns to main', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const listen = await initListen(browser, context, page, testInfo);
    await listen.goldenPath();
  });

  test('breakout-listen membership and mic attach survive a client reload', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const listen = await initListen(browser, context, page, testInfo);
    await listen.reloadDuringListen();
  });

  test('ending breakouts mid-listen unwinds the transfer', async ({ browser, context, page }, testInfo) => {
    const listen = await initListen(browser, context, page, testInfo);
    await listen.breakoutEndDuringListen();
  });

  test('listening to a second room switches without two concurrent memberships', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const listen = await initListen(browser, context, page, testInfo);
    await listen.singleActiveAutoSwitch();
  });

  test('a transfer to a nonexistent meeting is rejected without side effects', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const listen = await initListen(browser, context, page, testInfo);
    await listen.adversarialNonexistentTarget();
  });

  test('a self-transfer to the parent meeting keeps the moderator in audio', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const listen = await initListen(browser, context, page, testInfo);
    await listen.adversarialTransferToSelf();
  });
});
