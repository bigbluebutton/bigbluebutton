import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function stopWatchingExternalVideo(options) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'StopExternalVideoMsg';

  if (this.userId) {
    options = extractCredentials(this.userId);
  }

  const { meetingId, requesterUserId } = options;

  const meeting = Meetings.findOne({ meetingId });
  if (!meeting || meeting.externalVideoUrl === null) return;

  Meetings.update({ meetingId }, { $set: { externalVideoUrl: null } });
  const payload = {};

  Logger.info(`User id=${requesterUserId} stopped sharing an external video for meeting=${meetingId}`);

  RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
