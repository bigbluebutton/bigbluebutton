import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis2x';
import Logger from '/imports/startup/server/logger';

export default function kickUser(credentials, userId) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UserEjectedFromMeetingEvtMsg';

  const { requesterUserId, meetingId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(userId, String);

  const payload = {
    userid: userId,
    ejected_by: requesterUserId,
    meeting_id: meetingId,
  };


  Logger.verbose(`User '${userId}' was kicked by '${requesterUserId}' from meeting '${meetingId}'`);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
