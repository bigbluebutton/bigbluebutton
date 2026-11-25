import { test } from '../core/setup/fixtures';
import { expectMalformedRoomModesRefused, RoomModeCreate } from './roomModeCreate';

test.describe.parallel('Room mode from the create call', { tag: '@ci' }, () => {
  test('Pre-selects the mode from the create and applies it only on start', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const create = new RoomModeCreate(browser, context);
    await create.preSelectsModeFromCreate(page, { testInfo });
  });

  test('Refuses a malformed room mode at create', async ({ request }) => {
    await expectMalformedRoomModesRefused(request);
  });
});

// Edge cases: out of the per-PR gates, run by `npm run test-nightly`.
test.describe.parallel('Room mode from the create call: edge cases', { tag: '@nightly' }, () => {
  test('Applies nothing with the panel off, and tells a later moderator only about their own pick', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const create = new RoomModeCreate(browser, context);
    await create.appliesNothingWithPanelOff(page, { testInfo });
  });

  test('Keeps a mode the client does not offer, with nothing picked', async ({ browser, context, page }, testInfo) => {
    const create = new RoomModeCreate(browser, context);
    await create.keepsUnknownModeWithoutPick(page, { testInfo });
  });
});
