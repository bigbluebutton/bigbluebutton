import { ELEMENT_WAIT_EXTRA_LONG_TIME } from '../core/constants';
import { test } from '../core/setup/fixtures';
import { EjectedStreams } from './ejectedStreams';

// Three recorded page inits, an eject, and a retry loop budgeted at ELEMENT_WAIT_EXTRA_LONG_TIME*3
// -- all of which scale with MULTIPLIER (2 in CI) while playwright.config.ts's global timeout is a
// flat 3 minutes. Derived from the same constant so a CI run cannot be killed by the global before
// these tests report their own diagnostics. MULTIPLIER itself is not exported.
const SPEC_TIMEOUT = ELEMENT_WAIT_EXTRA_LONG_TIME * 16;

// Coverage for the bbb-graphql-middleware streaming-server authorization gates: once a user is no
// longer in the meeting, a still-open GraphQL socket must stop receiving the four
// middleware-managed subscriptions. Asserted on WebSocket frames rather than in the DOM, because a
// removed client has already unmounted its app subtree and has nowhere to render them.
test.describe.parallel('Ejected user GraphQL streams', { tag: '@ci' }, () => {
  test('Ejected user stops receiving chat, cursor and notification streams', async ({
    browser,
    context,
    page,
    browserName,
  }, testInfo) => {
    test.skip(browserName === 'firefox', 'Frame-level routing is only exercised on chromium in CI.');
    test.setTimeout(SPEC_TIMEOUT);
    const ejected = new EjectedStreams(browser, context);
    await ejected.initModPage(page, { testInfo });
    await ejected.chatCursorAndNotifications();
  });

  test(
    'Ejected user stops receiving the voice activity stream',
    { tag: '@media' },
    async ({ browser, context, page, browserName }, testInfo) => {
      test.skip(browserName === 'firefox', 'Firefox does not support fake audio to simulate the audio.');
      test.setTimeout(SPEC_TIMEOUT);
      const ejected = new EjectedStreams(browser, context);
      await ejected.initModPage(page, { testInfo });
      await ejected.voice();
    },
  );
});
