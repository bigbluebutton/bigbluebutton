import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function setPresentation(presentationId, podId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SetCurrentPresentationPubMsg';
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(presentationId, String);
  check(podId, String);

  const payload = {
    presentationId,
    podId,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
