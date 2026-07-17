import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { test } from '../core/setup/fixtures';
import { constants as c } from '../parameters/constants';

// Regression test for the recording-timer clock-skew bug (issue #25312).
// When the moderator's system clock is ahead of the server, the recording timer used to
// jump straight to the clock offset (e.g. "14:00") right after Start Recording, instead of
// starting at "00:00". The recording itself was always correct - only the displayed timer
// was wrong, because the timeSync skew was clamped to a non-negative value and could not
// correct a client-ahead clock.
const CLOCK_SKEW_MINUTES = 14;
const CLOCK_SKEW_MS = CLOCK_SKEW_MINUTES * 60 * 1000;

test.describe('Recording timer', { tag: '@ci' }, () => {
  test('should start at zero when the moderator clock is ahead of the server', async ({ browser, page }) => {
    // Simulate a moderator whose system clock is 14 minutes ahead of the server.
    // This must run before any navigation so the client sees the skewed clock from the
    // very first script it executes.
    await page.addInitScript((skewMs) => {
      const RealDate = Date;
      const realNow = RealDate.now.bind(RealDate);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      class SkewedDate extends RealDate {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(...args: any[]) {
          if (args.length === 0) {
            super(realNow() + skewMs);
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            super(...(args as []));
          }
        }

        static now(): number {
          return realNow() + skewMs;
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Date = SkewedDate;
    }, CLOCK_SKEW_MS);

    const modPage = new Page(browser, page);
    await modPage.init(true, { fullName: 'Moderator', createParameter: c.recordMeeting });

    // Give the RTT worker time to send its first round-trip to /rtt-check.
    // The timeSync skew is only set after the first RTT message arrives; without
    // this wait the timer shows the raw client clock offset until the worker kicks in.
    await modPage.page.waitForTimeout(5000);

    // start recording
    const recordingIndicatorButton = modPage.page.locator(`${e.recordingIndicator} button`);
    await modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await modPage.hasElement(e.recordingIndicator, 'should display the recording indicator once joined');
    await modPage.waitAndClick(e.recordingIndicator);
    await modPage.hasElement(e.simpleModal, 'should display the recording modal');
    await modPage.hasElement(e.yesButton, 'should display the "Yes" button in the recording modal');
    await modPage.waitAndClick(e.yesButton);
    await expect(
      recordingIndicatorButton,
      'recording indicator button should have a red background color when recording',
    ).toHaveCSS('background-color', 'rgb(174, 16, 16)');

    // The timer must start near 0:00. With the clock-skew bug it shows ~14:00 instead,
    // because the clamped (>= 0) skew leaves the client's clock offset baked into the
    // elapsed time. The skew correction is applied asynchronously after the first RTT
    // round-trip, so we poll until the timer reflects the corrected value.
    await expect
      .poll(
        async () => {
          const text = await recordingIndicatorButton.textContent();
          const match = text?.match(/(\d{1,2}):(\d{2})/);
          if (!match) return Infinity;
          return Number(match[1]) * 60 + Number(match[2]);
        },
        {
          timeout: 15000,
          message: 'recording timer should start near 0:00 after skew correction',
        },
      )
      .toBeLessThan(60);

    // capture evidence of the displayed timer (named per run via EVIDENCE_TAG)
    const evidenceTag = process.env.EVIDENCE_TAG || 'recording-timer';
    await modPage.page.screenshot({ path: `/tmp/evidence/${evidenceTag}.png` });
  });
});
