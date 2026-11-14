import { APIRequestContext, BrowserContext, expect } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { endMeetings } from '../core/helpers';
import { ClientSettingsOverrides, Page } from '../core/page';
import { parameters } from '../core/parameters';
import { MultiUsers } from '../user/multiusers';

// A logout URL on a reserved domain: the navigation to it is answered by the test
// (routeLogoutUrl), so no outside host is contacted.
export const LOGOUT_URL = 'https://logout.bbb-test.invalid/landing';
export const LOGOUT_URL_CREATE_PARAMETER = `logoutURL=${encodeURIComponent(LOGOUT_URL)}`;
export const SHORT_REDIRECT_SETTINGS_OVERRIDE: ClientSettingsOverrides = {
  public: { app: { timeoutBeforeRedirectOnMeetingEnd: 5000 } },
};

export async function routeLogoutUrl(context: BrowserContext) {
  await context.route(`${LOGOUT_URL}**`, (route) =>
    route.fulfill({ contentType: 'text/html', body: '<html><body>logged out</body></html>' }),
  );
}

export class MeetingEnded extends MultiUsers {
  async endedByModeratorReason() {
    await this.endMeetingAsModerator();
    const reason = `${this.modPage.username} ${e.meetingEndedByUserMessage}`;
    await this.userPage.hasText(e.meetingEndedModal, reason, 'should tell the attendee who ended the meeting');
    await this.modPage.hasText(e.meetingEndedModal, reason, 'should show the same reason to the moderator');
    await this.userPage.hasElement(e.redirectButton, 'should offer the attendee to leave the ended meeting');
  }

  async redirectCarriesTheReason() {
    await this.endMeetingAsModerator();
    await this.userPage.waitAndClick(e.redirectButton);
    await this.userPage.page.waitForURL(`${LOGOUT_URL}**`);
    const redirect = new URL(this.userPage.page.url());
    expect(redirect.searchParams.get('reason'), 'should pass the reason shown to the attendee').toBe(
      `${this.modPage.username} ${e.meetingEndedByUserMessage}`,
    );
    // a moderator ending the meeting logs out and ends it in one request
    expect(redirect.searchParams.get('reasonCode'), 'should pass the code of the reason').toBe(
      'ENDED_AFTER_USER_LOGGED_OUT',
    );
  }

  // the attendee page has timeoutBeforeRedirectOnMeetingEnd lowered, the moderator page keeps the default
  async redirectsAutomatically(request: APIRequestContext) {
    await endMeetings(request, [this.modPage.meetingId]);
    await this.userPage.hasText(
      e.meetingEndedModal,
      e.meetingEndedBySystemMessage,
      'should show the attendee that the meeting was ended through the API',
    );
    await this.userPage.page.waitForURL(`${LOGOUT_URL}**`, { timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });
    const redirect = new URL(this.userPage.page.url());
    expect(redirect.searchParams.get('reason'), 'should pass the reason shown to the attendee').toBe(
      e.meetingEndedBySystemMessage,
    );
    expect(redirect.searchParams.get('reasonCode'), 'should pass the code of the reason').toBe('ENDED_FROM_API');
    await this.modPage.hasElement(
      e.meetingEndedModal,
      'should keep the moderator, still on the default delay, on the meeting ended screen',
    );
  }

  async reopenedLinkAfterLogout() {
    const sessionToken = await getSessionToken(this.userPage);
    await this.userPage.logoutFromMeeting();
    await this.userPage.hasText(e.meetingEndedModal, e.loggedOutMessage, 'should log the attendee out');

    const reopenedPage = await this.openSessionLink(sessionToken);
    await reopenedPage.hasText(
      e.meetingEndedModal,
      e.loggedOutMessage,
      'should tell the attendee reopening the link that they logged out',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await reopenedPage.wasRemoved(e.actionsBarBackground, 'should not let the attendee back into the meeting');
  }

  async reopenedLinkAfterMeetingEnd(request: APIRequestContext) {
    const sessionToken = await getSessionToken(this.userPage);
    await endMeetings(request, [this.modPage.meetingId]);
    await this.userPage.hasElement(e.meetingEndedModal, 'should end the meeting for the attendee');

    const reopenedPage = await this.openSessionLink(sessionToken);
    await reopenedPage.hasText(
      e.meetingEndedModal,
      e.meetingEndedBySystemMessage,
      'should tell the attendee reopening the link that the meeting ended',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await reopenedPage.wasRemoved(e.actionsBarBackground, 'should not let the attendee back into the meeting');
  }

  async secondPageJoinsAsTheSameUser() {
    const secondPage = await this.openSessionLink(await getSessionToken(this.userPage));
    await secondPage.waitForSelector(e.actionsBarBackground, ELEMENT_WAIT_EXTRA_LONG_TIME);
    // the audio modal may or may not cover the page, so the user list is opened without pointer events
    await secondPage.waitAndClickElement(e.usersListSidebarButton);
    await expect(secondPage.page.locator(e.currentUser), 'should join the second page as the attendee').toHaveAttribute(
      'aria-label',
      this.userPage.username,
    );

    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await expect(
      this.modPage.page.locator(`${e.userListItem}[aria-label="${this.userPage.username}"]`),
      'should list the attendee once for the moderator',
    ).toHaveCount(1);
  }

  async firstPageIsToldAboutTheSecondOne() {
    const secondPage = await this.openSessionLink(await getSessionToken(this.userPage));
    await secondPage.waitForSelector(e.actionsBarBackground, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await expect(
      this.userPage.page.locator(e.errorScreenDescription),
      'should tell the first page that the session was opened in another window',
    ).toHaveText(e.joinedAnotherWindowMessage, { timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });
    await this.userPage.wasRemoved(e.actionsBarBackground, 'should remove the first page from the meeting');
    await secondPage.hasElement(e.actionsBarBackground, 'should keep the second page in the meeting');
  }

  async reloadKeepsThePageInTheMeeting() {
    await this.userPage.page.reload();
    await this.userPage.hasElement(
      e.actionsBarBackground,
      'should keep the reloaded page in the meeting',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await this.userPage.wasRemoved(e.errorScreenDescription, 'should not report the reloaded page as another window');
  }

  // the presentation is not waited for: ending the meeting does not depend on it
  async endMeetingAsModerator() {
    await this.modPage.waitAndClick(e.leaveMeetingDropdown);
    await this.modPage.waitAndClick(e.endMeetingButton);
    await this.modPage.waitAndClick(e.confirmEndMeetingButton);
    await this.userPage.hasElement(
      e.meetingEndedModal,
      'should end the meeting for the attendee',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  // opens the client with a session token, as the join link does
  async openSessionLink(sessionToken: string): Promise<Page> {
    const testPage = new Page(this.browser, await this.context.newPage(), this.modPage.testInfo);
    testPage.username = this.userPage.username;
    const clientURL = new URL(`../html5client/?sessionToken=${sessionToken}`, parameters.server);
    await testPage.page.goto(clientURL.toString());
    return testPage;
  }
}

async function getSessionToken(testPage: Page): Promise<string> {
  const sessionToken = await testPage.page.evaluate(() => sessionStorage.getItem('sessionToken'));
  if (!sessionToken) throw new Error(`no session token stored for ${testPage.username}`);
  return sessionToken;
}
