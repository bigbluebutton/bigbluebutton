// const util = require('node:util');

const { expect } = require("@playwright/test");

const Page = require('../core/page');
const { Join } = require('../breakout/join');
const parameters = require('../core/parameters');
const { apiCall, createMeeting, createMeetingPromise } = require('../core/helpers');
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

class APIBreakout extends Join {

  constructor(browser, context) {
    super(browser, context);
  }

  // Attempt to use API to create a breakout room without a parent
  async testBreakoutWithoutParent() {
    const response = await createMeetingPromise(parameters, `isBreakout=true&sequence=1`)
	  .catch(error => error);
    expect(response.response.status).toEqual(500);
  }

  // Attempt to use API to create a break room without a sequence number
  async testBreakoutWithoutSequenceNumber() {
    const response = await createMeetingPromise(parameters, `isBreakout=true&parentMeetingID=${this.modPage.meetingId}`)
	  .catch(error => error);
    expect(response.response.status).toEqual(500);
  }

  // Attempt to use API to create a break room with a non-existent parent meeting
  async testBreakoutWithNonexistentParent() {
    const response = await createMeetingPromise(parameters, `isBreakout=true&parentMeetingID=0000000&sequence=1`)
	  .catch(error => error);
    expect(response.response.status).toEqual(500);
  }

  // Check that breakout rooms created via the GUI appear properly in the API's meeting info
  async testBreakoutMeetingInfoNoJoins() {

    // We have two breakout rooms, but neither user has joined a breakout room.
    // Make sure the API getMeetingInfo returns expected results

    const response1 = await getMeetingInfo(this.modPage.meetingId);
    expect(response1.response.returncode).toEqual(['SUCCESS']);
    expect(response1.response.isBreakout).toEqual(['false']);
    expect(response1.response.breakoutRooms[0].breakout.length).toEqual(2);

    for (const breakoutRoom of response1.response.breakoutRooms[0].breakout) {
      const response2 = await getMeetingInfo(breakoutRoom);

      const expectedMeeting = {meetingID : [breakoutRoom],
			       isBreakout: ['true'],
			       running: ['false'],
			       participantCount: ['0'],
			       hasUserJoined: ['false'],
			       attendees: ['\n'],   /* no attendees; the newline is an artifact of xml2js */
			       freeJoin: ['false'],
			       sequence: [ expect.stringMatching('[12]') ],
			       parentMeetingID: response1.response.internalMeetingID,
			      };

      expect(response2.response.returncode).toEqual(['SUCCESS']);
      expect(response2.response).toMatchObject(expectedMeeting);
    }
  }

  async testBreakoutMeetingInfoOneJoin() {

    // We have two breakout rooms, and one user has joined a breakout room.
    // Make sure the API getMeetingInfo returns expected results

    // First, check that we can retrieve the parent meeting

    const response1 = await getMeetingInfo(this.modPage.meetingId);
    expect(response1.response.returncode).toEqual(['SUCCESS']);
    expect(response1.response.isBreakout).toEqual(['false']);

    // Then, check that the parent meeting lists two breakout rooms

    const breakoutRooms = response1.response.breakoutRooms[0].breakout;
    expect(breakoutRooms.length).toEqual(2);

    // Retrieve meeting info for both breakout rooms

    // Attendee, a VIEWER in the parent meeting, becomes a MODERATOR (and presenter) in the breakout room

    const expectedUser = expect.objectContaining({fullName: ['Attendee'],
						  role: ['MODERATOR'],
						  isPresenter: ['true'],
						 });

    const expectedMeeting1 = {isBreakout: ['true'],
			     running: ['true'],
			     participantCount: ['1'],
			     hasUserJoined: ['true'],
			     attendees: [{ attendee: [ expectedUser ] }],
			     freeJoin: ['false'],
			     sequence: [ '1' ],
			     parentMeetingID: response1.response.internalMeetingID,
			    };

    const expectedMeeting2 = {isBreakout: ['true'],
			     running: ['false'],
			     participantCount: ['0'],
			     hasUserJoined: ['false'],
			     attendees: ['\n'],   /* no attendees; the newline is an artifact of xml2js */
			     freeJoin: ['false'],
			     sequence: [ '2' ],
			     parentMeetingID: response1.response.internalMeetingID,
			    };

    const expectedResponse1 = {response: expect.objectContaining(expectedMeeting1)};
    const expectedResponse2 = {response: expect.objectContaining(expectedMeeting2)};

    // Note that this is an array of two responses from two API calls,
    // not a single API call response containing two breakout rooms

    const response2array = await Promise.all(breakoutRooms.map(getMeetingInfo));
    expect(response2array).toEqual(expect.arrayContaining([expectedResponse1, expectedResponse2]));
  }

}

exports.API = API;
exports.APIBreakout = APIBreakout;
