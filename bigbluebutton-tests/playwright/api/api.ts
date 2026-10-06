import { expect, Page as PlaywrightPage, TestInfo } from '@playwright/test';
import axios from 'axios';
import * as xml2js from 'xml2js';

import { getMeetingInfo, getMeetings, GetMeetingsResponse } from '../core/endpoints';
import { createMeeting, getApiCallUrl, getJoinURL, getRandomInt } from '../core/helpers';
import { MultiUsers } from '../user/multiusers';

// Minimal shape of the /create response we assert on (xml2js wraps every
// element in an array).
interface CreateResponse {
  response: {
    returncode: string[];
    voiceBridge?: string[];
    errors?: { error: { key: string[]; message: string[] }[] }[];
  };
}

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

  // Call /create and return the parsed XML response. The BBB API speaks XML,
  // so we ask for it explicitly (the default JSON error rendering path is a
  // separate, unrelated concern).
  private static async createMeetingXml(params: Record<string, string>): Promise<CreateResponse> {
    const url = getApiCallUrl('create', params);
    const response = await axios.get(url, {
      adapter: 'http',
      headers: { Accept: 'application/xml' },
    });
    return xml2js.parseStringPromise(response.data);
  }

  // The obsolete webVoice create parameter was removed: voice conference
  // selection derives solely from voiceBridge. A create that still passes a
  // webVoice distinct from voiceBridge must succeed and ignore webVoice,
  // keeping voiceConf (the returned voiceBridge) equal to the requested one.
  static async testWebVoiceParamIgnored() {
    const voiceBridge = getRandomInt(10000, 20000).toString();
    // A clearly distinct 5-digit value that webVoice used to be able to set.
    const webVoice = (parseInt(voiceBridge, 10) + 40000).toString();
    const meetingID = `wvtest-a-${getRandomInt(1000000, 10000000)}`;

    const { response } = await API.createMeetingXml({
      name: meetingID,
      meetingID,
      voiceBridge,
      webVoice,
    });

    expect(response.returncode, 'create with a distinct webVoice should still succeed').toEqual(['SUCCESS']);
    expect(response.voiceBridge, 'voiceConf must equal the requested voiceBridge, not the ignored webVoice').toEqual([
      voiceBridge,
    ]);
  }

  // Reusing a voiceBridge across two live meetings must still be rejected with
  // nonUniqueVoiceBridge. This collision check ran through telVoice, not the
  // removed webVoice, so removing webVoice must leave it intact.
  static async testDuplicateVoiceBridgeRejected() {
    const voiceBridge = getRandomInt(20000, 30000).toString();
    const firstID = `wvtest-b1-${getRandomInt(1000000, 10000000)}`;
    const secondID = `wvtest-b2-${getRandomInt(1000000, 10000000)}`;

    const first = await API.createMeetingXml({ name: firstID, meetingID: firstID, voiceBridge });
    expect(first.response.returncode, 'first meeting on a fresh voiceBridge should succeed').toEqual(['SUCCESS']);

    const second = await API.createMeetingXml({ name: secondID, meetingID: secondID, voiceBridge });
    expect(second.response.returncode, 'second meeting reusing the voiceBridge should fail').toEqual(['FAILED']);
    expect(second.response.errors?.[0]?.error?.[0]?.key?.[0], 'collision should surface nonUniqueVoiceBridge').toEqual(
      'nonUniqueVoiceBridge',
    );
  }

  // Long display names are accepted end to end, up to the 255 character limit
  // enforced at the join edge. The name columns the join feeds
  // (user_voice.callerName, chat_message.senderName) used to be narrow varchars,
  // so a long name joined fine but the dependent inserts were silently discarded
  // by Postgres; they are text now, so a 255 character name must join normally.
  static async testJoinLongFullNameAccepted() {
    const meetingID = await createMeeting();
    const joinUrl = getJoinURL({
      meetingID,
      fullName: 'a'.repeat(255),
      options: { joinParameter: 'redirect=false' },
    });
    const response = await axios.get(joinUrl, {
      adapter: 'http',
      headers: { Accept: 'application/xml' },
    });
    const { response: parsed } = await xml2js.parseStringPromise(response.data);
    expect(parsed.returncode, 'a 255 character fullName should join').toEqual(['SUCCESS']);
    expect(parsed.messageKey, 'the join should succeed normally').toEqual(['successfullyJoined']);
  }

  // Above the limit the join is rejected, matching the userName bound already
  // enforced on sendChatMessage. Join validation errors respond with a redirect
  // carrying the errors JSON in the Location query, not with an XML body.
  static async testJoinFullNameOverLimitRejected() {
    const meetingID = await createMeeting();
    const joinUrl = getJoinURL({
      meetingID,
      fullName: 'a'.repeat(300),
    });
    const response = await axios.get(joinUrl, {
      adapter: 'http',
      maxRedirects: 0,
      validateStatus: (status) => status === 302,
    });
    expect(response.status, 'a 300 character fullName should fail the join').toEqual(302);
    expect(
      decodeURIComponent(String(response.headers.location)),
      'the redirect must carry the offending key',
    ).toContain('fullNameTooLong');
  }

  // A long name also joins through the full client (init asserts authentication
  // and layout render). 150 characters, not 300: the console log harness names
  // its file after the username and would hit the filesystem name limit.
  async testJoinLongFullNameThroughClient(page: PlaywrightPage, testInfo: TestInfo) {
    await this.initModPage(page, { testInfo, fullName: 'a'.repeat(150) });
    await this.modPage.page.close();
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
}
