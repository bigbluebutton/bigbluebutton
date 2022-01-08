import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';

export default function setWhiteboardMode(whiteboardMode, credentials) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ModifyWBModePubMsg';

  let meetingId = undefined;
  let requesterUserId = undefined;
  try {
    if (this.userId) {
      ( { meetingId, requesterUserId } = extractCredentials(this.userId) );
    } else {
      ( { meetingId, requesterUserId } = credentials );
    }

    check(meetingId, String);
    check(requesterUserId, String);

    const payload = {
      whiteboardMode,
      meetingId,
    };

    return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method setWhiteboardMode ${err.stack}`);
  }
}
