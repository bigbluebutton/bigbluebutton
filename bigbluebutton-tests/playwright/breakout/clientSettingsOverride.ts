import { expect, Page as PlaywrightPage, TestInfo } from '@playwright/test';

import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { constants as c } from '../parameters/constants';
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

  private async joinRoomWithInfiniteWhiteboardAllowed(
    page: PlaywrightPage,
    testInfo: TestInfo,
    createParameter: string,
  ): Promise<Page> {
    await this.initModPage(page, {
      createParameter,
      createClientSettingsOverride: { public: { whiteboard: { allowInfiniteWhiteboardInBreakouts: true } } },
      testInfo,
    });
    await this.initUserPage(this.context, { testInfo });

    await this.create();
    const breakoutModPage = await this.joinRoomWithModerator();
    await breakoutModPage.hasElement(
      e.presentationToolbarWrapper,
      'should display the presentation toolbar in the room',
    );
    return breakoutModPage;
  }

  async infiniteWhiteboardDisabledInRoom(page: PlaywrightPage, testInfo: TestInfo): Promise<void> {
    const breakoutModPage = await this.joinRoomWithInfiniteWhiteboardAllowed(page, testInfo, c.infiniteWhiteboard);
    await breakoutModPage.wasRemoved(
      e.turnInfiniteWhiteboardOn,
      'should not display the infinite whiteboard button in the room',
    );
  }

  async infiniteWhiteboardExcludedInRoom(page: PlaywrightPage, testInfo: TestInfo): Promise<void> {
    const breakoutModPage = await this.joinRoomWithInfiniteWhiteboardAllowed(
      page,
      testInfo,
      c.infiniteWhiteboardExclude,
    );
    await breakoutModPage.hasElement(
      e.turnInfiniteWhiteboardOn,
      'should display the infinite whiteboard button in the room',
    );
  }
}
