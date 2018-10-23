import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';

export default function transferUser(credentials, fromMeetingId, toMeetingId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'TransferUserToMeetingRequestMsg';

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  const payload = {
    fromMeetingId,
    toMeetingId,
    userId: requesterUserId,
  };

  Logger.verbose(`userId ${requesterUserId} was transferred from 
  meeting ${fromMeetingId}' to meeting '${toMeetingId}`);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
