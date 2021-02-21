import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function stopWatchingExternalVideo(options) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'StopExternalVideoPubMsg';

  // when we call stopWatchingExternalVideo as a Meteor method from client side we obtain
  // user credentials from the connection via extractCredentials
  // However, we also call this function from server side (end meeting, user left, etc)
  const { meetingId, requesterUserId } = this.userId ? extractCredentials(this.userId) : options;

  try {
    check(meetingId, String);
    check(requesterUserId, String);
    const user = Users.findOne({ meetingId, userId: requesterUserId });

    if (user && user.presenter) {
      const payload = { };
      Logger.debug(`User id=${requesterUserId} sending ${EVENT_NAME} for meeting ${meetingId}`);
      return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
    }
  } catch (error) {
    Logger.error(`Error on stop sharing an external video for meeting=${meetingId} ${error}`);
  }
}
