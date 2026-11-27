import {
  type APIRequestContext,
  type Browser,
  type BrowserContext,
  expect,
  type Page as PlaywrightPage,
  type TestInfo,
} from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { getApiCallUrl, requestApiCall } from '../core/helpers';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';

// bbb-apps-akka on the server under test runs with, in /etc/bigbluebutton/bbb-apps-akka.conf,
// apps.endMeetingWhenNoMoreAuthedUsers = true and this value of apps.endMeetingWhenNoMoreAuthedUsersAfterMinutes
// (the nightly workflow installs such a server for the @setting-required:endMeetingWhenNoMoreAuthedUsers tests).
const AFTER_MINUTES = 1;
const MINUTE = 60000;
// bbb-apps-akka checks the timer every few seconds, and lists a user who left for 10 more seconds
const TIMER_CHECK_SLACK = 45000;
const POLL_INTERVAL = 5000;
// A join without the guest parameter is authenticated; one with it (and without auth=true) is not.
const GUEST_JOIN = 'guest=true';
// Let guests straight in, and rule out the other timer that ends a meeting once its moderators left.
const CREATE_PARAMETERS = 'guestPolicy=ALWAYS_ACCEPT&endWhenNoModerator=false';

// True while bbb-web knows the meeting, false once it answers notFound. Any other error (a transient bbb-web
// failure, say) throws, so it fails the test instead of passing for a meeting that ended.
async function meetingExists(request: APIRequestContext, meetingID: string): Promise<boolean> {
  const { status, response } = await requestApiCall(request, getApiCallUrl('getMeetingInfo', { meetingID }));
  if (response.returncode?.[0] === 'SUCCESS') return true;
  const messageKey = response.messageKey?.[0];
  if (messageKey === 'notFound') return false;
  throw new Error(`getMeetingInfo for ${meetingID} failed: HTTP ${status}, messageKey ${messageKey ?? 'missing'}`);
}

// Waits until bbb-web no longer knows the meeting; returns the time that took since `since`.
async function waitForMeetingToEnd(request: APIRequestContext, meetingID: string, since: number, timeout: number) {
  await expect
    .poll(() => meetingExists(request, meetingID), {
      timeout,
      intervals: [POLL_INTERVAL],
      message: `should end meeting ${meetingID}`,
    })
    .toBe(false);
  return Date.now() - since;
}

// Checks every few seconds, until `until`, that bbb-web still knows the meeting.
async function expectMeetingToLastUntil(request: APIRequestContext, meetingID: string, until: number) {
  while (Date.now() < until) {
    expect(await meetingExists(request, meetingID), `should keep meeting ${meetingID} running`).toBe(true);
    // eslint-disable-next-line no-promise-executor-return
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
  }
}

async function leave(page: Page) {
  await page.waitAndClick(e.leaveMeetingDropdown);
  await page.waitAndClick(e.directLogoutButton);
  await page.hasElement(e.meetingEndedModal, 'should leave the meeting');
}

export class APIEndMeetingWhenNoMoreAuthedUsers extends MultiUsers {
  // Two meetings whose moderators leave: one leaves a guest behind (not authenticated), the control an
  // authenticated viewer. Only the first ends, and not before the configured time is up.
  static async testEndsAfterLastAuthedUserLeft(
    browser: Browser,
    context: BrowserContext,
    page: PlaywrightPage,
    testInfo: TestInfo,
    request: APIRequestContext,
  ) {
    const guestOnly = new APIEndMeetingWhenNoMoreAuthedUsers(browser, context);
    await guestOnly.initModPage(page, { createParameter: CREATE_PARAMETERS, testInfo });
    await guestOnly.initUserPage(context, { fullName: 'Guest', joinParameter: GUEST_JOIN, testInfo });
    const control = new APIEndMeetingWhenNoMoreAuthedUsers(browser, context);
    await control.initModPage(await context.newPage(), { createParameter: CREATE_PARAMETERS, testInfo });
    await control.initUserPage(context, { testInfo });

    await leave(guestOnly.modPage);
    const leftAt = Date.now();
    await leave(control.modPage);

    const elapsed = await waitForMeetingToEnd(
      request,
      guestOnly.modPage.meetingId,
      leftAt,
      AFTER_MINUTES * MINUTE + TIMER_CHECK_SLACK,
    );
    expect(
      elapsed,
      'should wait endMeetingWhenNoMoreAuthedUsersAfterMinutes after the last authenticated user left',
    ).toBeGreaterThan(AFTER_MINUTES * MINUTE - POLL_INTERVAL);
    await guestOnly.userPage.hasText(
      e.meetingEndedModal,
      e.meetingEndedByNoAuthedUserMessage,
      'should tell the guest the meeting ended for lack of an authenticated user',
      ELEMENT_WAIT_LONGER_TIME,
    );
    expect(
      await meetingExists(request, control.modPage.meetingId),
      'should keep the meeting in which an authenticated viewer stayed',
    ).toBe(true);
    await control.userPage.wasRemoved(
      e.meetingEndedModal,
      'should keep the authenticated viewer in the control meeting',
    );
  }

  // The moderator leaves a guest alone; an authenticated viewer joins before the time is up and leaves again
  // later. The meeting lasts, and then ends the configured time after that second leave, not the first.
  async testAuthedUserReturningRestartsTheTimer(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    await this.initModPage(page, { createParameter: CREATE_PARAMETERS, testInfo });
    await this.initUserPage(this.context, { fullName: 'Guest', joinParameter: GUEST_JOIN, testInfo });

    await leave(this.modPage);
    const moderatorLeftAt = Date.now();
    await expectMeetingToLastUntil(request, this.modPage.meetingId, moderatorLeftAt + (AFTER_MINUTES * MINUTE) / 2);
    await this.initUserPage2(this.context, { fullName: 'Returning viewer', testInfo });
    await expectMeetingToLastUntil(
      request,
      this.modPage.meetingId,
      moderatorLeftAt + AFTER_MINUTES * MINUTE + TIMER_CHECK_SLACK,
    );
    await this.userPage.wasRemoved(e.meetingEndedModal, 'should keep the guest in the meeting');

    await leave(this.userPage2);
    const viewerLeftAt = Date.now();
    const elapsed = await waitForMeetingToEnd(
      request,
      this.modPage.meetingId,
      viewerLeftAt,
      AFTER_MINUTES * MINUTE + TIMER_CHECK_SLACK,
    );
    expect(
      elapsed,
      'should count endMeetingWhenNoMoreAuthedUsersAfterMinutes from the last authenticated user who left',
    ).toBeGreaterThan(AFTER_MINUTES * MINUTE - POLL_INTERVAL);
    await this.userPage.hasText(
      e.meetingEndedModal,
      e.meetingEndedByNoAuthedUserMessage,
      'should tell the guest the meeting ended for lack of an authenticated user',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }
}
