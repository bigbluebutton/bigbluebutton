import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function setPresentationDownloadable(presentationId, downloadable) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SetPresentationDownloadablePubMsg';

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(downloadable, Boolean);
  check(presentationId, String);

  const payload = {
    presentationId,
    podId: 'DEFAULT_PRESENTATION_POD',
    downloadable,
  };

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
