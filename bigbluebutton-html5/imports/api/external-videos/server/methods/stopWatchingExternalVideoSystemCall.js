import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';
import RedisPubSub from '/imports/startup/server/redis';

export default function stopWatchingExternalVideoSystemCall({ meetingId, requesterUserId }) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'StopExternalVideoPubMsg';

  try {
    check(meetingId, String);
    check(requesterUserId, String);

    // check if there is ongoing video shared
    const meeting = Meetings.findOne({ meetingId });
    if (!meeting || meeting.externalVideoUrl === null) return;

    Logger.info('ExternalVideo::stopWatchingExternalVideo was triggered ', { meetingId, requesterUserId });

    const payload = { };
    return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (error) {
    Logger.error(`Error on stop sharing an external video for meeting=${meetingId} ${error}`);
  }
}
