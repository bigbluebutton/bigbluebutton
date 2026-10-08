import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { test } from '../core/setup/fixtures';
import { recordStreamFrames } from '../core/streamRecorder';
import { MultiUsers } from './multiusers';
import { drawArrow, openLockViewers } from './util';

/**
 * A user subscribing to the cursor stream is replayed the last known position of each user, so the
 * whiteboard is populated on arrival rather than staying blank until somebody moves.
 *
 * The "see other viewers' cursors" lock covers viewer cursors only; a moderator's is always
 * visible. The replay therefore has to be filtered per cached row, and the existing suite cannot
 * cover that: `lockSeeOtherViewersCursor` only ever caches a viewer cursor, so it cannot tell a
 * correctly filtered replay from no replay at all.
 */
class CursorReplay extends MultiUsers {
  /**
   * Caches a moderator cursor and a viewer cursor, turns the lock on, then joins a third user.
   * That user is locked on arrival and must be replayed the moderator's cursor and only that one.
   */
  async lockedJoinerStillGetsTheModeratorCursor() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.multiUsersWhiteboardOn);

    // A viewer cursor in the cache: the row the lock must withhold.
    await this.initUserPage();
    await this.userPage.waitForSelector(e.whiteboard);
    await drawArrow(this.userPage);

    // A moderator cursor in the cache: the row the lock does not cover. Drawing rather than
    // moving, because that is what the rest of the suite relies on to produce cursor traffic.
    await drawArrow(this.modPage);

    // Diagnostic before the lock goes on. If an unlocked viewer cannot see the moderator cursor
    // here, no moderator row reached the cache and the assertion below would be measuring the
    // fixture rather than the filtering.
    await this.userPage.hasElementCount(
      e.whiteboardCursorIndicator,
      1,
      'precondition: an unlocked viewer should see the moderator cursor, so one is cached',
    );

    await openLockViewers(this.modPage);
    await this.modPage.waitAndClick(e.participantPermissionsTab);
    await this.modPage.waitAndClickElement(e.hideViewersCursor);
    await this.modPage.waitAndClick(e.applyLockSettings);

    // Asserted on frames, not the DOM. The cached coordinates may legitimately be the
    // off-canvas sentinel (-1,-1) by now, since applying the lock moves the moderator's pointer
    // off the whiteboard - so the DOM would show nothing even though the replay was correct.
    // What is under test is which rows the replay carries.
    const { context } = this.modPage;
    if (!context) throw new Error('no browser context on modPage');
    const raw = await context.newPage();
    const recorder = await recordStreamFrames(raw);
    const lockedJoiner = new Page(this.browser, raw, this.modPage.testInfo);
    const mark = recorder.mark();
    await lockedJoiner.init(false, { fullName: 'LockedJoiner', meetingId: this.modPage.meetingId });
    await lockedJoiner.waitForSelector(e.whiteboard);

    // Polled rather than slept on: the replay is sent once, when the subscription registers, and
    // that moment is not tied to anything observable in the DOM.
    await expect
      .poll(() => recorder.framesSince(mark, 'cursor').length, {
        message: 'a locked viewer joining must still be replayed: 0 frames means the replay was withheld',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBeGreaterThan(0);

    const frames = recorder.framesSince(mark, 'cursor');
    const rows = frames.flatMap((f) => [...f.excerpt.matchAll(/"userId":"([^"]+)"/g)].map((m) => m[1]));
    expect(
      new Set(rows).size,
      `the replay must carry the moderator cursor and not the viewer one; got rows for ${JSON.stringify(rows)}`,
    ).toBe(1);
  }
}

test.describe('Cursor replay on join', { tag: '@ci' }, () => {
  test('Locked viewer joining is replayed the moderator cursor only', async ({ browser, context, page }, testInfo) => {
    test.setTimeout(240_000);
    const cursorReplay = new CursorReplay(browser, context);
    await cursorReplay.initModPage(page, { testInfo });
    await cursorReplay.lockedJoinerStillGetsTheModeratorCursor();
  });
});
