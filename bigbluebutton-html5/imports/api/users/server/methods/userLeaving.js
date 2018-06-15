import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';

export default function userLeaving(credentials, userId, connectionId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UserLeaveReqMsg';

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(userId, String);

  const meeting = Meetings.findOne({ meetingId });
  if (!meeting) return false;

  const selector = {
    meetingId,
    userId,
  };

  const user = Users.findOne(selector);

  if (!user) {
    throw new Meteor.Error('user-not-found', `Could not find ${userId} in ${meetingId}: cannot complete userLeaving`);
  }

  // If the current user connection is not the same that triggered the leave we skip
  if (user.connectionId !== connectionId) {
    return false;
  }

  const payload = {
    userId,
    sessionId: meetingId,
  };

  Logger.info(`User '${userId}' is leaving meeting '${meetingId}'`);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
