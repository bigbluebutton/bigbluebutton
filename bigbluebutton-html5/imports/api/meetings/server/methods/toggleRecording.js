import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import { RecordMeetings } from '/imports/api/meetings';
import Users from '/imports/api/users';

export default function toggleRecording(credentials) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  const EVENT_NAME = 'SetRecordingStatusCmdMsg';

  let meetingRecorded;
  let allowedToRecord;

  const recordObject = RecordMeetings.findOne({ meetingId });

  if (recordObject != null) {
    const {
      allowStartStopRecording,
      recording,
      record,
    } = recordObject;

    meetingRecorded = recording;
    allowedToRecord = record && allowStartStopRecording;
  }

  const payload = {
    recording: !meetingRecorded,
    setBy: requesterUserId,
  };

  const selector = {
    meetingId,
    userId: requesterUserId,
  };
  const user = Users.findOne(selector);

  if (allowedToRecord && !!user && user.role === ROLE_MODERATOR) {
    Logger.info(`Setting the record parameter to ${!meetingRecorded} for ${meetingId} by ${requesterUserId}`);
    return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  }
  return null;
}
