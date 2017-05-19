import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import Users from '/imports/api/users';

export default function assignPresenter(credentials, userId) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toBBBApps.users;
  const EVENT_NAME = 'assign_presenter_request_message';

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(userId, String);

  if (!isAllowedTo('setPresenter', credentials)) {
    throw new Meteor.Error('not-allowed', `You are not allowed to setPresenter`);
  }

  const User = Users.findOne({
    meetingId,
    userId,
  });
  if (!User) {
    throw new Meteor.Error(
      'user-not-found', `You need a valid user to be able to set presenter`);
  }

  let payload = {
    new_presenter_id: userId,
    new_presenter_name: User.user.name,
    meeting_id: meetingId,
    assigned_by: requesterUserId,
  };

  Logger.verbose(`User '${userId}' setted as presenterby '${
    requesterUserId}' from meeting '${meetingId}'`);

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, payload);
};
