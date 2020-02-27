import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';

export default function requestUpload(credentials, source, filename) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UploadRequestReqMsg';

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(source, String);
  check(filename, String);

  const payload = {
    source,
    filename,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
