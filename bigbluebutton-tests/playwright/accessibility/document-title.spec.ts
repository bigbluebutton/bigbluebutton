import { expect } from '@playwright/test';

import { openPrivateChat } from '../chat/util';
import { elements as e } from '../core/elements';
import { endMeetings } from '../core/helpers';
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
          await modPage.waitAndClick(e.userListButton);
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
      await modPage.waitAndClick(e.sharedNotesSidebarButton);
      await modPage.hasElement(e.sharedNotesBackground, 'should display shared notes');
      await expect(modPage.page, 'shared notes should be reflected in the document title').toHaveTitle(
        / - Shared Notes$/,
      );
    }

    if (modPage.settings?.pollEnabled) {
      // 4.0 opens the poll panel from the sidebar button (3.0 used the actions menu item),
      // and the open panel shows the minimize button (3.0's hidePollDesc no longer exists).
      await modPage.waitAndClick(e.pollSidebarButton);
      await modPage.hasElement(e.minimizePolling, 'should display the polling panel');
      await expect(modPage.page, 'polling should be reflected in the document title').toHaveTitle(/ - Polling$/);
    }

    // 4.0 opens the manage-presentations view from the media-area menu (3.0 used the actions "+" menu).
    await modPage.waitAndClick(e.mediaAreaButton);
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
    // 4.0 settings modal is dismissed via the Save button (3.0 used a generic modal dismiss).
    await modPage.waitAndClick(e.saveSettingsButton);

    // 4.0 opens breakout-room creation from the sidebar button (3.0 went through the manageUsers
    // menu). The creation panel is the BREAKOUT sidebar content, which drives the document title.
    await modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await expect(modPage.page, 'breakout room creation should be reflected in the document title').toHaveTitle(
      / - Breakout Rooms$/,
    );
  });
});

// WCAG 2.2 SC 2.4.2 (Page Titled): the screen that replaces the meeting names why it did, instead of
// keeping the title of the view the user was on.
test.describe.parallel('Session ended title', { tag: '@ci' }, () => {
  test('names the ended session in the document title', async ({ browser, context, page, request }, testInfo) => {
    const session = new MultiUsers(browser, context);
    await session.initModPage(page, { testInfo });
    const { modPage } = session;

    await endMeetings(request, [modPage.meetingId]);
    await modPage.hasText(e.meetingEndedModal, e.meetingEndedBySystemMessage, 'should show the meeting ended screen');
    await expect(modPage.page, 'the title should say the session ended').toHaveTitle(
      new RegExp(` - ${e.meetingEndedBySystemMessage}$`),
    );
  });

  test('names the removal in the document title', async ({ browser, context, page }, testInfo) => {
    const session = new MultiUsers(browser, context);
    await session.initPages(page, testInfo);
    const { modPage, userPage } = session;

    await modPage.waitAndClick(e.usersListSidebarButton);
    const attendeeRow = modPage.page.locator(e.userListItem).filter({ hasText: userPage.username });
    await attendeeRow.locator(e.moreOptionsUserItemButton).click();
    // every row renders its own copy of the menu and the closed ones stay in the DOM
    await modPage.page.locator(`${e.removeUser}:visible`).first().click();
    await modPage.waitAndClick(e.removeUserConfirmationBtn);

    await userPage.hasText(
      e.meetingEndedModal,
      e.removedFromSessionMessage,
      'should tell the attendee they were removed',
    );
    await expect(userPage.page, 'the title should say the attendee was removed').toHaveTitle(
      new RegExp(` - ${e.removedFromSessionMessage}$`),
    );
  });
});
