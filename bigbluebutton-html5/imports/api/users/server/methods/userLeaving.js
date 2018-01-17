import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

const OFFLINE_CONNECTION_STATUS = 'offline';

export default function userLeaving(credentials, userId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'UserLeaveReqMsg';

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(userId, String);

  const selector = {
    meetingId,
    userId,
  };

  const User = Users.findOne(selector);
  if (!User) {
    throw new Meteor.Error('user-not-found', `Could not find ${userId} in ${meetingId}: cannot complete userLeaving`);
  }

  if (User.connectionStatus === OFFLINE_CONNECTION_STATUS) {
    return null;
  }

  if (User.validated) {
    const modifier = {
      $set: {
        validated: null,
      },
    };

    const cb = (err) => {
      if (err) {
        return Logger.error(`Invalidating user: ${err}`);
      }

      return Logger.info(`Invalidate user=${userId} meeting=${meetingId}`);
    };

    Users.update(selector, modifier, cb);
  }

  const payload = {
    userId,
    sessionId: meetingId,
  };

  Logger.verbose(`User '${requesterUserId}' left meeting '${meetingId}'`);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
