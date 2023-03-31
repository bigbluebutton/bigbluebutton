import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function moveUser(fromBreakoutId, toBreakoutId, userIdToMove) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ChangeUserBreakoutReqMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    const userId = userIdToMove || requesterUserId;

    return RedisPubSub.publishUserMessage(
      CHANNEL, EVENT_NAME, meetingId, requesterUserId,
      {
        meetingId,
        fromBreakoutId,
        toBreakoutId,
        userId,
      },
    );
  } catch (err) {
    Logger.error(`Exception while invoking method moveUser ${err.stack}`);
  }
}
