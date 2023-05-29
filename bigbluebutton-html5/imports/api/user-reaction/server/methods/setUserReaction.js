import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function setUserReaction(emoji, userId = undefined) {
  try {
    const REDIS_CONFIG = Meteor.settings.private.redis;
    const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
    const EVENT_NAME = 'ChangeUserEmojiCmdMsg';

    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(emoji, String);

    const payload = {
      emoji,
      userId: userId ? userId : requesterUserId,
    };

    Logger.verbose('User emoji status updated', {
      emoji, requesterUserId, meetingId,
    });

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method setUserReaction ${err.stack}`);
  }
}
