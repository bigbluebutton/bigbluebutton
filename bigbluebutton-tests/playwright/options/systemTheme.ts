import { expect } from '@playwright/test';

import { ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';

export class SystemTheme extends MultiUsers {
  // Whether OS auto-detection is enabled for this meeting (public.app.darkTheme
  // .autoDetectFromSystem). It ships enabled by default; the tests guard on it
  // so they skip cleanly on a server where an admin turned it off.
  async isAutoDetectConfigured(): Promise<boolean> {
    return this.modPage.page.evaluate(() => {
      // @ts-ignore - injected on window by the client at runtime
      const darkTheme = window.meetingClientSettings?.public?.app?.darkTheme;
      return Boolean(darkTheme?.enabled && darkTheme?.autoDetectFromSystem);
    });
  }

  // Waits until the applied theme matches the expectation. The native theme
  // stamps data-theme="dark" on <html> while dark mode is on and removes the
  // attribute when it is off, so its presence is the signal.
  //
  // The attribute alone is not enough: it only proves JS ran. The dark palette
  // lives in public/stylesheets/theme-dark.css, a file nothing else in the suite
  // verifies, so if it ever failed to ship these tests would stay green over a
  // fully light UI. --color-background is declared only by that sheet and only
  // under [data-theme='dark'], so resolving to a non-empty value is proof the
  // sheet shipped and applied. Asserted non-empty rather than equal to #181A23
  // because a branded client may override --color-background-dark-theme.
  async expectDarkTheme(shouldBeDark: boolean, description: string): Promise<void> {
    await expect
      .poll(() => this.modPage.page.evaluate(() => document.documentElement.getAttribute('data-theme') === 'dark'), {
        message: description,
        timeout: ELEMENT_WAIT_TIME,
      })
      .toBe(shouldBeDark);

    const paletteApplied = await this.modPage.page.evaluate(
      () => getComputedStyle(document.documentElement).getPropertyValue('--color-background').trim().length > 0,
    );
    await expect(paletteApplied, `${description} (dark palette sheet applied)`).toBe(shouldBeDark);
  }

  // Opens Settings, flips the "Dark mode" switch and saves, i.e. records an
  // explicit user theme preference that must override the detected OS theme.
  async setDarkModeManually(): Promise<void> {
    await this.modPage.waitAndClick(e.settingsSidebarButton);
    await this.modPage.waitAndClick(e.darkModeToggleBtn);
    await this.modPage.waitAndClick(e.saveSettingsButton);
  }
}
