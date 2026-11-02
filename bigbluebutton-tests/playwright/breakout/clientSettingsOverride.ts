import { expect, Page as PlaywrightPage, test, TestInfo } from '@playwright/test';

import { CI } from '../core/constants';
import { Join } from './join';

const CLIENT_SETTINGS_OVERRIDE_MODULE = [
  '<modules><module name="clientSettingsOverride"><![CDATA[',
  JSON.stringify({ public: { layout: { showScreenshareQuickSwapButton: true } } }),
  ']]></module></modules>',
].join('');

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
    await this.initModPage(page, { createModules: CLIENT_SETTINGS_OVERRIDE_MODULE, testInfo });
    const parentHasOverride = (await getShowScreenshareQuickSwapButton(this.modPage.page)) === true;
    if (CI) {
      expect(parentHasOverride, 'the parent meeting should apply the clientSettingsOverride create module').toBe(true);
    } else {
      test.skip(
        !parentHasOverride,
        'the server ignored the clientSettingsOverride create module: set allowOverrideClientSettingsOnCreateCall=true',
      );
    }
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
