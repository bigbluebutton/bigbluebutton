import { Meteor } from 'meteor/meteor';
import Meetings, { RecordMeetings, MeetingTimeRemaining } from '/imports/api/meetings';
import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

function meetings(role) {
  if (!this.userId) {
    return Meetings.find({ meetingId: '' });
  }
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  Logger.debug('Publishing meeting', { meetingId, requesterUserId });

  const selector = {
    $or: [
      { meetingId },
    ],
  };

  const User = Users.findOne({ userId: requesterUserId, meetingId }, { fields: { role: 1 } });
  if (!!User && User.role === ROLE_MODERATOR) {
    selector.$or.push({
      'meetingProp.isBreakout': true,
      'breakoutProps.parentId': meetingId,
    });
  }

  const options = {
    fields: {
      password: false,
      'welcomeProp.modOnlyMessage': false,
    },
  };

  return Meetings.find(selector, options);
}

function publish(...args) {
  const boundMeetings = meetings.bind(this);
  return boundMeetings(...args);
}

Meteor.publish('meetings', publish);

function recordMeetings() {
  if (!this.userId) {
    return RecordMeetings.find({ meetingId: '' });
  }
  const { meetingId } = extractCredentials(this.userId);

  return RecordMeetings.find({ meetingId });
}
function recordPublish(...args) {
  const boundRecordMeetings = recordMeetings.bind(this);
  return boundRecordMeetings(...args);
}

Meteor.publish('record-meetings', recordPublish);

function meetingTimeRemaining() {
  if (!this.userId) {
    return MeetingTimeRemaining.find({ meetingId: '' });
  }
  const { meetingId } = extractCredentials(this.userId);

  return MeetingTimeRemaining.find({ meetingId });
}
function timeRemainingPublish(...args) {
  const boundtimeRemaining = meetingTimeRemaining.bind(this);
  return boundtimeRemaining(...args);
}

Meteor.publish('meeting-time-remaining', timeRemainingPublish);
