import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function startWatchingExternalVideo(options) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'StartExternalVideoPubMsg';

  const { meetingId, requesterUserId: userId } = extractCredentials(this.userId);
  const { externalVideoUrl } = options;

  try {
    check(meetingId, String);
    check(userId, String);
    check(externalVideoUrl, String);

    const user = Users.findOne({ meetingId, userId }, { presenter: 1 });

    if (user && user.presenter) {
      check(externalVideoUrl, String);
      const payload = { externalVideoUrl };
      Logger.debug(`User id=${userId} sending ${EVENT_NAME} url:${externalVideoUrl} for meeting ${meetingId}`);
      return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, userId, payload);
    }
    Logger.error(`Only presenters are allowed to start external video for a meeting. meeting=${meetingId} userId=${userId}`);
  } catch (error) {
    Logger.error(`Error on sharing an external video: ${externalVideoUrl} ${error}`);
  }
}
