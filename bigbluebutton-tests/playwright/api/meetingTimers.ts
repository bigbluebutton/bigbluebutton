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
import { createMeeting, getApiCallUrl, requestApiCall } from '../core/helpers';
import { Page } from '../core/page';
import { parameters } from '../core/parameters';
import { MultiUsers } from '../user/multiusers';

const MINUTE = 60000;
// bbb-apps-akka checks the meeting timers periodically, so a meeting can end a little after its time is up
const TIMER_CHECK_SLACK = 45000;
const POLL_INTERVAL = 5000;

async function meetingExists(request: APIRequestContext, meetingID: string): Promise<boolean> {
  const { response } = await requestApiCall(request, getApiCallUrl('getMeetingInfo', { meetingID }));
  return response.returncode?.[0] === 'SUCCESS';
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

async function leave(page: Page) {
  await page.waitAndClick(e.leaveMeetingDropdown);
  await page.waitAndClick(e.directLogoutButton);
  await page.hasElement(e.meetingEndedModal, 'should leave the meeting');
}

export class APIMeetingTimers extends MultiUsers {
  // The server default is 5 minutes.
  static async testExpireIfNoUserJoined(request: APIRequestContext) {
    const createdAt = Date.now();
    const meetingID = await createMeeting('meetingExpireIfNoUserJoinedInMinutes=1');
    const elapsed = await waitForMeetingToEnd(request, meetingID, createdAt, MINUTE + TIMER_CHECK_SLACK);
    expect(elapsed, 'should keep the meeting for a minute').toBeGreaterThan(MINUTE - POLL_INTERVAL);
  }

  // The server default is 1 minute.
  async testExpireWhenLastUserLeft(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    await this.initModPage(page, { createParameter: 'meetingExpireWhenLastUserLeftInMinutes=2', testInfo });
    await leave(this.modPage);
    const leftAt = Date.now();
    const elapsed = await waitForMeetingToEnd(request, this.modPage.meetingId, leftAt, 2 * MINUTE + TIMER_CHECK_SLACK);
    expect(elapsed, 'should keep the meeting for two minutes after the last user left').toBeGreaterThan(
      2 * MINUTE - POLL_INTERVAL,
    );
  }

  // 0 ends the meeting as soon as the last user has left (MeetingTrackers in bbb-apps-akka).
  async testExpireRightAfterLastUserLeft(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    await this.initModPage(page, { createParameter: 'meetingExpireWhenLastUserLeftInMinutes=0', testInfo });
    await leave(this.modPage);
    await waitForMeetingToEnd(request, this.modPage.meetingId, Date.now(), TIMER_CHECK_SLACK);
  }

  // Two meetings, each with a moderator and a viewer, and only the first with endWhenNoModerator=true; both
  // moderators leave.
  static async testEndWhenNoModerator(
    browser: Browser,
    context: BrowserContext,
    page: PlaywrightPage,
    testInfo: TestInfo,
    request: APIRequestContext,
  ) {
    const ending = new APIMeetingTimers(browser, context);
    await ending.initModPage(page, {
      createParameter: 'endWhenNoModerator=true&endWhenNoModeratorDelayInMinutes=1',
      testInfo,
    });
    await ending.initUserPage(context, { testInfo });
    const control = new APIMeetingTimers(browser, context);
    await control.initModPage(await context.newPage(), {
      createParameter: 'endWhenNoModerator=false&endWhenNoModeratorDelayInMinutes=1',
      testInfo,
    });
    await control.initUserPage(context, { testInfo });

    await leave(ending.modPage);
    await leave(control.modPage);
    const leftAt = Date.now();
    const elapsed = await waitForMeetingToEnd(
      request,
      ending.modPage.meetingId,
      leftAt,
      MINUTE + 2 * TIMER_CHECK_SLACK,
    );
    expect(elapsed, 'should wait endWhenNoModeratorDelayInMinutes before ending the meeting').toBeGreaterThan(
      MINUTE - POLL_INTERVAL,
    );
    await ending.userPage.hasElement(
      e.meetingEndedModal,
      'should end the meeting for the viewer left without a moderator',
      ELEMENT_WAIT_LONGER_TIME,
    );
    expect(
      await meetingExists(request, control.modPage.meetingId),
      'should keep the meeting created with endWhenNoModerator=false',
    ).toBe(true);
    await control.userPage.wasRemoved(e.meetingEndedModal, 'should keep the viewer of the control meeting in it');
  }

  // Once the meeting ended, the dashboard loads its data from <meeting>/<access token>/learning_dashboard_data.json;
  // the meeting-ended screen hands a moderator the token in the ld-<meeting> cookie. The server default is 2 minutes.
  async testLearningDashboardCleanup(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    await this.initModPage(page, { createParameter: 'learningDashboardCleanupDelayInMinutes=1', testInfo });
    const meetingInfo = await requestApiCall(
      request,
      getApiCallUrl('getMeetingInfo', { meetingID: this.modPage.meetingId }),
    );
    const internalMeetingId = meetingInfo.response.internalMeetingID?.[0];

    await requestApiCall(request, getApiCallUrl('end', { meetingID: this.modPage.meetingId }));
    const endedAt = Date.now();
    await this.modPage.hasElement(e.meetingEndedModal, 'should end the meeting for the moderator');
    const dashboardCookie = async () =>
      (await this.modPage.page.context().cookies()).find(({ name }) => name === `ld-${internalMeetingId}`)?.value;
    await expect
      .poll(dashboardCookie, { timeout: ELEMENT_WAIT_LONGER_TIME, message: 'should give the moderator the dashboard' })
      .toBeTruthy();
    const dataUrl =
      `${new URL(parameters.server!).origin}/learning-analytics-dashboard/` +
      `${internalMeetingId}/${await dashboardCookie()}/learning_dashboard_data.json`;
    const dataStatus = async () => (await request.get(dataUrl)).status();

    await expect
      .poll(dataStatus, { timeout: ELEMENT_WAIT_LONGER_TIME, message: 'should serve the data once the meeting ended' })
      .toBe(200);
    await expect
      .poll(dataStatus, {
        timeout: MINUTE + TIMER_CHECK_SLACK,
        intervals: [POLL_INTERVAL],
        message: 'should remove the data a minute after the meeting ended',
      })
      .toBe(404);
    expect(Date.now() - endedAt, 'should keep the data for a minute').toBeGreaterThan(MINUTE - POLL_INTERVAL);
  }
}
