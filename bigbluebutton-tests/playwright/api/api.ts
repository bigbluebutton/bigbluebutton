import { expect, Page as PlaywrightPage, TestInfo } from '@playwright/test';
import axios from 'axios';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { getMeetingInfo, getMeetings, GetMeetingsResponse } from '../core/endpoints';
import { createMeeting, getJoinURL } from '../core/helpers';
import { parameters } from '../core/parameters';
import { MultiUsers } from '../user/multiusers';

// Browser hardening headers Grails 8 adds to every response by default (apache/grails-core#15967).
// The 3.0 line turns them off (grails.security.headers.enabled=false) to keep its Grails 7 responses.
const GRAILS_SECURITY_HEADERS = ['x-frame-options', 'x-content-type-options', 'referrer-policy', 'x-xss-protection'];

export class API extends MultiUsers {
  async getNewPageTab() {
    return this.browser.newPage();
  }

  async testGetMeetings(page: PlaywrightPage, testInfo: TestInfo) {
    const meetingId = await createMeeting();
    await this.initModPage(page, { testInfo, meetingId, shouldCloseAudioModal: false });
    await this.initUserPage(this.modPage.context, { testInfo, meetingId, shouldCloseAudioModal: false });
    await this.modPage.joinMicrophone();
    await this.userPage.joinMicrophone();

    /* hasJoinedVoice: ['true'] is not part of these expectedUser patterns
     * because it isn't consistently true
     * in the API's returned data structures.
     * Is there something we can await on the browser page that
     * should ensure that the API will report hasJoinedVoice?
     */

    const expectedUsers = [
      expect.objectContaining({
        fullName: [`${this.modPage.username}`],
        role: ['MODERATOR'],
        isPresenter: ['true'],
      }),
      expect.objectContaining({
        fullName: [`${this.userPage.username}`],
        role: ['VIEWER'],
        isPresenter: ['false'],
      }),
    ];

    const expectedMeeting = {
      meetingName: [meetingId],
      running: ['true'],
      participantCount: ['2'],
      moderatorCount: ['1'],
      isBreakout: ['false'],
      attendees: [{ attendee: expect.arrayContaining(expectedUsers) }],
    };

    /* check that this meeting is in the server's list of all meetings */
    const { data } = await getMeetings();
    expect(data.response.returncode).toEqual(['SUCCESS']);
    const meetings = (data.response.meetings || []).flatMap(
      (m: GetMeetingsResponse['response']['meetings'][number]) => m.meeting || [],
    );
    expect(meetings).toEqual(expect.arrayContaining([expect.objectContaining(expectedMeeting)]));

    await this.modPage.page.close();
    await this.userPage.page.close();
  }

  async testGetMeetingInfo(page: PlaywrightPage, testInfo: TestInfo) {
    const meetingId = await createMeeting();
    await this.initModPage(page, { testInfo, meetingId, shouldCloseAudioModal: false });
    await this.initUserPage(this.modPage.context, { testInfo, meetingId, shouldCloseAudioModal: false });
    await this.modPage.joinMicrophone();
    await this.userPage.joinMicrophone();

    /* hasJoinedVoice: ['true'] is not part of these expectedUser patterns
     * because it isn't consistently true
     * in the API's returned data structures.
     * Is there something we can await on the browser page that
     * should ensure that the API will report hasJoinedVoice?
     */

    const expectedUsers = [
      expect.objectContaining({
        fullName: ['Moderator'],
        role: ['MODERATOR'],
        isPresenter: ['true'],
      }),
      expect.objectContaining({
        fullName: ['Attendee'],
        role: ['VIEWER'],
        isPresenter: ['false'],
      }),
    ];
    const expectedMeeting = {
      meetingName: [meetingId],
      running: ['true'],
      participantCount: ['2'],
      moderatorCount: ['1'],
      isBreakout: ['false'],
      attendees: [{ attendee: expect.arrayContaining(expectedUsers) }],
    };

    /* check that we can retrieve this meeting by its meetingId */
    const { data } = await getMeetingInfo(meetingId);
    expect(data.response.returncode).toEqual(['SUCCESS']);
    expect(data.response).toMatchObject(expectedMeeting);

    /* check that we can retrieve this meeting by its internal meeting ID */
    const { data: data2 } = await getMeetingInfo(data.response.internalMeetingID[0]);
    expect(data2.response).toMatchObject(expectedMeeting);
    expect(data2.response.returncode).toEqual(['SUCCESS']);

    await this.modPage.page.close();
    await this.userPage.page.close();
  }

  // A document, a redirect and an error response from bbb-web carry none of the headers.
  static async testBbbWebSecurityHeadersDisabled() {
    const server = parameters.server!.replace(/\/$/, '');
    const meetingID = await createMeeting();
    const responses = {
      'GET /api': await axios.get(`${server}/api`, { adapter: 'http' }),
      'join redirect': await axios.get(getJoinURL({ meetingID, fullName: 'Headers' }), {
        adapter: 'http',
        maxRedirects: 0,
        validateStatus: (status) => status === 302,
      }),
      'unmapped URL': await axios.get(`${server}/no-such-endpoint`, {
        adapter: 'http',
        validateStatus: (status) => status === 404,
      }),
    };
    expect(String(responses['GET /api'].data), 'GET /api should be answered by bbb-web').toContain('SUCCESS');
    for (const [request, response] of Object.entries(responses)) {
      for (const header of GRAILS_SECURITY_HEADERS) {
        expect(response.headers[header], `${request} should not send ${header}`).toBeUndefined();
      }
    }
  }

  // An LMS-style page on another origin frames the join URL and bbb-web's own /api document;
  // both load. allowRequestsWithoutSession: the JSESSIONID cookie is not sent from a cross-site frame.
  static async testJoinInsideCrossOriginFrame(page: PlaywrightPage) {
    const server = parameters.server!.replace(/\/$/, '');
    const meetingID = await createMeeting('allowRequestsWithoutSession=true');
    const joinUrl = getJoinURL({
      meetingID,
      fullName: 'Framed',
      options: { isModerator: true, skipSessionDetailsModal: true },
    });
    const parentUrl = 'https://lms.example.test/course';
    // Serve the LMS URL from the server's front page: Chromium refuses to frame a server on a
    // private address (the CI runner) from a page that has no network address of its own.
    await page.route(parentUrl, (route) => route.continue({ url: `${new URL(server).origin}/` }));
    await page.goto(parentUrl, { waitUntil: 'commit' });
    expect(page.url(), 'the LMS page should stay on its own origin').toBe(parentUrl);

    const apiFrameResponse = page
      .waitForResponse(`${server}/api`, { timeout: ELEMENT_WAIT_LONGER_TIME })
      .catch(() => null);
    await page.setContent(
      '<!doctype html><title>LMS</title>' +
        `<iframe id="meeting" src="${joinUrl.replace(/&/g, '&amp;')}" allow="microphone; camera" ` +
        'style="width:1280px;height:720px"></iframe>' +
        `<iframe id="api" src="${server}/api"></iframe>`,
      { waitUntil: 'domcontentloaded' },
    );

    await expect(
      page.frameLocator('#meeting').locator(e.audioModal),
      'the client should load inside a frame on another origin',
    ).toBeVisible({ timeout: ELEMENT_WAIT_EXTRA_LONG_TIME });

    expect((await apiFrameResponse)?.status(), 'bbb-web should answer the framed /api request').toBe(200);
    // A frame the browser refuses (X-Frame-Options) commits an error page instead of this URL.
    const apiFrame = await (await page.waitForSelector('#api')).contentFrame();
    await expect
      .poll(() => apiFrame?.url(), {
        message: 'bbb-web should render its own response inside a frame on another origin',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBe(`${server}/api`);
  }
}
