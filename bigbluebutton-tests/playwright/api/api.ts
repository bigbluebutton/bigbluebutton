import { expect, Page as PlaywrightPage, TestInfo } from '@playwright/test';

import { getMeetingInfo, getMeetings, GetMeetingsResponse } from '../core/endpoints';
import { createMeeting } from '../core/helpers';
import { MultiUsers } from '../user/multiusers';

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
}
