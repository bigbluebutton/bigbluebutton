import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import Users from '/imports/api/users';

import setConnectionStatus from '../modifiers/setConnectionStatus';
import listenOnlyToggle from './listenOnlyToggle';

export default function userLeaving(credentials, userId) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toBBBApps.meeting;
  const EVENT_NAME = 'user_leaving_request';

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(userId, String);

  // TODO: Should we check if requesterUserId is equal to userId?

  const User = Users.findOne({
    meetingId,
    userId: requesterUserId,
  });
  if (!User) {
    throw new Meteor.Error(
      'user-not-found', `You need a valid user to be able to toggle audio`);
  }

  setConnectionStatus(meetingId, requesterUserId, 'offline');

  if (User.user.listenOnly) {
    listenOnlyToggle(credentials, false);
  }

  let payload = {
    meeting_id: meetingId,
    userid: userId,
  };

  Logger.verbose(`User '${requesterUserId}' ${isJoining ? 'joined' : 'left'} global audio from meeting '${meetingId}'`);

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, payload);
};
