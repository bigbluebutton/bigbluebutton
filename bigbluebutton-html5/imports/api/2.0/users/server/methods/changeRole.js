import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis2x';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/2.0/users';

export default function changeRole(credentials, userId, role) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ChangeUserRoleCmdMsg';

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(userId, String);
  check(role, String);

  const User = Users.findOne({
    meetingId,
    userId,
  });

  if (!User) {
    throw new Meteor.Error(
      'user-not-found', `You need a valid user to be able to set '${role}'`);
  }

  const header = {
    name: EVENT_NAME,
    meetingId,
    userId,
  };

  const payload = {
    userId: userId,
    role: role,
    changedBy: requesterUserId,
  };

  Logger.verbose(`User '${userId}' setted as '${role} role by '${requesterUserId}' from meeting '${meetingId}'`);

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, meetingId, payload, header);
}
