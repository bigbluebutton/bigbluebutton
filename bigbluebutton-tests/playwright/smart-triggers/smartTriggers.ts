import { expect, type Page as PlaywrightPage } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';

// Polls in the page so an element that flashes in and out between two
// Playwright checks still counts as having appeared.
async function appearsWithin(page: PlaywrightPage, selector: string, durationMs: number): Promise<boolean> {
  return page.evaluate(
    async ({ sel, ms }) => {
      const deadline = Date.now() + ms;
      while (Date.now() < deadline) {
        const element = document.querySelector(sel);
        if (element?.checkVisibility()) return true;
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
      }
      return false;
    },
    { sel: selector, ms: durationMs },
  );
}

export class SmartTriggers extends MultiUsers {
  async mutedAlertStaysOffUntilUnmute() {
    await this.modPage.joinMicrophone();
    await this.modPage.waitAndClick(e.muteMicButton);
    await this.modPage.hasElement(e.unmuteMicButton, 'should display the unmute button after muting');
    await this.modPage.hasElement(
      e.mutedAlert,
      'should warn that the user is talking while muted',
      ELEMENT_WAIT_LONGER_TIME,
    );

    await this.modPage.waitAndClick(e.mutedAlert);
    await this.modPage.hasText(
      e.toastContainer,
      'Mute alerts disabled until unmute',
      'should confirm the muted alert is off until the next unmute',
    );
    await this.modPage.wasRemoved(e.mutedAlert, 'should hide the muted alert once clicked');
    expect(
      await appearsWithin(this.modPage.page, e.mutedAlert, ELEMENT_WAIT_LONGER_TIME),
      'should keep the muted alert off while the user keeps talking muted',
    ).toBe(false);

    await this.modPage.waitAndClick(e.unmuteMicButton);
    await this.modPage.hasElement(e.muteMicButton, 'should display the mute button after unmuting');
    await this.modPage.waitAndClick(e.muteMicButton);
    await this.modPage.hasElement(
      e.mutedAlert,
      'should warn again after the user unmuted and muted again',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }
}
