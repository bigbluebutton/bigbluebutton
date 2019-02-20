import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';

export default function setPresentationDownloadable(credentials, presentationId, downloadable) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SetPresentationDownloadablePubMsg';

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(downloadable, Boolean);
  check(presentationId, String);

  const payload = {
    presentationId,
    podId: 'DEFAULT_PRESENTATION_POD',
    downloadable,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
