import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function startWatchingExternalVideo(options) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'StartExternalVideoPubMsg';

  const { meetingId, requesterUserId } = extractCredentials(this.userId);
  const { externalVideoUrl } = options;

  const user = Users.findOne({ meetingId: meetingId, userId: requesterUserId })

  if (user && user.presenter) {
    check(externalVideoUrl, String);
    const payload = { externalVideoUrl };
    Logger.debug(`User id=${requesterUserId} sending ${EVENT_NAME} url:${externalVideoUrl} for meeting ${meetingId}`);
    return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  }

}
