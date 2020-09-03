import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function startWatchingExternalVideo(options) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'StartExternalVideoMsg';

  const { meetingId, requesterUserId } = extractCredentials(this.userId);
  const { externalVideoUrl } = options;

  try {
    check(meetingId, String);
    check(requesterUserId, String);
    check(externalVideoUrl, String);

    Meetings.update({ meetingId }, { $set: { externalVideoUrl } });

    const payload = { externalVideoUrl };

    Logger.info(`User id=${requesterUserId} sharing an external video: ${externalVideoUrl} for meeting ${meetingId}`);

    return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (error) {
    Logger.error(`Error on sharing an external video: ${externalVideoUrl} ${error}`);
  }
}
