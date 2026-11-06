import { expect, Locator } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { ClientSettingsOverrides, Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';

// Recording breakout rooms is offered only when the client settings allow it; breakoutRoomsRecord then decides.
export const OFFER_BREAKOUT_RECORDING_SETTINGS: ClientSettingsOverrides = {
  public: { app: { breakouts: { offerRecordingForBreakouts: true } } },
};

const RECORDING_CONTROL = `${e.recordingIndicator} button`;
// Recorded time the moderator's stop attempt is followed for: long enough for a stop to reach the server and back.
const STILL_RECORDING_SECONDS = 2;

// Recorded time shown by the indicator, or null while it shows none (not recording).
async function recordedSeconds(button: Locator): Promise<number | null> {
  const match = (await button.textContent())?.match(/(\d+):(\d+)/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

// A recorded meeting renders the indicator for everyone, but hides it from a user who cannot record until
// a recording exists. It is found in the page first, so that the hidden check cannot pass before it renders.
async function hasHiddenRecordingControl(testPage: Page, description: string) {
  await expect(
    testPage.page.locator(RECORDING_CONTROL),
    'should render the recording indicator of a recorded meeting',
  ).toBeAttached({ timeout: ELEMENT_WAIT_LONGER_TIME });
  await testPage.wasRemoved(RECORDING_CONTROL, description);
}

export class RecordingParameters extends MultiUsers {
  async recordingStartsOnJoin() {
    const modIndicator = this.modPage.page.locator(RECORDING_CONTROL);
    await expect(
      modIndicator,
      'should offer the moderator to pause the recording that started on join',
    ).toHaveAttribute('aria-label', 'Pause recording', { timeout: ELEMENT_WAIT_LONGER_TIME });
    await expect(modIndicator, 'should show the recorded time to the moderator').toHaveText(/\d+:\d+/);
  }

  async noRecordingControl() {
    await hasHiddenRecordingControl(this.modPage, 'should not show the moderator a control to start recording');
  }

  async recordingCannotBeStopped() {
    const modIndicator = this.modPage.page.locator(RECORDING_CONTROL);
    await expect(
      modIndicator,
      'should tell the moderator the meeting is recording, not offer to pause it',
    ).toHaveAttribute('aria-label', 'Recording', { timeout: ELEMENT_WAIT_LONGER_TIME });
    await this.modPage.hasElementDisabled(
      RECORDING_CONTROL,
      'should not let the moderator use the recording indicator',
    );
    await expect(modIndicator, 'should show the recorded time to the moderator').toHaveText(/\d+:\d+/);
    const recordedBeforeAttempt = await recordedSeconds(modIndicator);
    if (recordedBeforeAttempt === null) throw new Error('the recording timer disappeared before the stop attempt');

    // the click that opens the pause confirmation when the moderator may stop the recording
    await this.modPage.waitAndClick(e.recordingIndicator);
    await expect
      .poll(() => recordedSeconds(modIndicator), {
        message: 'should keep the recording timer running after the click',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBeGreaterThanOrEqual(recordedBeforeAttempt + STILL_RECORDING_SECONDS);
    await this.modPage.wasRemoved(e.confirmRecordingButton, 'should not ask the moderator to confirm a pause');
    await expect(modIndicator, 'should still show the meeting as recording').toHaveAttribute('aria-label', 'Recording');
  }

  async recordPermissionDeniedForOneModerator() {
    await this.modPage2.hasElementEnabled(RECORDING_CONTROL, 'should give the second moderator the recording control');
    await expect(
      this.modPage2.page.locator(RECORDING_CONTROL),
      'should offer the second moderator to start recording',
    ).toHaveAttribute('aria-label', 'Start recording');
    await hasHiddenRecordingControl(
      this.modPage,
      'should not show a recording control to the moderator without record permission',
    );
  }

  async viewerStartsRecording() {
    const userIndicator = this.userPage.page.locator(RECORDING_CONTROL);
    const modIndicator = this.modPage.page.locator(RECORDING_CONTROL);
    await this.userPage.hasElementEnabled(RECORDING_CONTROL, 'should give the attendee the recording control');
    await expect(userIndicator, 'should offer the attendee to start recording').toHaveAttribute(
      'aria-label',
      'Start recording',
    );
    await this.userPage.waitAndClick(e.recordingIndicator);
    await this.userPage.waitAndClick(e.confirmRecordingButton);

    await expect(modIndicator, 'should show the moderator the recording the attendee started').toHaveAttribute(
      'aria-label',
      'Pause recording',
    );
    await expect(modIndicator, 'should show the recorded time to the moderator').toHaveText(/\d+:\d+/);
    await expect(userIndicator, 'should offer the attendee to pause the recording').toHaveAttribute(
      'aria-label',
      'Pause recording',
    );
  }

  async customRecordPermissionTooltip(tooltip: string) {
    const userIndicator = this.userPage.page.locator(RECORDING_CONTROL);
    await hasHiddenRecordingControl(
      this.userPage,
      'should not show the indicator to the attendee before any recording',
    );

    await this.modPage.waitAndClick(e.recordingIndicator);
    await this.modPage.waitAndClick(e.confirmRecordingButton);
    await this.modPage.wasRemoved(e.confirmRecordingButton, 'should close the confirmation once recording starts');
    // The attendee's indicator stays hidden until it has counted some recorded time.
    await this.userPage.hasElement(RECORDING_CONTROL, 'should show the attendee the indicator once recording');
    await expect(userIndicator, 'should tell the attendee the meeting is recording').toHaveAttribute(
      'aria-label',
      'Recording',
    );

    await this.modPage.waitAndClick(e.recordingIndicator);
    await this.modPage.hasText(e.toastContainer, 'Pause recording', 'should ask the moderator to confirm the pause');
    await this.modPage.waitAndClick(e.confirmRecordingButton);
    await expect(userIndicator, 'should tell the attendee the recording is paused').toHaveAttribute(
      'aria-label',
      'Paused recording',
    );

    await this.userPage.hoverElement(e.recordingIndicator);
    await expect(
      this.userPage.page.getByRole('tooltip').filter({ hasText: tooltip }),
      'should show the custom tooltip on the paused indicator of the attendee',
    ).toBeVisible();
  }

  async breakoutRecordOption(offered: boolean) {
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await this.modPage.waitAndClick(e.moreOptionsToggle);
    // letting users choose their room is always offered, next to the record option
    await this.modPage.hasElement(e.allowChoiceRoom, 'should list the breakout room options');
    if (offered) {
      await this.modPage.hasElement(e.recordBreakoutRooms, 'should offer to record the breakout rooms');
    } else {
      await this.modPage.wasRemoved(e.recordBreakoutRooms, 'should not offer to record the breakout rooms');
    }
  }
}
