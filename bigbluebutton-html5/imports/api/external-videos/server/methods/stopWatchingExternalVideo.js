import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';
import RedisPubSub from '/imports/startup/server/redis';

export default function startStream(credentials) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'StopExternalVideoMsg';

  const { meetingId, requesterUserId } = credentials;

  Logger.info(' user sharing a new youtube video: ', credentials);

  check(meetingId, String);
  check(requesterUserId, String);

  Meetings.update({ meetingId }, { $set: { externalVideoUrl: null } });
  const payload = {};

  RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
