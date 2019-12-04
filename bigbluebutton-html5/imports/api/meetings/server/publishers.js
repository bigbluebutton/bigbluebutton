import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Meetings, { RecordMeetings, MeetingTimeRemaining } from '/imports/api/meetings';
import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

function meetings(credentials, isModerator = false) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  Logger.debug(`Publishing meeting =${meetingId} ${requesterUserId} ${requesterToken}`);

  const selector = {
    $or: [
      { meetingId },
    ],
  };

  if (isModerator) {
    const User = Users.findOne({ userId: requesterUserId });
    if (!!User && User.role === ROLE_MODERATOR) {
      selector.$or.push({
        'meetingProp.isBreakout': true,
        'breakoutProps.parentId': meetingId,
      });
    }
  }

  const options = {
    fields: {
      password: false,
    },
  };

  return Meetings.find(selector, options);
}

function publish(...args) {
  const boundMeetings = meetings.bind(this);
  return boundMeetings(...args);
}

Meteor.publish('meetings', publish);

function recordMeetings(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;
  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  return RecordMeetings.find({ meetingId });
}
function recordPublish(...args) {
  const boundRecordMeetings = recordMeetings.bind(this);
  return boundRecordMeetings(...args);
}

Meteor.publish('record-meetings', recordPublish);

function meetingTimeRemaining(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;
  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  return MeetingTimeRemaining.find({ meetingId });
}
function timeRemainingPublish(...args) {
  const boundtimeRemaining = meetingTimeRemaining.bind(this);
  return boundtimeRemaining(...args);
}

Meteor.publish('meeting-time-remaining', timeRemainingPublish);
