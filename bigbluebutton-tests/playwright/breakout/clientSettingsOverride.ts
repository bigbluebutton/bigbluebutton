import { expect, Page as PlaywrightPage, TestInfo } from '@playwright/test';

import { Join } from './join';

const CLIENT_SETTINGS_OVERRIDE = { public: { layout: { showScreenshareQuickSwapButton: true } } };

function getShowScreenshareQuickSwapButton(page: PlaywrightPage): Promise<boolean | undefined> {
  return page.evaluate(
    () =>
      (
        window as unknown as {
          meetingClientSettings: { public: { layout: { showScreenshareQuickSwapButton: boolean } } };
        }
      ).meetingClientSettings?.public?.layout?.showScreenshareQuickSwapButton,
  );
}

export class ClientSettingsOverride extends Join {
  async testClientSettingsOverrideInheritedByBreakout(page: PlaywrightPage, testInfo: TestInfo): Promise<void> {
    await this.initModPage(page, { createClientSettingsOverride: CLIENT_SETTINGS_OVERRIDE, testInfo });
    await this.initUserPage(this.context, { testInfo });

    await this.create();
    const breakoutPage = await this.joinRoom();

    const showScreenshareQuickSwapButton = await getShowScreenshareQuickSwapButton(breakoutPage.page);
    expect(
      showScreenshareQuickSwapButton,
      'breakout room should inherit the parent meeting clientSettingsOverride',
    ).toBe(true);
  }
}
