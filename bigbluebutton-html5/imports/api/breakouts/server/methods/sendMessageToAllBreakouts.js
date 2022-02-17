import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function sendMessageToAllBreakouts({ msg }) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SendMessageToAllBreakoutRoomsReqMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    RedisPubSub.publishUserMessage(
      CHANNEL, EVENT_NAME, meetingId, requesterUserId,
      {
        meetingId,
        msg,
      },
    );
  } catch (err) {
    Logger.error(`Exception while invoking method sendMessageToAllBreakouts ${err.stack}`);
  }
}
