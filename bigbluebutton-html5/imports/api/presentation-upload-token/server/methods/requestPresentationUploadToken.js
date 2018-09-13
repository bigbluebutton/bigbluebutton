import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';

export default function requestPresentationUploadToken(credentials, podId, filename) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'PresentationUploadTokenReqMsg';

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(podId, String);
  check(filename, String);

  const payload = {
    podId,
    filename,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
