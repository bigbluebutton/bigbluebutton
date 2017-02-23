import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import Users from '/imports/api/users';

import setConnectionStatus from '../modifiers/setConnectionStatus';
import listenOnlyToggle from './listenOnlyToggle';

const OFFLINE_CONNECTION_STATUS = 'offline';

export default function userLeaving(credentials, userId) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toBBBApps.users;
  const EVENT_NAME = 'user_leaving_request';

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(userId, String);

  const User = Users.findOne({
    meetingId,
    userId,
  });
  if (!User) {
    throw new Meteor.Error(
      'user-not-found', `You need a valid user to be able to toggle audio`);
  }

  if (User.user.connection_status === OFFLINE_CONNECTION_STATUS) {
    return;
  }

  if (User.user.listenOnly) {
    listenOnlyToggle(credentials, false);
  }

  let payload = {
    meeting_id: meetingId,
    userid: userId,
  };

  Logger.verbose(`User '${requesterUserId}' left meeting '${meetingId}'`);
  return RedisPubSub.publish(CHANNEL, EVENT_NAME, payload);
};
