import RedisPubSub from '/imports/startup/server/redis';
import UserReactions from '/imports/api/user-reaction';
import Logger from '/imports/startup/server/logger';

const expireSeconds = Meteor.settings.public.userReaction.expire;
const expireMilliseconds = expireSeconds * 1000

const addUserReactionsObserver = (meetingId) => {
  const meetingUserReactions = UserReactions.find({ meetingId });
  return meetingUserReactions.observe({
    removed(document) {
      const isExpirationTriggeredRemoval = (Date.now() - Date.parse(document.creationDate)) >= expireMilliseconds
      if (isExpirationTriggeredRemoval) {
        notifyExpiredReaction(meetingId, document.userId);
      }
    }
  })
}

const notifyExpiredReaction = (meetingId, userId) => {
  try {
    const REDIS_CONFIG = Meteor.settings.private.redis;
    const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
    const EVENT_NAME = 'UserReactionTimeExpiredCmdMsg';
    const NODE_USER = 'nodeJSapp';
    const emoji = 'none';

    check(meetingId, String);

    const payload = {
      emoji,
      userId,
    };

    Logger.verbose('User emoji status updated due to expiration time', {
      emoji, NODE_USER, meetingId,
    });

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, NODE_USER, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method resetUserReaction ${err.stack}`);
  }
}

export {
  addUserReactionsObserver,
};