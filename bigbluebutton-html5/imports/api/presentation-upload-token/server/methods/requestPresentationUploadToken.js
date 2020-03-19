import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function requestPresentationUploadToken(podId, filename) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'PresentationUploadTokenReqMsg';

  const { meetingId, requesterUserId } = extractCredentials(this.userId);
  check(podId, String);
  check(filename, String);

  const payload = {
    podId,
    filename,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
