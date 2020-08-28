import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function stopWatchingExternalVideo(options) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'StopExternalVideoPubMsg';

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  const user = Users.findOne({ meetingId: meetingId, userId: requesterUserId })

  if (user && user.presenter) {
    const payload = { };
    Logger.debug(`User id=${requesterUserId} sending ${EVENT_NAME} for meeting ${meetingId}`);
    return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  }

}
