import { expect, Page as PlaywrightPage, TestInfo } from '@playwright/test';

import { Join } from './join';

const CLIENT_SETTINGS_OVERRIDE_URL =
  'https://gist.githubusercontent.com/antobinary/2fc6f52dbcfa5bb39e5461ca59170c51/raw/94679aa21f1653476e49c1152a1ba768e5c4839b/gistfile1.txt';

export class ClientSettingsOverride extends Join {
  async testClientSettingsOverrideInheritedByBreakout(page: PlaywrightPage, testInfo: TestInfo): Promise<void> {
    const createParameter = `clientSettingsOverrideJsonUrl=${encodeURIComponent(CLIENT_SETTINGS_OVERRIDE_URL)}`;
    await this.initModPage(page, { createParameter, testInfo });
    await this.initUserPage(this.context, { testInfo });

    await this.create();
    const breakoutPage = await this.joinRoom();

    const showScreenshareQuickSwapButton = await breakoutPage.page.evaluate(
      () => (window as unknown as { meetingClientSettings: { public: { layout: { showScreenshareQuickSwapButton: boolean } } } })
        .meetingClientSettings?.public?.layout?.showScreenshareQuickSwapButton,
    );
    expect(showScreenshareQuickSwapButton, 'breakout room should inherit the parent meeting clientSettingsOverride').toBe(true);
  }
}
