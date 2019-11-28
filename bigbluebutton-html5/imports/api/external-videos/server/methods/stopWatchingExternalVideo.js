import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';
import RedisPubSub from '/imports/startup/server/redis';

export default function stopWatchingExternalVideo(credentials) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'StopExternalVideoMsg';

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);

  const meeting = Meetings.findOne({ meetingId });
  if (!meeting || meeting.externalVideoUrl === null) return;

  Meetings.update({ meetingId }, { $set: { externalVideoUrl: null } });
  const payload = {};

  Logger.info(`User id=${requesterUserId} stopped sharing an external video for meeting=${meetingId}`);

  RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
