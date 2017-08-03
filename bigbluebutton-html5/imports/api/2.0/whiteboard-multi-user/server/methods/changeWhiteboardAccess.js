import RedisPubSub from '/imports/startup/server/redis2x';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export default function changeWhiteboardAccess(credentials, multiUser) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ModifyWhiteboardAccessPubMsg';

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);
  check(multiUser, Boolean);

  const header = {
    name: EVENT_NAME,
    userId: requesterUserId,
    meetingId,
  };

  const payload = {
    multiUser,
  };

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, meetingId, payload, header);
}
