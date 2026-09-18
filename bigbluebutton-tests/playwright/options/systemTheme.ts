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

  // Waits until the applied theme matches the expectation. DarkReader injects
  // <style class="darkreader ..."> elements while the dark theme is enabled and
  // removes them when it is disabled, so their presence is a reliable signal.
  async expectDarkTheme(shouldBeDark: boolean, description: string): Promise<void> {
    await expect
      .poll(() => this.modPage.page.evaluate(() => document.querySelectorAll('style.darkreader').length > 0), {
        message: description,
        timeout: ELEMENT_WAIT_TIME,
      })
      .toBe(shouldBeDark);
  }

  // Opens Settings, flips the "Dark mode" switch and saves, i.e. records an
  // explicit user theme preference that must override the detected OS theme.
  async setDarkModeManually(): Promise<void> {
    await this.modPage.waitAndClick(e.settingsSidebarButton);
    await this.modPage.waitAndClick(e.darkModeToggleBtn);
    await this.modPage.waitAndClick(e.saveSettingsButton);
  }
}
