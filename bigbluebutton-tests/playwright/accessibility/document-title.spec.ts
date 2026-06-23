import { expect } from '@playwright/test';

import { openPrivateChat } from '../chat/util';
import { elements as e } from '../core/elements';
import { test } from '../core/setup/fixtures';
import { openSettings } from '../options/util';
import { MultiUsers } from '../user/multiusers';

test.describe.parallel('Accessible routing', { tag: '@ci' }, () => {
  test('updates the document title for active client views', async ({ browser, context, page }, testInfo) => {
    const session = new MultiUsers(browser, context);
    await session.initModPage(page, { testInfo });
    const { modPage } = session;

    await expect(modPage.page, 'initial meeting title should include the active view').toHaveTitle(
      / - (User list|Public Chat|Default presentation view)$/,
    );

    if (modPage.settings?.chatEnabled) {
      if (!(await modPage.page.locator(e.hidePublicChat).isVisible())) {
        if (!(await modPage.page.locator(e.chatButton).first().isVisible())) {
          await modPage.waitAndClick(e.userListToggleBtn);
        }

        if (!(await modPage.page.locator(e.hidePublicChat).isVisible())) {
          await modPage.waitAndClick(e.chatButton);
        }
      }

      await modPage.hasElement(e.hidePublicChat, 'should display public chat');
      await expect(modPage.page, 'public chat should be reflected in the document title').toHaveTitle(
        / - Public Chat$/,
      );
    }

    if (modPage.settings?.sharedNotesEnabled) {
      await modPage.waitAndClick(e.sharedNotes);
      await modPage.hasElement(e.sharedNotesBackground, 'should display shared notes');
      await expect(modPage.page, 'shared notes should be reflected in the document title').toHaveTitle(
        / - Shared Notes$/,
      );
    }

    if (modPage.settings?.pollEnabled) {
      await modPage.waitAndClick(e.actions);
      await modPage.waitAndClick(e.polling);
      await modPage.hasElement(e.hidePollDesc, 'should display the polling panel');
      await expect(modPage.page, 'polling should be reflected in the document title').toHaveTitle(/ - Polling$/);
    }

    await modPage.waitAndClick(e.actions);
    await modPage.waitAndClick(e.managePresentations);
    await modPage.hasElement(e.presentationFileUpload, 'should display the presentation upload view');
    await expect(modPage.page, 'presentation upload should be reflected in the document title').toHaveTitle(
      / - Upload Presentation$/,
    );
  });

  test('updates the document title for private chat', async ({ browser, context, page }, testInfo) => {
    const session = new MultiUsers(browser, context);
    await session.initPages(page, testInfo);
    const { modPage } = session;

    test.skip(!modPage.settings?.chatEnabled, 'Chat is disabled');
    await openPrivateChat(modPage);
    await modPage.hasElement(e.hidePrivateChat, 'should display private chat');
    await expect(modPage.page, 'private chat participant should be reflected in the document title').toHaveTitle(
      / - Private Chat with Attendee$/,
    );
  });

  test('updates the document title for route-like modals', async ({ browser, context, page }, testInfo) => {
    const session = new MultiUsers(browser, context);
    await session.initModPage(page, { testInfo });
    const { modPage } = session;

    await openSettings(modPage);
    await expect(modPage.page, 'settings modal should be reflected in the document title').toHaveTitle(/ - Settings$/);
    await modPage.waitAndClick(e.modalDismissButton);

    await modPage.waitAndClick(e.manageUsers);
    if (await modPage.page.locator(e.createBreakoutRooms).isVisible()) {
      await modPage.waitAndClick(e.createBreakoutRooms);
      await expect(modPage.page, 'breakout room creation modal should be reflected in the document title').toHaveTitle(
        / - Breakout Rooms$/,
      );
      await modPage.waitAndClick(e.modalDismissButton);
    }
  });
});
