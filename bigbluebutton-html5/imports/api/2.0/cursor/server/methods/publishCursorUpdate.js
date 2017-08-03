import RedisPubSub from '/imports/startup/server/redis2x';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export default function publishCursorUpdate(credentials, coordinates) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SendCursorPositionPubMsg';

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);
  check(coordinates, {
    xPercent: Number,
    yPercent: Number,
  });

  const header = {
    name: EVENT_NAME,
    userId: requesterUserId,
    meetingId,
  };

  const payload = {
    xPercent: coordinates.xPercent,
    yPercent: coordinates.yPercent,
  };

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, meetingId, payload, header);
}
