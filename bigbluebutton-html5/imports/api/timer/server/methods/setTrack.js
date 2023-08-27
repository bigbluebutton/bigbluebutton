import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { isTrackValid } from '/imports/api/timer/server/helpers';

export default function setTrack(track) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SetTrackReqMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);
    check(meetingId, String);
    check(requesterUserId, String);
    check(track, String);

    if (isTrackValid(track)) {
      const payload = {
        track,
      };

      RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
    } else {
      Logger.warn(`User=${requesterUserId} tried to set invalid track '${track}' in meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Setting track: ${err}`);
  }
}
