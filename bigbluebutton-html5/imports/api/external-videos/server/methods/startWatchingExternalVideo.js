import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';
import RedisPubSub from '/imports/startup/server/redis';

export default function startWatchingExternalVideo(credentials, options) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'StartExternalVideoMsg';

  const { meetingId, requesterUserId } = credentials;
  const { externalVideoUrl } = options;

  check(meetingId, String);
  check(requesterUserId, String);
  check(externalVideoUrl, String);

  Meetings.update({ meetingId }, { $set: { externalVideoUrl } });

  const payload = { externalVideoUrl };

  Logger.info(`User id=${requesterUserId} sharing an external video: ${externalVideoUrl} for meeting ${meetingId}`);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
