// const util = require('node:util');

const { expect } = require("@playwright/test");

const Page = require('../core/page');
const parameters = require('../core/parameters');
const { apiCall, createMeeting } = require('../core/helpers');
const e = require('../core/elements');

function getMeetings() {
  return apiCall('getMeetings', {});
}

function getMeetingInfo(meetingID) {
  return apiCall('getMeetingInfo', {meetingID: meetingID});
}

class API {

  constructor(browser, context, page) {
    this.modPage = new Page(browser, page);
    this.browser = browser;
    this.context = context;
    this.userPages = [];
  }

  async getNewPageTab() {
    return this.browser.newPage();
  }

  async testGetMeetings() {
    const meetingId = await createMeeting(parameters);
    const modPage = new Page(this.browser, await this.getNewPageTab());
    const userPage = new Page(this.browser, await this.getNewPageTab());
    await Promise.all([
      modPage.init(true, false, { meetingId, fullName: 'Moderator' }),
      userPage.init(false, false, { meetingId, fullName: 'Attendee' }),
    ]);
    await Promise.all([
      modPage.joinMicrophone(),
      userPage.joinMicrophone()
    ]);

    /* hasJoinedVoice: ['true'] is not part of these expectedUser patterns because it isn't consistently true
     * in the API's returned data structures.  Is there something we can await on the browser page that
     * should ensure that the API will report hasJoinedVoice?
     */

    const expectedUsers = [expect.objectContaining({fullName: ['Moderator'],
						    role: ['MODERATOR'],
						    isPresenter: ['true'],
						   }),
			   expect.objectContaining({fullName: ['Attendee'],
						    role: ['VIEWER'],
						    isPresenter: ['false'],
						   })
			  ];
    const expectedMeeting = {meetingName : [meetingId],
			     running : ['true'],
			     participantCount : ['2'],
			     moderatorCount : ['1'],
			     isBreakout: ['false'],
			     attendees: [{ attendee: expect.arrayContaining(expectedUsers) }]
			    };

    /* check that this meeting is in the server's list of all meetings */
    const response = await getMeetings();
    expect(response.response.returncode).toEqual(['SUCCESS']);
    expect(response.response.meetings[0].meeting).toContainEqual(expect.objectContaining(expectedMeeting));

    await modPage.page.close();
    await userPage.page.close();
  }

  async testGetMeetingInfo() {
    const meetingId = await createMeeting(parameters);
    const modPage = new Page(this.browser, await this.getNewPageTab());
    const userPage = new Page(this.browser, await this.getNewPageTab());
    await Promise.all([
      modPage.init(true, false, { meetingId, fullName: 'Moderator' }),
      userPage.init(false, false, { meetingId, fullName: 'Attendee' }),
    ]);
    await Promise.all([
      modPage.joinMicrophone(),
      userPage.joinMicrophone()
    ]);

    /* hasJoinedVoice: ['true'] is not part of these expectedUser patterns because it isn't consistently true
     * in the API's returned data structures.  Is there something we can await on the browser page that
     * should ensure that the API will report hasJoinedVoice?
     */

    const expectedUsers = [expect.objectContaining({fullName: ['Moderator'],
						    role: ['MODERATOR'],
						    isPresenter: ['true'],
						   }),
			   expect.objectContaining({fullName: ['Attendee'],
						    role: ['VIEWER'],
						    isPresenter: ['false'],
						   })
			  ];
    const expectedMeeting = {meetingName : [meetingId],
			     running : ['true'],
			     participantCount : ['2'],
			     moderatorCount : ['1'],
			     isBreakout: ['false'],
			     attendees: [{ attendee: expect.arrayContaining(expectedUsers) }]
			    };

    /* check that we can retrieve this meeting by its meetingId */
    const response2 = await getMeetingInfo(meetingId);
    expect(response2.response.returncode).toEqual(['SUCCESS']);
    expect(response2.response).toMatchObject(expectedMeeting);

    /* check that we can retrieve this meeting by its internal meeting ID */
    const response3 = await getMeetingInfo(response2.response.internalMeetingID[0]);
    expect(response3.response.returncode).toEqual(['SUCCESS']);
    expect(response3.response).toMatchObject(expectedMeeting);

    await modPage.page.close();
    await userPage.page.close();
  }
}

exports.API = API;
