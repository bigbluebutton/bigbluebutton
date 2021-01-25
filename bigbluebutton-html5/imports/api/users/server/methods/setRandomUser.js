import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function setRandomUser() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SelectRandomViewerReqMsg';

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  const payload = {
    requestedBy: requesterUserId,
  };

  RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
