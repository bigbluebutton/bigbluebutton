import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Meetings from '/imports/api/2.0/meetings';
import Logger from '/imports/startup/server/logger';
import mapToAcl from '/imports/startup/mapToAcl';

function meetings(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  Logger.info(`Publishing meeting2x =${meetingId} ${requesterUserId} ${requesterToken}`);

  return Meetings.find({
    meetingId,
  });
}

function publish(...args) {
  const boundMeetings = meetings.bind(this);
  return mapToAcl('subscriptions.meetings', boundMeetings)(args);
}

Meteor.publish('meetings2x', publish);

