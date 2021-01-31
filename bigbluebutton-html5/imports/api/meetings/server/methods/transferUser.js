import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';


export default function transferUser(fromMeetingId, toMeetingId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'TransferUserToMeetingRequestMsg';

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  const payload = {
    fromMeetingId,
    toMeetingId,
    userId: requesterUserId,
  };

  Logger.verbose('User was transferred from one meting to another', { requesterUserId, fromMeetingId, toMeetingId });

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
