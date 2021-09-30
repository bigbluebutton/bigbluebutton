import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function setRandomUser(allowRepeat, refresh) {
  try {
    const REDIS_CONFIG = Meteor.settings.private.redis;
    const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
    const EVENT_NAME = 'SelectRandomViewerReqMsg';

    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(allowRepeat, Boolean);
    check(refresh, Boolean)

    const payload = {
      requestedBy: requesterUserId,
      allowRepeat: allowRepeat,
      refresh: refresh
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method setRandomUser ${err.stack}`);
  }
}
