import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '../../../common/server/helpers';
import Logger from '/imports/startup/server/logger';

export default function toggleWebcamsOnlyForModerator(webcamsOnlyForModerator) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UpdateWebcamsOnlyForModeratorCmdMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(webcamsOnlyForModerator, Boolean);

    const payload = {
      webcamsOnlyForModerator,
      setBy: requesterUserId,
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method toggleWebcamsOnlyForModerator ${err.stack}`);
  }
}
